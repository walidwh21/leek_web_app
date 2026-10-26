"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function CategoryProductSearch({
  categorySlug,
  initialQuery,
}: {
  categorySlug: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  const apply = useCallback(() => {
    const q = value.trim();
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    startTransition(() => {
      router.push(`/categories/${categorySlug}?${next.toString()}`);
    });
  }, [value, params, router, categorySlug]);

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      role="search"
    >
      <label htmlFor="cat-product-search" className="sr-only">
        Search in category
      </label>
      <input
        id="cat-product-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Filter by name…"
        className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "…" : "Filter"}
      </button>
    </form>
  );
}
