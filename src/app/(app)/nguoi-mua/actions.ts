"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  const s = v === null ? "" : String(v).trim();
  return s === "" ? null : s;
}
function num(form: FormData, key: string): number | null {
  const v = form.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function payload(form: FormData) {
  return {
    full_name: String(form.get("full_name")),
    email: str(form, "email"),
    phone: str(form, "phone"),
    budget_min: num(form, "budget_min"),
    budget_max: num(form, "budget_max"),
    preferred_areas: str(form, "preferred_areas"),
    property_type: str(form, "property_type"),
    bedrooms: str(form, "bedrooms"),
    bathrooms: str(form, "bathrooms"),
    timeline: str(form, "timeline"),
    must_have_features: str(form, "must_have_features"),
    agent_id: str(form, "agent_id"),
    lead_id: str(form, "lead_id"),
    notes: str(form, "notes"),
  };
}

export async function createBuyerIntake(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("buyer_intakes").insert({ created_by: profile.id, ...payload(form) });
  revalidatePath("/nguoi-mua");
  revalidatePath("/");
}

export async function updateBuyerIntake(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase.from("buyer_intakes").update(payload(form)).eq("id", id);
  revalidatePath("/nguoi-mua");
}

export async function deleteBuyerIntake(id: string) {
  const supabase = await createClient();
  await supabase.from("buyer_intakes").delete().eq("id", id);
  revalidatePath("/nguoi-mua");
}
