"use client";

import { useSearchParams } from "next/navigation";

const COPY: Record<string, string> = {
  checkout:
    "Sign in to complete your checkout. Your cart stays saved on this device until you clear it.",
  orders: "Sign in to view your orders and live delivery updates.",
};

export function LoginReasonBanner() {
  const reason = useSearchParams().get("reason");
  if (!reason || !COPY[reason]) return null;
  return (
    <p
      className="mb-6 max-w-md rounded-xl border border-leek-600/25 bg-leek-50 px-4 py-3 text-center text-sm text-leek-950"
      role="status"
    >
      {COPY[reason]}
    </p>
  );
}
