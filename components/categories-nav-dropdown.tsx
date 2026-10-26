"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Mobile drawer: flat list + close drawer on navigate */
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function CategoriesNavDropdown({ variant, onNavigate }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase
      .from("categories")
      .select("id,name,slug")
      .eq("is_active", true)
      .order("position", { ascending: true })
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  useEffect(() => {
    if (!open || variant !== "desktop") return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, variant]);

  const categoryPathActive = pathname?.startsWith("/categories/");

  const linkClass = (slug: string) =>
    cn(
      variant === "mobile" ? "rounded-lg px-3 py-2 text-sm font-medium" : "block px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-900",
      pathname === `/categories/${slug}` || pathname === `/categories/${encodeURIComponent(slug)}`
        ? variant === "mobile"
          ? "bg-emerald-800 text-white"
          : "bg-emerald-900 text-white"
        : variant === "mobile"
          ? "text-emerald-100"
          : "",
    );

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-0.5 border-t border-emerald-800/80 pt-2">
        <span className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
          Categories
        </span>
        {categories.length === 0 ? (
          <p className="px-3 py-2 text-xs text-emerald-400">No categories yet</p>
        ) : (
          categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              onClick={() => onNavigate?.()}
              className={linkClass(c.slug)}
            >
              {c.name}
            </Link>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          categoryPathActive
            ? "bg-emerald-800 text-white"
            : "text-emerald-200 hover:bg-emerald-900 hover:text-white",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Categories
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-[60] mt-1 max-h-[min(70vh,20rem)] min-w-[14rem] overflow-y-auto rounded-xl border border-emerald-800 bg-emerald-950 py-1 shadow-lg"
        >
          {categories.length === 0 ? (
            <p className="px-3 py-2 text-xs text-emerald-300">No categories yet</p>
          ) : (
            categories.map((c) => (
              <Link
                key={c.id}
                role="menuitem"
                href={`/categories/${encodeURIComponent(c.slug)}`}
                onClick={() => setOpen(false)}
                className={linkClass(c.slug)}
              >
                {c.name}
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
