"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils/cn";

type Props = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  unit: string;
  stock: number;
  className?: string;
  /** Tighter padding and text for dense grids */
  size?: "default" | "compact";
};

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  unit,
  stock,
  className,
  size = "default",
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (stock < 1) {
    return (
      <p className={cn("font-medium text-amber-800", size === "compact" ? "text-xs" : "text-sm")} role="status">
        Out of stock
      </p>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "rounded-2xl bg-leek-800 font-bold text-white shadow-md transition hover:bg-leek-600 focus:outline-none focus:ring-2 focus:ring-leek-600/40 focus:ring-offset-2",
        size === "compact" ? "px-3 py-1.5 text-xs" : "px-6 py-3 text-sm",
        className,
      )}
      onClick={() => {
        addItem({
          productId,
          name,
          price,
          imageUrl,
          unit,
          maxQty: stock,
          quantity: 1,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2000);
      }}
    >
      {added ? (size === "compact" ? "Added" : "Added to cart") : size === "compact" ? "Add" : "Add to cart"}
    </button>
  );
}
