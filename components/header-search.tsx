"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type FieldProps = {
  formClassName?: string;
  inputClassName?: string;
  inputId?: string;
  placeholder?: string;
};

/**
 * Shared product search — navigates to `/products?q=…`.
 */
export function ProductSearchField({
  formClassName,
  inputClassName,
  inputId = "product-search",
  placeholder = "Search products…",
}: FieldProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    if (t) {
      router.push(`/products?q=${encodeURIComponent(t)}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <form onSubmit={onSubmit} className={formClassName}>
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        id={inputId}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-white/95 px-4 py-2.5 text-sm text-ink shadow-md placeholder:text-muted focus:border-cta/40 focus:outline-none focus:ring-2 focus:ring-cta/30",
          inputClassName,
        )}
      />
    </form>
  );
}

/** @deprecated Prefer ProductSearchField or HeroProductSearch — kept for any external imports */
export function HeaderSearch({ className, placeholder }: { className?: string; placeholder?: string }) {
  return (
    <ProductSearchField
      formClassName={className}
      inputId="header-search"
      placeholder={placeholder}
    />
  );
}
