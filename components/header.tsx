"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppBottomNav } from "@/components/app-bottom-nav";
import { CategoriesNavDropdown } from "@/components/categories-nav-dropdown";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { AUTH_HOME_PATH } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";
import { useCart } from "@/hooks/useCart";
import type { User } from "@supabase/supabase-js";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [greetingName, setGreetingName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const resumePath = useMemo(() => {
    if (!pathname || pathname === "/login" || pathname === "/signup") return AUTH_HOME_PATH;
    return pathname;
  }, [pathname]);

  const loginHref = `/login?next=${encodeURIComponent(resumePath)}`;

  const productsPathActive = (p: string) => p === "/products" || p.startsWith("/products/");
  const categoriesPathActive = (p: string) => p === "/categories" || p.startsWith("/categories/");
  const ordersPathActive = (p: string) => p.startsWith("/orders");
  const homePathActive = (p: string) => p === "/home" || p === "/";

  const guestNavBtn = (active: boolean) =>
    cn(
      "rounded-2xl px-4 py-2 text-sm font-semibold transition",
      active ? "bg-white text-leek-950 shadow-md" : "bg-white/10 text-white hover:bg-white/20",
    );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setGreetingName(null);
      return;
    }
    const meta = user.user_metadata as { full_name?: string } | undefined;
    if (meta?.full_name) {
      setGreetingName(meta.full_name);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    void supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as { full_name: string | null } | null;
        setGreetingName(row?.full_name ?? null);
      });
  }, [user]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const linkClass = (active: boolean) =>
    cn(
      "rounded-xl px-3 py-2 text-sm font-medium transition",
      active ? "bg-white/15 text-white" : "text-emerald-100/90 hover:bg-white/10 hover:text-white",
    );

  const logoHref = user ? AUTH_HOME_PATH : "/";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 gradient-leek-header text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href={logoHref} className="shrink-0 text-xl font-bold tracking-tight text-white">
            LEEK
          </Link>

          {user ? <div className="flex-1 md:hidden" aria-hidden /> : null}

          {!user ? (
            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex"
              aria-label="Browse store"
            >
              <Link
                href="/categories"
                className={guestNavBtn(categoriesPathActive(pathname ?? ""))}
              >
                Categories
              </Link>
              <Link href="/products" className={guestNavBtn(productsPathActive(pathname ?? ""))}>
                Products
              </Link>
              <Link
                href="/cart"
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                  pathname === "/cart"
                    ? "bg-white text-leek-950 shadow-md"
                    : "bg-white/10 text-white hover:bg-white/20",
                )}
                aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
              >
                <CartIcon className="h-5 w-5 shrink-0" />
                <span>Cart</span>
                {count > 0 ? (
                  <span className="min-w-[1.25rem] rounded-full bg-cta px-1.5 text-center text-xs font-bold text-black">
                    {count}
                  </span>
                ) : null}
              </Link>
            </nav>
          ) : (
            <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Main">
              <Link
                href={AUTH_HOME_PATH}
                className={linkClass(homePathActive(pathname ?? "/"))}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={linkClass(productsPathActive(pathname ?? ""))}
              >
                Products
              </Link>
              <CategoriesNavDropdown variant="desktop" />
              <Link href="/orders" className={linkClass(ordersPathActive(pathname ?? ""))}>
                Orders
              </Link>
              <Link
                href="/cart"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                  pathname === "/cart" ? "bg-white/15 text-white" : "text-emerald-100/90 hover:bg-white/10",
                )}
                aria-label={`Shopping cart${count > 0 ? `, ${count} items` : ""}`}
              >
                <CartIcon className="h-5 w-5" />
                <span className="hidden lg:inline">Cart</span>
                {count > 0 ? (
                  <span className="min-w-[1.25rem] rounded-full bg-cta px-1.5 text-center text-xs font-bold text-black">
                    {count}
                  </span>
                ) : null}
              </Link>
            </nav>
          )}

          {!user ? (
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Link
                href={loginHref}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/95 transition hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(resumePath)}`}
                className="rounded-2xl bg-cta px-4 py-2 text-sm font-bold text-black shadow-md transition hover:brightness-95"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <span className="max-w-[10rem] truncate text-right text-sm text-emerald-100" title={user.email ?? ""}>
                {greetingName ? (
                  <>
                    Hi, <span className="font-semibold text-white">{greetingName}</span>
                  </>
                ) : (
                  <span className="text-white/90">{user.email}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-xl border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Log out
              </button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              href="/cart"
              className={cn(
                "relative rounded-xl p-1.5 md:hidden",
                user ? "" : "hidden",
                pathname === "/cart" ? "bg-white/15 text-white" : "text-emerald-100",
              )}
              aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            >
              <CartIcon className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute right-0 top-0 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-cta px-0.5 text-[9px] font-bold leading-none text-black">
                  {count}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="rounded-xl p-1.5 text-white md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {!user ? (
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 px-4 py-3 md:hidden">
            <Link
              href="/categories"
              className={cn("flex items-center justify-center text-center", guestNavBtn(categoriesPathActive(pathname ?? "")))}
            >
              Categories
            </Link>
            <Link
              href="/products"
              className={cn("flex items-center justify-center text-center", guestNavBtn(productsPathActive(pathname ?? "")))}
            >
              Products
            </Link>
            <Link
              href="/cart"
              className={cn(
                "relative flex items-center justify-center gap-1 text-center",
                guestNavBtn(pathname === "/cart"),
              )}
              aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            >
              <CartIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">Cart</span>
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-cta px-0.5 text-[9px] font-bold text-black">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          </div>
        ) : null}

        {open ? (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  <Link
                    href={AUTH_HOME_PATH}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      homePathActive(pathname ?? "") ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      productsPathActive(pathname ?? "") ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Products
                  </Link>
                  <CategoriesNavDropdown variant="mobile" onNavigate={() => setOpen(false)} />
                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      ordersPathActive(pathname ?? "") ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      pathname === "/cart" ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Cart{count > 0 ? ` (${count})` : ""}
                  </Link>
                  <p className="truncate px-3 py-2 text-xs text-emerald-200">
                    {greetingName ? `Hi, ${greetingName}` : user.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="rounded-xl px-3 py-2 text-left text-sm text-emerald-100"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/categories"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      categoriesPathActive(pathname ?? "") ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      productsPathActive(pathname ?? "") ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Products
                  </Link>
                  <CategoriesNavDropdown variant="mobile" onNavigate={() => setOpen(false)} />
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      pathname === "/cart" ? "bg-white/15 text-white" : "text-emerald-100",
                    )}
                  >
                    Cart{count > 0 ? ` (${count})` : ""}
                  </Link>
                  <Link href={loginHref} className="rounded-xl px-3 py-2 text-sm text-white" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link
                    href={`/signup?next=${encodeURIComponent(resumePath)}`}
                    className="rounded-2xl bg-cta px-3 py-2 text-center text-sm font-bold text-black"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>
      <AppBottomNav />
    </>
  );
}
