-- =====================================================================
-- LEEK customer app - setup that the app relies on
-- Run AFTER leek_admin/supabase/schema.sql (same Supabase project).
-- Review against your real database first; it is written from what the
-- app code calls: create_order RPC, own-data RLS, realtime on orders.
-- Run in: Supabase -> SQL Editor
-- =====================================================================

grant usage on schema public to anon, authenticated;

-- ---------- Addresses: make sure all columns the app uses exist ----------
alter table public.addresses add column if not exists label       text not null default 'Home';
alter table public.addresses add column if not exists line2       text;
alter table public.addresses add column if not exists postal_code text not null default '';
alter table public.addresses add column if not exists country     text not null default 'MA';
alter table public.addresses add column if not exists latitude    double precision;
alter table public.addresses add column if not exists longitude   double precision;
alter table public.addresses add column if not exists is_default  boolean not null default false;
alter table public.addresses add column if not exists updated_at  timestamptz not null default now();

-- ---------- Row Level Security: customers see only their own data ----------
grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, update          on public.profiles  to authenticated;
grant select on public.orders, public.order_items, public.payments to authenticated;

drop policy if exists "addresses_owner_select" on public.addresses;
create policy "addresses_owner_select" on public.addresses
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "addresses_owner_insert" on public.addresses;
create policy "addresses_owner_insert" on public.addresses
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "addresses_owner_update" on public.addresses;
create policy "addresses_owner_update" on public.addresses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "addresses_owner_delete" on public.addresses;
create policy "addresses_owner_delete" on public.addresses
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "profiles_owner_select" on public.profiles;
create policy "profiles_owner_select" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "profiles_owner_insert" on public.profiles;
create policy "profiles_owner_insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select" on public.orders
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "order_items_owner_select" on public.order_items;
create policy "order_items_owner_select" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "payments_owner_select" on public.payments;
create policy "payments_owner_select" on public.payments
  for select to authenticated using (user_id = auth.uid());

-- Customers never write orders directly: only through create_order() below.

-- ---------- Public catalogue (anonymous browsing) ----------
-- See fix-public-catalog-rls.sql, or run it right after this file.

-- ---------- Profile row for every new account ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill accounts created before this trigger existed
insert into public.profiles (id, full_name, phone)
select id, raw_user_meta_data ->> 'full_name', phone from auth.users
on conflict (id) do nothing;

-- ---------- create_order(): the checkout RPC ----------
-- Called by app/checkout/checkout-client.tsx with:
--   p_address_id, p_items [{product_id, quantity}], p_payment_method, p_notes
-- Returns {order_id, payment_id, total}.
-- Error messages match lib/utils/rpc-errors.ts:
--   not_authenticated, product_not_found, product_unavailable, insufficient_stock
create or replace function public.create_order(
  p_address_id     uuid,
  p_items          jsonb,
  p_payment_method public.payment_method,
  p_notes          text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_order_id   uuid;
  v_payment_id uuid;
  v_total      numeric(10, 2) := 0;
  v_item       jsonb;
  v_pid        uuid;
  v_qty        integer;
  v_prod       public.products%rowtype;
  v_inv        public.inventory%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;

  if not exists (select 1 from public.addresses where id = p_address_id and user_id = v_uid) then
    raise exception 'address_not_found';
  end if;

  insert into public.orders (user_id, address_id, status, total_amount, notes)
  values (v_uid, p_address_id, 'pending', 0, nullif(btrim(p_notes), ''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item ->> 'product_id')::uuid;
    v_qty := (v_item ->> 'quantity')::integer;

    if v_qty is null or v_qty < 1 then
      raise exception 'invalid_quantity';
    end if;

    select * into v_prod from public.products where id = v_pid;
    if not found then
      raise exception 'product_not_found';
    end if;
    if not v_prod.is_active or v_prod.deleted_at is not null then
      raise exception 'product_unavailable';
    end if;

    -- lock the stock row so two checkouts cannot oversell the same item
    select * into v_inv from public.inventory where product_id = v_pid for update;
    if not found or v_inv.quantity < v_qty then
      raise exception 'insufficient_stock';
    end if;

    update public.inventory set quantity = quantity - v_qty where id = v_inv.id;

    insert into public.order_items
      (order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal)
    values
      (v_order_id, v_pid, v_prod.name, v_prod.price, v_qty, v_prod.price * v_qty);

    v_total := v_total + v_prod.price * v_qty;
  end loop;

  update public.orders set total_amount = v_total where id = v_order_id;

  insert into public.payments (order_id, user_id, method, status, amount)
  values (
    v_order_id, v_uid, p_payment_method,
    case p_payment_method
      when 'cod'  then 'pending_cod'::public.payment_status
      when 'wire' then 'pending_wire'::public.payment_status
      else 'pending'::public.payment_status
    end,
    v_total
  )
  returning id into v_payment_id;

  insert into public.order_status_history (order_id, old_status, new_status, changed_by, note)
  values (v_order_id, null, 'pending', v_uid, 'Order placed');

  return jsonb_build_object('order_id', v_order_id, 'payment_id', v_payment_id, 'total', v_total);
end $$;

revoke all on function public.create_order(uuid, jsonb, public.payment_method, text) from public, anon;
grant execute on function public.create_order(uuid, jsonb, public.payment_method, text) to authenticated;

-- ---------- Realtime: order status updates on /orders ----------
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;   -- already added
  when undefined_object then null;   -- publication missing
end $$;
