import "server-only";

import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerCookieClient } from "./server";

/**
 * Server-side client for **public catalogue** pages (home, product list, category, product detail).
 *
 * - If `SUPABASE_SERVICE_ROLE_KEY` is set: uses the service role (bypasses RLS). Use only on the server;
 *   never expose this key as `NEXT_PUBLIC_*`.
 * - Otherwise: uses the normal cookie/session client (anon or logged-in user). That requires RLS policies
 *   that allow `anon` to `SELECT` active products and inventory (see `supabase/fix-public-catalog-rls.sql`).
 */
export function createCatalogClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url && serviceKey) {
    return createSupabaseJsClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createServerCookieClient() as unknown as SupabaseClient;
}
