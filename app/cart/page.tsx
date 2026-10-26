"use client";

import Image from "next/image";
import Link from "next/link";
import { CartCheckoutCta } from "@/components/cart-checkout-cta";
import { useCart } from "@/hooks/useCart";
import { formatMoney } from "@/lib/utils/format";

export default function CartPage() {
  const { items, setQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="surface-card border-dashed p-12 text-center md:p-14">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">Basket</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-stone-600">Open a product and choose a quantity — your picks stay saved on this device.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-stone-200/90 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">Basket</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Cart</h1>
        </div>
        <button
          type="button"
          onClick={() => clear()}
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <ul className="surface-card divide-y divide-stone-100 overflow-hidden">
        {items.map((line) => (
          <li key={line.productId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-400">—</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${line.productId}`} className="font-semibold text-stone-900 hover:underline">
                {line.name}
              </Link>
              <p className="text-sm text-stone-500">
                {formatMoney(line.price)} / {line.unit}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`qty-${line.productId}`}>
                Quantity for {line.name}
              </label>
              <input
                id={`qty-${line.productId}`}
                type="number"
                min={1}
                max={line.maxQty}
                value={line.quantity}
                onChange={(e) => setQuantity(line.productId, Number(e.target.value))}
                className="w-20 rounded-lg border border-stone-300 px-2 py-1 text-center text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(line.productId)}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="text-right font-semibold tabular-nums text-stone-900 sm:w-28">
              {formatMoney(line.price * line.quantity)}
            </div>
          </li>
        ))}
      </ul>

      <CartCheckoutCta />
    </div>
  );
}
