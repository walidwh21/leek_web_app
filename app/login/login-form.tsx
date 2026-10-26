"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { AUTH_HOME_PATH } from "@/lib/constants/app";
import { safeNextPath } from "@/lib/utils/safe-next";

type Mode = "password" | "magic" | "phone";

function appOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = useMemo(() => safeNextPath(searchParams.get("next"), AUTH_HOME_PATH), [searchParams]);

  const [mode, setMode] = useState<Mode>("password");
  const [forgotView, setForgotView] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    window.location.href = next;
  }

  async function sendPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const origin = appOrigin();
    if (!origin) {
      setLoading(false);
      setError("Set NEXT_PUBLIC_SITE_URL in .env.local so we can send the reset link (e.g. http://localhost:3001).");
      return;
    }
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("If an account exists for that email, we sent a link to reset your password. Check your inbox.");
  }

  async function signInMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const origin = appOrigin();
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl, shouldCreateUser: true },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Check your email for the magic link.");
  }

  async function signInPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Check your phone for the SMS code. Enter it in the prompt if shown, or use the Supabase auth flow.");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-ink">Log in</h1>
        <p className="mt-1 text-sm text-muted">Password, magic link, or phone OTP (if enabled in Supabase).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["password", "Password"],
            ["magic", "Magic link"],
            ["phone", "Phone OTP"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setMode(k);
              setForgotView(false);
              setError(null);
              setMessage(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === k ? "bg-leek-800 text-white" : "bg-gray-100 text-ink hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "password" && forgotView ? (
        <form onSubmit={sendPasswordReset} className="space-y-4">
          <p className="text-sm text-muted">
            Enter the email for your account. We’ll send a link to choose a new password.
          </p>
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-leek-800 py-2.5 text-sm font-semibold text-white hover:bg-leek-950 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotView(false);
              setError(null);
              setMessage(null);
            }}
            className="w-full text-sm font-medium text-muted hover:text-ink"
          >
            ← Back to sign in
          </button>
        </form>
      ) : null}

      {mode === "password" && !forgotView ? (
        <form onSubmit={signInPassword} className="space-y-4">
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-ink"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setForgotView(true);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-medium text-leek-800 hover:text-leek-950 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-leek-800 py-2.5 text-sm font-semibold text-white hover:bg-leek-950 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : null}

      {mode === "magic" ? (
        <form onSubmit={signInMagicLink} className="space-y-4">
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Email me a magic link"}
          </button>
        </form>
      ) : null}

      {mode === "phone" ? (
        <form onSubmit={signInPhoneOtp} className="space-y-4">
          <label className="block text-sm font-medium text-ink">
            Phone (E.164, e.g. +2126…)
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full rounded-xl bg-leek-800 py-2.5 text-sm font-semibold text-white hover:bg-leek-950 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send SMS code"}
          </button>
        </form>
      ) : null}

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
        No account?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-leek-800 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
