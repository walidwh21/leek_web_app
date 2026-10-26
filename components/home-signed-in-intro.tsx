import Link from "next/link";

type Props = {
  greetingName: string | null;
  email: string | null;
};

export function HomeSignedInIntro({ greetingName, email }: Props) {
  const line =
    greetingName?.trim() ||
    (email ? email.split("@")[0] : null) ||
    "there";

  return (
    <section
      className="surface-card border-emerald-100/60 bg-gradient-to-br from-white to-emerald-50/40 p-6 md:p-8"
      aria-labelledby="signed-in-home-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80">Your store</p>
          <h1 id="signed-in-home-heading" className="mt-1 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Welcome back, {line}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
            Use Categories in the bar above to browse by aisle, or open Products for the full catalogue — then orders and
            cart.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-2"
          aria-label="Quick links"
        >
          {(
            [
              { href: "/products", label: "Products" },
              { href: "/orders", label: "Orders" },
              { href: "/cart", label: "Cart" },
            ] as const
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-emerald-300 hover:text-emerald-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
