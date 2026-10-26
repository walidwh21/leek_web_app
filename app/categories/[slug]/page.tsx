import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategorySidebar } from "@/components/category-sidebar";
import { CatalogErrorPanel } from "@/components/catalog-error-panel";
import { stockOf } from "@/lib/catalog/in-stock";
import { createCatalogClient } from "@/lib/supabase/catalog";
import type { Category, ProductWithStock } from "@/lib/types/database";
import { formatMoney } from "@/lib/utils/format";
import { CategoryProductSearch } from "./category-product-search";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = params.slug;
  const qRaw = searchParams.q;
  const q = typeof qRaw === "string" ? qRaw.trim() : "";

  const supabase = createCatalogClient();

  const { data: allCatsData } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });

  const allCategories = (allCatsData ?? []) as Category[];

  const { data: catRow, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (catErr || !catRow) notFound();
  const category = catRow as Category;

  let query = supabase
    .from("products")
    .select("*, inventory(quantity)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .eq("category_id", category.id)
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {allCategories.length > 0 ? (
          <aside className="shrink-0 lg:sticky lg:top-24 lg:w-64 xl:w-72">
            <CategorySidebar categories={allCategories} currentSlug={slug} />
          </aside>
        ) : null}
        <div className="min-w-0 flex-1 space-y-6">
          <Link href="/categories" className="text-sm font-semibold text-leek-800 hover:underline">
            ← All categories
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-leek-800/80">Category</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">{category.name}</h1>
          </div>
          <CatalogErrorPanel message={error.message} />
        </div>
      </div>
    );
  }

  const products = (data ?? []) as ProductWithStock[];

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      {allCategories.length > 0 ? (
        <aside className="shrink-0 lg:sticky lg:top-24 lg:w-64 xl:w-72">
          <CategorySidebar categories={allCategories} currentSlug={slug} />
        </aside>
      ) : null}

      <div className="min-w-0 flex-1 space-y-8">
        <div className="flex flex-col gap-4 border-b border-gray-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/categories" className="text-sm font-semibold text-leek-800 hover:underline">
              ← All categories
            </Link>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-leek-800/80">Category</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">{category.name}</h1>
            <p className="mt-2 text-sm text-muted">Everything we stock in this aisle.</p>
          </div>
          <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-gray-200" />}>
            <CategoryProductSearch categorySlug={slug} initialQuery={q} />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="surface-card border-dashed p-12 text-center text-sm text-muted">
            {q ? `No products match “${q}” here.` : "No products in this category yet."}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const stock = stockOf(p);
              return (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-leek-600/40 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 45vw, 22vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                      <h2 className="line-clamp-2 text-sm font-semibold text-ink">{p.name}</h2>
                      <p className="mt-1 text-sm font-bold tabular-nums text-leek-800">{formatMoney(Number(p.price))}</p>
                      <p className="mt-auto text-[11px] text-muted sm:text-xs">
                        {stock > 0 ? (
                          <span className="text-leek-800">{stock} in stock</span>
                        ) : (
                          <span className="text-amber-700">Out of stock</span>
                        )}{" "}
                        · {p.unit}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
