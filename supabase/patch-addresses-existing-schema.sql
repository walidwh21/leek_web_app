-- =============================================================================
-- LEEK — Fix "permission denied for table addresses" (Supabase)
--
-- Run this ENTIRE file in: Supabase Dashboard → SQL Editor → Run
--
-- Your dashboard may show policies like:
--   "addresses: owner access" (ALL)  and  "addresses: admin full access" (ALL)
-- Those are replaced below with explicit TO authenticated + split commands so
-- INSERT/UPDATE always match PostgREST + RLS correctly.
--
-- Also fixes the most common root cause: missing GRANT for role "authenticated".
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Privileges — required before RLS policies matter for the API
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant usage on schema public to anon;

-- Table-level rights for logged-in users (PostgREST uses role "authenticated")
grant all privileges on table public.addresses to authenticated;
grant all privileges on table public.addresses to service_role;

-- ---------------------------------------------------------------------------
-- 2) Remove ALL existing policies on addresses (any name)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 3) RLS — explicit role "authenticated" (recommended for Supabase)
-- ---------------------------------------------------------------------------

-- Customer: own rows (JWT required — auth.uid() must match user_id)
create policy "addresses_owner_select"
  on public.addresses
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "addresses_owner_insert"
  on public.addresses
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "addresses_owner_update"
  on public.addresses
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_owner_delete"
  on public.addresses
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Admin (requires public.is_admin() from your LEEK schema)
create policy "addresses_admin_select"
  on public.addresses
  for select
  to authenticated
  using (public.is_admin());

create policy "addresses_admin_insert"
  on public.addresses
  for insert
  to authenticated
  with check (public.is_admin());

create policy "addresses_admin_update"
  on public.addresses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "addresses_admin_delete"
  on public.addresses
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4) Verify (optional — run separately; should list authenticated + privileges)
-- ---------------------------------------------------------------------------
-- select grantee, privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public' and table_name = 'addresses'
-- order by grantee, privilege_type;
--
-- select policyname, cmd, roles::text
-- from pg_policies
-- where schemaname = 'public' and tablename = 'addresses';
