"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
      setChecking(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Password updated. Redirecting…");
    router.push("/");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600 shadow-sm">
        Checking your session…
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">Link not valid</h1>
        <p className="text-sm text-stone-600">
          This reset link is invalid or has expired. Open the latest email we sent you, or request a new password reset
          from the log in page.
        </p>
        <Link
          href="/login"
          className="inline-flex w-full justify-center rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Set a new password</h1>
        <p className="mt-1 text-sm text-stone-600">Choose a strong password for your account.</p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
          {message}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          New password
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Confirm password
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-600">
        <Link href="/login" className="text-emerald-700 hover:underline">
          Cancel and return to log in
        </Link>
      </p>
    </div>
  );
}
