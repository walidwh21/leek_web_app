"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { ProductWithStock } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/format";

function stockOf(p: ProductWithStock): number {
  const inv = p.inventory;
  if (!inv) return 0;
  const row = Array.isArray(inv) ? inv[0] : inv;
  return row?.quantity ?? 0;
}

export function GuestFeaturedGrid({
  products,
  compact = true,
}: {
  products: ProductWithStock[];
  /** Denser cards and smaller actions when many products */
  compact?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-white/80 py-12 text-center text-sm text-muted">
        No products to show yet.
      </p>
    );
  }

  return (
    <ul
      className={
        compact
          ? "grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {products.map((p) => {
        const stock = stockOf(p);
        return (
          <li key={p.id} className="surface-card flex flex-col overflow-hidden transition hover:shadow-lg">
            <Link
              href={`/products/${p.id}`}
              className={cn("relative bg-gray-100", compact ? "aspect-[4/3]" : "aspect-square")}
            >
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={compact ? "(max-width:640px) 45vw, 18vw" : "(max-width: 640px) 50vw, 25vw"}
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
              )}
            </Link>
            <div className={cn("flex flex-1 flex-col", compact ? "gap-1.5 p-2.5 sm:p-3" : "gap-3 p-4")}>
              <div>
                <Link
                  href={`/products/${p.id}`}
                  className={cn(
                    "line-clamp-2 font-semibold text-ink hover:text-leek-800",
                    compact ? "text-xs sm:text-sm" : "text-base",
                  )}
                >
                  {p.name}
                </Link>
                <p
                  className={cn(
                    "mt-0.5 font-bold tabular-nums text-leek-800",
                    compact ? "text-sm" : "text-lg",
                  )}
                >
                  {formatMoney(Number(p.price))}
                </p>
                <p className={cn("text-muted", compact ? "text-[10px] sm:text-xs" : "text-xs")}>{p.unit}</p>
              </div>
              <AddToCartButton
                productId={p.id}
                name={p.name}
                price={Number(p.price)}
                imageUrl={p.image_url}
                unit={p.unit}
                stock={stock}
                size={compact ? "compact" : "default"}
                className={cn(
                  "w-full",
                  compact
                    ? "rounded-xl bg-leek-800 text-white shadow-sm hover:bg-leek-600"
                    : "rounded-2xl bg-leek-800 py-2.5 text-sm font-bold text-white shadow-md hover:bg-leek-600",
                )}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
