"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { formatMoney } from "@/lib/utils/format";
import { useCart } from "@/hooks/useCart";

export function CartCheckoutCta() {
  const { subtotal } = useCart();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (signedIn === null) {
    return (
      <div className="flex flex-col items-end gap-4 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-stone-200" aria-hidden />
        <div className="h-11 w-48 animate-pulse rounded-xl bg-stone-200" aria-hidden />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:items-end">
        <p className="text-lg text-ink sm:text-right">
          Subtotal: <span className="font-bold text-leek-800">{formatMoney(subtotal)}</span>
        </p>
        <p className="text-sm text-muted sm:text-right">
          Sign in to place your order. Your cart is stored on this device and will be there after you log in.
        </p>
        <Link
          href="/login?next=%2Fcheckout&reason=checkout"
          className="inline-flex justify-center rounded-2xl bg-cta px-8 py-3 text-center text-sm font-bold text-black shadow-md hover:brightness-95"
        >
          Sign in to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-4 rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-lg text-ink">
        Subtotal: <span className="font-bold text-leek-800">{formatMoney(subtotal)}</span>
      </p>
      <Link
        href="/checkout"
        className="inline-flex rounded-2xl bg-cta px-8 py-3 text-sm font-bold text-black shadow-md hover:brightness-95"
      >
        Checkout
      </Link>
    </div>
  );
}
