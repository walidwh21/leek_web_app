import Link from "next/link";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/", label: "Home & categories" },
      { href: "/products", label: "All products" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Sign up" },
      { href: "/orders", label: "Orders" },
    ],
  },
  {
    title: "Checkout flow",
    items: [
      "Add items from product pages",
      "Review cart and quantities",
      "Sign in to place your order",
      "Track status from Orders",
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200/90 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="text-lg font-bold tracking-tight text-leek-950">LEEK</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A focused grocery storefront: catalogue, cart, checkout, and order history — structured for clarity and
              speed.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{col.title}</h2>
              {"links" in col ? (
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm font-medium text-ink transition hover:text-leek-800"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 space-y-2 text-sm text-stone-600">
                  {col.items.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-leek-600" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-stone-200 pt-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} LEEK grocery demo</span>
          <span className="text-stone-400">Built with Next.js & Supabase</span>
        </div>
      </div>
    </footer>
  );
}
