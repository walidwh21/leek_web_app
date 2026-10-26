"use client";

import Link from "next/link";
import { HomeFeatureIcon } from "@/components/home-feature-icon";
import { HOME_FEATURES } from "@/lib/content/home-features";

/**
 * Slim horizontal feature strip for guests on the home page — mirrors the hero messaging in a scannable bar.
 */
export function GuestFeatureBar() {
  return (
    <nav
      className="surface-card overflow-x-auto border-emerald-100/80 shadow-sm"
      aria-label="What you can do before signing in"
    >
      <ul className="flex min-w-0 items-stretch divide-x divide-stone-100 sm:justify-between">
        {HOME_FEATURES.map((f) => {
          const href = f.barHref;
          return (
            <li key={f.key} className="min-w-0 flex-1">
              <Link
                href={href}
                className="flex h-full min-h-[3.25rem] flex-col items-center justify-center gap-1 px-3 py-3 text-center transition hover:bg-emerald-50/80 sm:flex-row sm:gap-2 sm:px-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <HomeFeatureIcon name={f.icon} className="h-4 w-4 text-emerald-800" />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-stone-800 sm:text-xs">{f.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
