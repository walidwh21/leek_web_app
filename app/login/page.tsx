import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { LoginReasonBanner } from "./login-reason-banner";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function LoginPage({ searchParams }: Props) {
  const err = searchParams.error;
  const banner =
    err === "auth"
      ? "Sign-in link expired or invalid. Try again."
      : err === "unauthorized"
        ? "You are not allowed to access that page."
        : null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
      {banner ? (
        <p className="mb-6 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          {banner}
        </p>
      ) : null}
      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-stone-200" />}>
        <LoginReasonBanner />
        <LoginForm />
      </Suspense>
    </div>
  );
}
