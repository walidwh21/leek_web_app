import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CategorySidebar } from "@/components/category-sidebar";
import { ProductRelatedGrid } from "@/components/product-related-grid";
import { stockOf } from "@/lib/catalog/in-stock";
import { createCatalogClient } from "@/lib/supabase/catalog";
import type { Category, ProductWithStock } from "@/lib/types/database";
import { formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

async function fetchRelatedProducts(
  supabase: ReturnType<typeof createCatalogClient>,
  product: ProductWithStock,
): Promise<ProductWithStock[]> {
  const out: ProductWithStock[] = [];
  const seen = new Set<string>([product.id]);

  if (product.category_id) {
    const { data } = await supabase
      .from("products")
      .select("*, inventory(quantity)")
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name")
      .limit(8);
    for (const row of data ?? []) {
      out.push(row as ProductWithStock);
      seen.add(row.id);
    }
  }

  if (out.length < 8) {
    const { data: more } = await supabase
      .from("products")
      .select("*, inventory(quantity)")
      .eq("is_active", true)
      .is("deleted_at", null)
      .neq("id", product.id)
      .order("name")
      .limit(24);
    for (const row of more ?? []) {
      if (out.length >= 8) break;
      if (seen.has(row.id)) continue;
      out.push(row as ProductWithStock);
      seen.add(row.id);
    }
  }

  return out;
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(quantity)")
    .eq("id", params.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as ProductWithStock;
  const stock = stockOf(product);

  const [catRes, relatedProducts] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("position", { ascending: true }),
    fetchRelatedProducts(supabase, product),
  ]);

  const categories = (catRes.error ? [] : catRes.data ?? []) as Category[];
  const currentCategorySlug =
    product.category_id != null
      ? (categories.find((c) => c.id === product.category_id)?.slug ?? "")
      : "";

  const relatedTitle = product.category_id
    ? "More in this aisle"
    : "More to explore";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-1">
        <Link href="/products" className="inline-block text-sm font-semibold text-emerald-800 hover:text-emerald-950">
          ← All products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-100 shadow-sm">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400">No image</div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">Product</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">{product.name}</h1>
            <p className="mt-4 text-3xl font-bold tabular-nums text-emerald-800">{formatMoney(Number(product.price))}</p>
            <p className="mt-2 text-sm text-stone-600">
              Unit: <span className="font-medium">{product.unit}</span>
              {" · "}
              {stock > 0 ? (
                <span className="text-emerald-700">{stock} available</span>
              ) : (
                <span className="text-amber-700">Out of stock</span>
              )}
            </p>
            {product.description ? (
              <div className="mt-6 max-w-none text-stone-700">
                <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
              </div>
            ) : (
              <p className="mt-6 text-stone-500">No description.</p>
            )}

            <div className="mt-10">
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={Number(product.price)}
                imageUrl={product.image_url}
                unit={product.unit}
                stock={stock}
              />
            </div>
          </div>
        </div>
      </div>

      {categories.length > 0 ? (
        <aside
          aria-label="Browse categories"
          className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 p-3 shadow-sm sm:p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 lg:hidden">Categories</p>
            <CategorySidebar categories={categories} currentSlug={currentCategorySlug} />
          </div>
        </aside>
      ) : null}

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <ProductRelatedGrid products={relatedProducts} title={relatedTitle} />
      </div>
    </div>
  );
}
