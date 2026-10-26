import Image from "next/image";
import Link from "next/link";
import type { ProductWithStock } from "@/lib/types/database";
import { formatMoney } from "@/lib/utils/format";

function stockOf(p: ProductWithStock): number {
  const inv = p.inventory;
  if (!inv) return 0;
  const row = Array.isArray(inv) ? inv[0] : inv;
  return row?.quantity ?? 0;
}

export function HomeProductGrid({ products }: { products: ProductWithStock[] }) {
  if (products.length === 0) {
    return (
      <div className="surface-card border-dashed p-10 text-center text-sm text-muted">
        No products in this selection yet.
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => {
        const stock = stockOf(p);
        return (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:-translate-y-0.5 hover:border-leek-600/30 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-stone-100">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">No image</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-semibold text-ink transition group-hover:text-leek-800">{p.name}</h2>
                <p className="mt-1 text-base font-bold tabular-nums text-leek-800">{formatMoney(Number(p.price))}</p>
                <p className="mt-auto text-xs text-muted">
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
  );
}
