import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogErrorPanel } from "@/components/catalog-error-panel";
import { CategoryGrid } from "@/components/category-grid";
import { GuestFeaturedGrid } from "@/components/guest-featured-grid";
import { HomeProductSearch } from "@/components/home-product-search";
import { createCatalogClient } from "@/lib/supabase/catalog";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithStock } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const authClient = createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    redirect("/login?next=%2Fhome");
  }

  const meta = user.user_metadata as { full_name?: string } | undefined;
  const name =
    meta?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "there";

  const supabase = createCatalogClient();

  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (catError) {
    return <CatalogErrorPanel message={catError.message} title="We can’t load categories" />;
  }

  const categories = (catData ?? []) as Category[];

  const { data: prodData, error: prodError } = await supabase
    .from("products")
    .select("*, inventory(quantity)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  if (prodError) {
    return <CatalogErrorPanel message={prodError.message} />;
  }

  const featuredProducts = (prodData ?? []) as ProductWithStock[];

  return (
    <div className="space-y-10 pb-4">
      <section className="surface-card overflow-hidden border-leek-800/10 bg-gradient-to-br from-white to-leek-50/50 p-6 text-center md:p-8">
        <div className="mx-auto mb-5 max-w-xl rounded-2xl border border-leek-800/10 bg-white/80 px-4 py-3 text-sm text-muted shadow-sm backdrop-blur-sm md:px-5">
          <p className="text-xs font-bold uppercase tracking-wider text-leek-800">Welcome back</p>
          <p className="mt-1">
            Good to see you, <span className="font-semibold text-ink">{name}</span>. Find products below or search the
            store.
          </p>
        </div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Your LEEK home</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Delivery address is confirmed at checkout.{" "}
          <Link href="/checkout" className="font-semibold text-leek-800 hover:underline">
            Add or change address
          </Link>
        </p>
        <HomeProductSearch />
      </section>

      {categories.length > 0 ? (
        <section aria-labelledby="home-categories-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="home-categories-heading" className="text-xl font-bold text-ink">
              Shop by category
            </h2>
            <Link href="/categories" className="text-sm font-semibold text-leek-800 hover:underline">
              See all
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Featured for you</h2>
          <Link href="/products" className="text-sm font-semibold text-leek-800 hover:underline">
            See all
          </Link>
        </div>
        <GuestFeaturedGrid products={featuredProducts} />
      </section>
    </div>
  );
}
