"use client";

import { ProductSearchField } from "@/components/header-search";

export function HeroProductSearch() {
  return (
    <div className="mx-auto w-full max-w-lg px-1">
      <ProductSearchField
        formClassName="w-full"
        inputId="hero-product-search"
        inputClassName="border-white/25 bg-white py-3 pl-4 pr-4 text-base shadow-lg md:py-3.5"
        placeholder="What are you looking for?"
      />
    </div>
  );
}
