-- =============================================================================
-- LEEK — fix "permission denied for table addresses" (checkout / customer app)
--
-- If you already applied the full LEEK grocery schema (owner + admin policies on
-- addresses), prefer: patch-addresses-existing-schema.sql — it matches that setup
-- and fixes missing GRANTs.
--
-- How to run:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file → Run
--   3. Hard-refresh the app and ensure you are LOGGED IN (checkout uses your JWT)
--
-- Requires: column addresses.user_id with the same type as auth.uid() (usually uuid)
-- =============================================================================

-- Schema usage (often missing on fresh projects)
grant usage on schema public to authenticated;

-- Remove every existing RLS policy on this table (avoids conflicts / duplicate names)
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'addresses'
  loop
    execute format('drop policy if exists %I on public.addresses', pol.policyname);
  end loop;
end $$;

alter table public.addresses enable row level security;

-- One row per auth user
create policy "addresses_select_own"
  on public.addresses
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "addresses_insert_own"
  on public.addresses
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "addresses_update_own"
  on public.addresses
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_delete_own"
  on public.addresses
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on table public.addresses to authenticated;

-- If user_id is text but stores UUID strings, swap the USING / WITH CHECK lines to:
--   using (user_id = auth.uid()::text)
--   with check (user_id = auth.uid()::text)
