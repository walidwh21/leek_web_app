"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { AUTH_HOME_PATH } from "@/lib/constants/app";
import { safeNextPath } from "@/lib/utils/safe-next";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => safeNextPath(searchParams.get("next"), AUTH_HOME_PATH), [searchParams]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() || undefined },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
            : undefined,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Check your email to confirm your account if required, then log in. Your cart is still saved on this device.");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-md"
    >
      <h1 className="text-2xl font-bold text-ink">Sign up</h1>
      <p className="text-sm text-muted">
        Browse and add to cart without an account. Sign up when you are ready to checkout.
      </p>
      <label className="block text-sm font-medium text-ink">
        Full name
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          autoComplete="name"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          autoComplete="email"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Password
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          autoComplete="new-password"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-leek-800 py-2.5 text-sm font-semibold text-white hover:bg-leek-950 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-leek-50 p-3 text-sm text-leek-950" role="status">
          {message}
        </p>
      ) : null}
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-leek-800 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
