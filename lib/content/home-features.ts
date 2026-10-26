export type HomeFeatureIconName = "store" | "cart" | "lock" | "leaf";

export const HOME_FEATURES = [
  {
    key: "browse",
    title: "Browse as a guest",
    shortLabel: "Browse free",
    body: "Explore categories and products without creating an account.",
    icon: "store" as const,
    barHref: "/#shop" as const,
  },
  {
    key: "cart",
    title: "Smart cart",
    shortLabel: "Device cart",
    body: "Your basket stays on this device until you clear it or check out.",
    icon: "cart" as const,
    barHref: "/cart" as const,
  },
  {
    key: "auth",
    title: "Sign in when it matters",
    shortLabel: "Checkout login",
    body: "Log in at checkout or to view past orders and delivery status.",
    icon: "lock" as const,
    barHref: "/login?next=%2Fcheckout&reason=checkout" as const,
  },
  {
    key: "fresh",
    title: "Live-friendly stack",
    shortLabel: "Full catalogue",
    body: "Built for fresh inventory, clear pricing, and simple reordering.",
    icon: "leaf" as const,
    barHref: "/products" as const,
  },
] as const;

export type HomeFeature = (typeof HOME_FEATURES)[number];
