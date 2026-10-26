import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-stone-200" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
