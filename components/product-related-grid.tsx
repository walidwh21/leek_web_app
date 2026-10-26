import Image from "next/image";
import Link from "next/link";
import { stockOf } from "@/lib/catalog/in-stock";
import type { ProductWithStock } from "@/lib/types/database";
import { formatMoney } from "@/lib/utils/format";

type Props = {
  products: ProductWithStock[];
  title: string;
};

export function ProductRelatedGrid({ products, title }: Props) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading" className="space-y-4 border-t border-stone-200/90 pt-10">
      <h2 id="related-products-heading" className="text-lg font-bold tracking-tight text-stone-900">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
                      sizes="(max-width: 640px) 45vw, 18vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-ink">{p.name}</h3>
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
    </section>
  );
}
