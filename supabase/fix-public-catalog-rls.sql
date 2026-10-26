-- =============================================================================
-- LEEK customer app: allow anonymous (anon) catalogue reads
-- Run in Supabase → SQL Editor if you see: "permission denied for table products"
-- =============================================================================

-- Products: public can read active, non-deleted rows
drop policy if exists "products: public read active" on public.products;
create policy "products: public read active"
  on public.products
  for select
  to anon, authenticated
  using (deleted_at is null and is_active = true);

-- Inventory: public can read quantities (needed for .select('*, inventory(quantity)'))
drop policy if exists "inventory: public read" on public.inventory;
create policy "inventory: public read"
  on public.inventory
  for select
  to anon, authenticated
  using (true);

-- Categories: ensure anon can read (if missing)
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read"
  on public.categories
  for select
  to anon, authenticated
  using (true);

-- Grants (usually already present in Supabase; safe to re-run)
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.inventory to anon, authenticated;
grant select on public.categories to anon, authenticated;
