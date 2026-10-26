"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/auth-storage-key";

/**
 * **Browser** Supabase client (client components only).
 * Session is persisted via HTTP-only cookies; `middleware.ts` refreshes the session.
 *
 * **Server Components / Route Handlers / Server Actions:** import
 * `createClient` from `@/lib/supabase/server` (do not import this file there).
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getSupabaseAuthCookieOptions(),
  });
}
