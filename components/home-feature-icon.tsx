import type { HomeFeatureIconName } from "@/lib/content/home-features";

type Props = {
  name: HomeFeatureIconName;
  className?: string;
};

export function HomeFeatureIcon({ name, className = "h-5 w-5 text-emerald-700" }: Props) {
  switch (name) {
    case "store":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2m-14 0v10a1 1 0 001 1h10a1 1 0 001-1V10M9 14h6"
          />
        </svg>
      );
    case "cart":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    case "lock":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      );
    case "leaf":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 19a7 7 0 007-7V5a7 7 0 00-7 7v7zm0 0h7m-7 0l3-3"
          />
        </svg>
      );
    default:
      return null;
  }
}
