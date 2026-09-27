"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  const s = v === null ? "" : String(v).trim();
  return s === "" ? null : s;
}

export async function createAppointment(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("appointments").insert({
    created_by: profile.id,
    title: String(form.get("title")),
    type: String(form.get("type") || "Dẫn xem nhà"),
    client_name: str(form, "client_name"),
    lead_id: str(form, "lead_id"),
    listing_id: str(form, "listing_id"),
    date: String(form.get("date")),
    start_time: str(form, "start_time"),
    end_time: str(form, "end_time"),
    agent_id: str(form, "agent_id"),
  });
  revalidatePath("/lich-hen");
  revalidatePath("/");
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("appointments").update({ status }).eq("id", id);
  revalidatePath("/lich-hen");
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  await supabase.from("appointments").delete().eq("id", id);
  revalidatePath("/lich-hen");
}
