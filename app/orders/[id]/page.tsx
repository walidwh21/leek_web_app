import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrdersRealtime } from "@/components/orders-realtime";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, Payment } from "@/lib/types/database";
import { formatDate, formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function OrderDetailPage({ params }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orders/${params.id}`)}&reason=orders`,
    );
  }

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (orderErr || !orderRow) notFound();
  const order = orderRow as Order;
  if (order.user_id !== user.id) notFound();

  const [{ data: items }, { data: payment }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id).order("created_at"),
    supabase.from("payments").select("*").eq("order_id", order.id).maybeSingle(),
  ]);

  const lines = (items ?? []) as OrderItem[];
  const pay = payment as Payment | null;

  return (
    <>
      <OrdersRealtime userId={user.id} />
      <div className="space-y-8">
        <Link href="/orders" className="text-sm font-medium text-emerald-700 hover:underline">
          ← All orders
        </Link>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Order</h1>
              <p className="mt-1 font-mono text-xs text-stone-500">{order.id}</p>
              <p className="mt-2 text-sm text-stone-600">{formatDate(order.created_at)}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold capitalize text-emerald-900">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-6 text-2xl font-bold text-emerald-800">{formatMoney(Number(order.total_amount))}</p>
          {order.notes ? (
            <p className="mt-4 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
              <span className="font-medium">Notes: </span>
              {order.notes}
            </p>
          ) : null}
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Items</h2>
          <ul className="mt-4 divide-y divide-stone-100">
            {lines.map((li) => (
              <li key={li.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-stone-900">{li.product_name_snapshot}</p>
                  <p className="text-stone-500">
                    {formatMoney(Number(li.unit_price_snapshot))} × {li.quantity}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatMoney(Number(li.subtotal))}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Payment</h2>
          {pay ? (
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Method</dt>
                <dd className="font-medium uppercase">{pay.method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Status</dt>
                <dd className="font-medium">{pay.status.replace(/_/g, " ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Amount</dt>
                <dd className="font-semibold">{formatMoney(Number(pay.amount))}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-stone-500">No payment record.</p>
          )}
        </section>
      </div>
    </>
  );
}
