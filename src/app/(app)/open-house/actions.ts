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

export async function createOpenHouse(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("open_houses").insert({
    created_by: profile.id,
    listing_id: String(form.get("listing_id")),
    date: String(form.get("date")),
    start_time: str(form, "start_time"),
    end_time: str(form, "end_time"),
    visitors_count: num(form, "visitors_count") ?? 0,
    leads_captured: num(form, "leads_captured") ?? 0,
    notes: str(form, "notes"),
  });
  revalidatePath("/open-house");
  revalidatePath("/");
}

export async function deleteOpenHouse(id: string) {
  const supabase = await createClient();
  await supabase.from("open_houses").delete().eq("id", id);
  revalidatePath("/open-house");
}
