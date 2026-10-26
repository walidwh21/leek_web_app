import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogErrorPanel } from "@/components/catalog-error-panel";
import { createCatalogClient } from "@/lib/supabase/catalog";
import { stockOf } from "@/lib/catalog/in-stock";
import type { ProductWithStock } from "@/lib/types/database";
import { formatMoney } from "@/lib/utils/format";
import { ProductSearch } from "./product-search";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const qRaw = searchParams.q;
  const q = typeof qRaw === "string" ? qRaw.trim() : "";

  const supabase = createCatalogClient();
  let query = supabase
    .from("products")
    .select("*, inventory(quantity)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">Catalogue</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">All products</h1>
        </div>
        <CatalogErrorPanel message={error.message} />
      </div>
    );
  }

  const products = (data ?? []) as ProductWithStock[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-stone-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">Catalogue</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">All products</h1>
          <p className="mt-2 text-sm text-stone-600">Search by name, compare price and stock.</p>
        </div>
        <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-stone-200" />}>
          <ProductSearch initialQuery={q} />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="surface-card border-dashed p-12 text-center text-sm text-stone-600">
          {q ? `No products match “${q}”.` : "No products available."}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                        sizes="(max-width: 640px) 45vw, 20vw"
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
  );
}
