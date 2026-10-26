"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  createCheckoutAddress,
  loadCheckoutAddresses,
  updateCheckoutAddress,
} from "./address-actions";
import { useCart } from "@/hooks/useCart";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Address, CreateOrderResult, PaymentMethod } from "@/lib/types/database";
import { formatMoney } from "@/lib/utils/format";
import { messageForCreateOrderError } from "@/lib/utils/rpc-errors";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on delivery" },
  { value: "card", label: "Card" },
  { value: "wire", label: "Bank transfer" },
];

export function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateOrderResult | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: "MA",
    is_default: false,
  });

  const loadAddresses = useCallback(async () => {
    const { data, error: err } = await loadCheckoutAddresses();
    if (err) {
      setError(err);
      setAddresses([]);
      setSelectedId("");
    } else {
      setError(null);
      setAddresses(data);
      setSelectedId((prev) => {
        if (prev && data.some((a) => a.id === prev)) return prev;
        return data[0]?.id ?? "";
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      label: form.label,
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      postal_code: form.postal_code,
      country: form.country,
      is_default: form.is_default,
    };
    if (editingId) {
      const { error: err } = await updateCheckoutAddress(editingId, payload);
      if (err) {
        setError(err);
        return;
      }
    } else {
      const { id, error: err } = await createCheckoutAddress(payload);
      if (err) {
        setError(err);
        return;
      }
      if (id) setSelectedId(id);
    }
    setShowNew(false);
    setEditingId(null);
    setForm({
      label: "",
      line1: "",
      line2: "",
      city: "",
      postal_code: "",
      country: "MA",
      is_default: false,
    });
    await loadAddresses();
  }

  function startEdit(a: Address) {
    setEditingId(a.id);
    setShowNew(true);
    setForm({
      label: a.label,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      postal_code: a.postal_code,
      country: a.country,
      is_default: a.is_default,
    });
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!selectedId) {
      setError("Choose or add a shipping address.");
      return;
    }
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const p_items = items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    }));
    const { data, error: rpcErr } = await supabase.rpc("create_order", {
      p_address_id: selectedId,
      p_items,
      p_payment_method: payment,
      p_notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (rpcErr) {
      setError(messageForCreateOrderError(rpcErr));
      return;
    }
    const result = data as unknown as CreateOrderResult;
    setSuccess(result);
    clear();
    router.refresh();
  }

  if (items.length === 0 && !success) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <h1 className="text-2xl font-semibold text-stone-900">Nothing to checkout</h1>
        <Link href="/cart" className="mt-4 inline-block text-emerald-700 underline">
          Back to cart
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-emerald-900">Order placed</h1>
        <p className="mt-2 text-emerald-800">Thank you! We received your order.</p>
        <dl className="mt-6 space-y-2 text-left text-sm text-emerald-900">
          <div className="flex justify-between">
            <dt>Order ID</dt>
            <dd className="font-mono text-xs">{success.order_id}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Total</dt>
            <dd className="font-semibold">{formatMoney(Number(success.total))}</dd>
          </div>
        </dl>
        <Link
          href="/orders"
          className="mt-8 inline-block rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <h1 className="text-3xl font-bold text-stone-900">Checkout</h1>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Shipping address</h2>
        {loading ? (
          <p className="mt-4 text-sm text-stone-500">Loading addresses…</p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {addresses.map((a) => (
                <li key={a.id}>
                  <label className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                    <input
                      type="radio"
                      name="address"
                      value={a.id}
                      checked={selectedId === a.id}
                      onChange={() => setSelectedId(a.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-stone-900">{a.label}</span>
                      {a.is_default ? (
                        <span className="ml-2 rounded bg-stone-200 px-1.5 text-xs">Default</span>
                      ) : null}
                      <p className="mt-1 text-stone-600">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}
                        <br />
                        {a.postal_code} {a.city}, {a.country}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-emerald-700 hover:underline"
                        onClick={() => startEdit(a)}
                      >
                        Edit
                      </button>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  label: "",
                  line1: "",
                  line2: "",
                  city: "",
                  postal_code: "",
                  country: "MA",
                  is_default: false,
                });
                setShowNew((s) => !s);
              }}
              className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
            >
              {showNew ? "Cancel new address" : "+ Add address"}
            </button>
            {showNew ? (
              <form onSubmit={saveAddress} className="mt-6 grid gap-4 border-t border-stone-100 pt-6">
                <p className="text-sm font-medium text-stone-700">
                  {editingId ? "Edit address" : "New address"}
                </p>
                <input
                  required
                  placeholder="Label (e.g. Home)"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Address line 1"
                  value={form.line1}
                  onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={form.line2}
                  onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="Postal code"
                    value={form.postal_code}
                    onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                    className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
                <input
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                  />
                  Set as default address
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-800 py-2 text-sm font-semibold text-white hover:bg-stone-900"
                >
                  {editingId ? "Save address" : "Save address"}
                </button>
              </form>
            ) : null}
          </>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Payment</h2>
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Payment method</legend>
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={payment === opt.value}
                onChange={() => setPayment(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
        <label className="mt-4 block text-sm font-medium text-stone-700">
          Order notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <form onSubmit={placeOrder}>
          <button
            type="submit"
            disabled={submitting || loading}
            className="mt-6 w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </form>
      </section>
    </div>
  );
}
