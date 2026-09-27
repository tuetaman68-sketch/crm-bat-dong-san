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

function listingPayload(form: FormData) {
  return {
    address: String(form.get("address")),
    ward: str(form, "ward"),
    province: str(form, "province"),
    property_type: str(form, "property_type"),
    status: String(form.get("status") || "Booking"),
    price: num(form, "price"),
    bedrooms: num(form, "bedrooms"),
    bathrooms: num(form, "bathrooms"),
    area_m2: num(form, "area_m2"),
    legal_status: str(form, "legal_status"),
    land_plot_no: str(form, "land_plot_no"),
    map_sheet_no: str(form, "map_sheet_no"),
    cert_no: str(form, "cert_no"),
    drive_link: str(form, "drive_link"),
    agent_id: str(form, "agent_id"),
    listed_at: str(form, "listed_at"),
    expires_at: str(form, "expires_at"),
  };
}

export async function createListing(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("listings").insert({ created_by: profile.id, ...listingPayload(form) });
  revalidatePath("/listings");
  revalidatePath("/");
}

export async function updateListing(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase.from("listings").update(listingPayload(form)).eq("id", id);
  revalidatePath("/listings");
}

export async function deleteListing(id: string) {
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", id);
  revalidatePath("/listings");
}
