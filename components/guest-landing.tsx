import Link from "next/link";
import { CategoryGrid } from "@/components/category-grid";
import { GuestFeaturedGrid } from "@/components/guest-featured-grid";
import { HeroProductSearch } from "@/components/hero-product-search";
import type { Category, ProductWithStock } from "@/lib/types/database";

type Props = {
  categories: Category[];
  featuredProducts: ProductWithStock[];
};

export function GuestLanding({ categories, featuredProducts }: Props) {
  return (
    <div className="space-y-14 pb-8">
      <section className="relative overflow-hidden rounded-2xl gradient-leek-header px-6 py-12 text-center text-white shadow-lg md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.12),transparent_50%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <div className="mb-6 w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-center backdrop-blur-sm md:px-8 md:py-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta">Welcome to LEEK</p>
            <p className="mt-2 text-sm leading-relaxed text-white/90 md:text-base">
              We&apos;re glad you&apos;re here. Browse categories and products freely — create an account only when
              you&apos;re ready to checkout.
            </p>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Groceries delivered in minutes
          </h1>
          <p className="mt-4 max-w-xl text-lg text-emerald-100/95 md:text-xl">
            Fresh picks, fast checkout. Build your basket on this device — no login required to explore.
          </p>

          <div className="mt-8 w-full">
            <HeroProductSearch />
            <p className="mt-2 text-xs text-white/70">Search by product name — we&apos;ll take you to the catalogue.</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex rounded-2xl bg-cta px-8 py-3.5 text-base font-bold text-black shadow-md transition hover:brightness-95"
            >
              Start shopping
            </Link>
            <Link
              href="/cart"
              className="inline-flex rounded-2xl border border-white/30 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="cat-prev-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="cat-prev-heading" className="text-xl font-bold text-ink">
              Shop by category
            </h2>
            <Link href="/categories" className="text-sm font-semibold text-leek-800 hover:underline">
              See all
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </section>
      ) : null}

      <section aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="mb-6 text-xl font-bold text-ink">
          Featured products
        </h2>
        <GuestFeaturedGrid products={featuredProducts} />
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex rounded-2xl border-2 border-leek-800 bg-white px-8 py-3 text-sm font-bold text-leek-950 transition hover:bg-leek-50"
          >
            Browse all products
          </Link>
        </div>
      </section>
    </div>
  );
}
