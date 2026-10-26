"use client";

import Link from "next/link";
import { ProductSearchField } from "@/components/header-search";

export function HomeProductSearch() {
  return (
    <div className="mt-6 space-y-4">
      <div className="mx-auto w-full max-w-lg">
        <ProductSearchField
          inputId="home-product-search"
          inputClassName="border border-gray-200 bg-white py-3 text-sm text-ink shadow-md placeholder:text-muted focus:border-leek-600 focus:ring-2 focus:ring-leek-600/20 md:py-3.5 md:text-base"
          placeholder="What are you looking for?"
        />
        <p className="mt-2 text-center text-xs text-muted">Search by name — opens the full catalogue.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
        <Link href="/categories" className="text-leek-800 underline-offset-2 hover:underline">
          Categories
        </Link>
        <span className="text-gray-300" aria-hidden>
          ·
        </span>
        <Link href="/products" className="text-leek-800 underline-offset-2 hover:underline">
          All products
        </Link>
      </div>
    </div>
  );
}
