"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/types/database";

export type CheckoutAddressForm = {
  label: string;
  line1: string;
  line2: string;
  country: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

export async function loadCheckoutAddresses(): Promise<{ data: Address[]; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: "Not signed in" };
  }
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: (data ?? []) as Address[], error: null };
}

export async function createCheckoutAddress(
  form: CheckoutAddressForm,
): Promise<{ id?: string; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not signed in" };
  }
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: form.label,
      line1: form.line1,
      line2: form.line2.trim() === "" ? null : form.line2,
      city: form.city,
      postal_code: form.postal_code,
      country: form.country.trim() || "MA",
      is_default: form.is_default,
    })
    .select("id")
    .single();
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/checkout");
  return { id: data?.id as string | undefined, error: null };
}

export async function updateCheckoutAddress(
  addressId: string,
  form: CheckoutAddressForm,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not signed in" };
  }
  const { error } = await supabase
    .from("addresses")
    .update({
      label: form.label,
      line1: form.line1,
      line2: form.line2.trim() === "" ? null : form.line2,
      city: form.city,
      postal_code: form.postal_code,
      country: form.country,
      is_default: form.is_default,
    })
    .eq("id", addressId)
    .eq("user_id", user.id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/checkout");
  return { error: null };
}
