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
    property_address: str(form, "property_address"),
    bedrooms: num(form, "bedrooms"),
    bathrooms: num(form, "bathrooms"),
    area_m2: num(form, "area_m2"),
    desired_price: num(form, "desired_price"),
    selling_timeline: str(form, "selling_timeline"),
    motivation: str(form, "motivation"),
    photos_needed: form.get("photos_needed") === "on",
    staging_needed: form.get("staging_needed") === "on",
    repairs_needed: form.get("repairs_needed") === "on",
    agent_id: str(form, "agent_id"),
    lead_id: str(form, "lead_id"),
    notes: str(form, "notes"),
  };
}

export async function createSellerIntake(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("seller_intakes").insert({ created_by: profile.id, ...payload(form) });
  revalidatePath("/nguoi-ban");
  revalidatePath("/");
}

export async function updateSellerIntake(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase.from("seller_intakes").update(payload(form)).eq("id", id);
  revalidatePath("/nguoi-ban");
}

export async function deleteSellerIntake(id: string) {
  const supabase = await createClient();
  await supabase.from("seller_intakes").delete().eq("id", id);
  revalidatePath("/nguoi-ban");
}

export async function convertToListing(id: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: intake } = await supabase.from("seller_intakes").select("*").eq("id", id).single();
  if (!intake) return;
  await supabase.from("listings").insert({
    created_by: profile.id,
    seller_intake_id: intake.id,
    address: intake.property_address ?? intake.full_name,
    price: intake.desired_price,
    bedrooms: intake.bedrooms,
    bathrooms: intake.bathrooms,
    area_m2: intake.area_m2,
    agent_id: intake.agent_id,
    status: "Booking",
  });
  revalidatePath("/listings");
  revalidatePath("/nguoi-ban");
}
