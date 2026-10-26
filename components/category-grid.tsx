import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

type Props = {
  categories: Category[];
  /** Match GuestFeaturedGrid compact density */
  compact?: boolean;
  className?: string;
};

export function CategoryGrid({ categories, compact = true, className }: Props) {
  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-white/80 py-12 text-center text-sm text-muted">
        No categories yet.
      </p>
    );
  }

  return (
    <ul
      className={cn(
        compact
          ? "grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {categories.map((c) => (
        <li key={c.id} className="surface-card flex flex-col overflow-hidden transition hover:shadow-lg">
          <Link href={`/categories/${encodeURIComponent(c.slug)}`} className="relative block aspect-[4/3] bg-gray-100">
            {c.image_url ? (
              <Image
                src={c.image_url}
                alt=""
                fill
                className="object-cover"
                sizes={compact ? "(max-width:640px) 45vw, 18vw" : "(max-width: 640px) 50vw, 25vw"}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-leek-50 to-white text-xs font-semibold text-leek-800">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </Link>
          <div className={cn("flex flex-1 flex-col", compact ? "gap-1 p-2.5 sm:p-3" : "gap-2 p-4")}>
            <Link
              href={`/categories/${encodeURIComponent(c.slug)}`}
              className={cn(
                "line-clamp-2 font-semibold text-ink transition hover:text-leek-800",
                compact ? "text-xs sm:text-sm" : "text-base",
              )}
            >
              {c.name}
            </Link>
            <p className={cn("font-semibold text-leek-800", compact ? "text-xs" : "text-sm")}>Shop aisle →</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
