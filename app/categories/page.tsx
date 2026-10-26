import Link from "next/link";
import { CategoryGrid } from "@/components/category-grid";
import { CatalogErrorPanel } from "@/components/catalog-error-panel";
import { createCatalogClient } from "@/lib/supabase/catalog";
import type { Category } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage() {
  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) {
    return <CatalogErrorPanel message={error.message} title="We can’t load categories" />;
  }

  const categories = (data ?? []) as Category[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-muted">Choose an aisle — same layout as on the home page.</p>
        <p className="mt-3 text-sm text-muted">
          <Link href="/products" className="font-semibold text-leek-800 hover:underline">
            Browse all products
          </Link>
        </p>
      </div>

      <CategoryGrid categories={categories} />
    </div>
  );
}
