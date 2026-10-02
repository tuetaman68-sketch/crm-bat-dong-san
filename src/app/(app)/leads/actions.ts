"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  const s = v === null ? "" : String(v).trim();
  return s === "" ? null : s;
}

function leadPayload(form: FormData) {
  return {
    full_name: String(form.get("full_name")),
    phone: str(form, "phone"),
    email: str(form, "email"),
    lead_type: String(form.get("lead_type") || "Người mua"),
    source: str(form, "source"),
    status: String(form.get("status") || "Lead mới"),
    next_follow_up: str(form, "next_follow_up"),
    assigned_agent_id: str(form, "assigned_agent_id"),
    notes: str(form, "notes"),
    consent_marketing: form.get("consent_marketing") === "on",
  };
}

export async function createLead(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("leads").insert({ created_by: profile.id, ...leadPayload(form) });
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function updateLead(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase.from("leads").update(leadPayload(form)).eq("id", id);
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/leads");
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/leads");
}
