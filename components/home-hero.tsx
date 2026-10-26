import { HomeFeatureIcon } from "@/components/home-feature-icon";
import { HOME_FEATURES } from "@/lib/content/home-features";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-10 text-emerald-50 shadow-xl shadow-emerald-950/20 md:px-10 md:py-12"
      aria-labelledby="home-hero-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90">Grocery delivery</p>
        <h1 id="home-hero-heading" className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Fresh groceries,{" "}
          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">one LEEK</span>{" "}
          at a time
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-100/90">
          Shop by category, compare prices, and fill your cart at your pace. Create an account when you’re ready to
          check out or track orders.
        </p>
      </div>

      <ul className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_FEATURES.map((f) => (
          <li
            key={f.key}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800/80">
              <HomeFeatureIcon name={f.icon} className="h-5 w-5 text-emerald-200" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-white">{f.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
