import Link from "next/link";
import { redirect } from "next/navigation";
import { OrdersRealtime } from "@/components/orders-realtime";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types/database";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Forders&reason=orders");
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
        {error.message}
      </p>
    );
  }

  const orders = (data ?? []) as Order[];

  return (
    <>
      <OrdersRealtime userId={user.id} />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Your orders</h1>
          <p className="mt-1 text-stone-600">Status updates in real time.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-600">
            You have no orders yet.{" "}
            <Link href="/products" className="font-medium text-emerald-700 underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-stone-500">{o.id.slice(0, 8)}…</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium capitalize text-stone-800">
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{formatDate(o.created_at)}</p>
                  <p className="mt-2 text-lg font-bold text-emerald-800">{formatMoney(Number(o.total_amount))}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
