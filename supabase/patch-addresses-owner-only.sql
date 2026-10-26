-- =============================================================================
-- LEEK — addresses: owner access ONLY (no is_admin policies)
--
-- Use this if patch-addresses-existing-schema.sql fails on the admin policies
-- because public.is_admin() is missing or errors.
--
-- Run in Supabase → SQL Editor (full file).
-- =============================================================================

grant usage on schema public to authenticated;
grant all privileges on table public.addresses to authenticated;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'addresses'
  loop
    execute format('drop policy if exists %I on public.addresses', pol.policyname);
  end loop;
end $$;

alter table public.addresses enable row level security;

create policy "addresses_owner_select"
  on public.addresses for select to authenticated
  using (user_id = auth.uid());

create policy "addresses_owner_insert"
  on public.addresses for insert to authenticated
  with check (user_id = auth.uid());

create policy "addresses_owner_update"
  on public.addresses for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_owner_delete"
  on public.addresses for delete to authenticated
  using (user_id = auth.uid());
