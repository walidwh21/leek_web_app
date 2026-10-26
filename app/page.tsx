import { redirect } from "next/navigation";
import { CatalogErrorPanel } from "@/components/catalog-error-panel";
import { GuestLanding } from "@/components/guest-landing";
import { createCatalogClient } from "@/lib/supabase/catalog";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithStock } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const authClient = createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (user) {
    redirect("/home");
  }

  const supabase = createCatalogClient();

  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (catError) {
    return (
      <div className="space-y-6">
        <CatalogErrorPanel message={catError.message} title="We can’t load categories" />
      </div>
    );
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
    return (
      <div className="space-y-6">
        <CatalogErrorPanel message={prodError.message} />
      </div>
    );
  }

  const featuredProducts = (prodData ?? []) as ProductWithStock[];

  return <GuestLanding categories={categories} featuredProducts={featuredProducts} />;
}
