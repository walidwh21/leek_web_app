import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

type Props = {
  categories: Category[];
  currentSlug: string;
};

export function CategorySidebar({ categories, currentSlug }: Props) {
  return (
    <nav aria-label="Categories" className="flex flex-col gap-2">
      <p className="hidden text-xs font-semibold uppercase tracking-wide text-muted lg:block">Browse aisles</p>
      <ul className="flex flex-row gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const active = c.slug === currentSlug;
          return (
            <li key={c.id} className="shrink-0 lg:shrink">
              <Link
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition lg:w-full lg:px-3 lg:py-2.5",
                  active
                    ? "border-leek-800 bg-leek-800 text-white shadow-md"
                    : "border-gray-200 bg-white text-ink hover:border-leek-600/40 hover:bg-leek-50",
                )}
              >
                <span className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 lg:block">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="36px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-leek-800">
                      {c.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="max-w-[10rem] truncate lg:max-w-none">{c.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
