"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTeam(form: FormData) {
  const supabase = await createClient();
  await supabase.from("teams").insert({ name: String(form.get("name")) });
  revalidatePath("/nhan-su");
}

export async function updateProfileRole(id: string, role: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/nhan-su");
}

export async function updateProfileTeam(id: string, teamId: string) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ team_id: teamId || null })
    .eq("id", id);
  revalidatePath("/nhan-su");
}

export async function setTeamManager(teamId: string, managerId: string) {
  const supabase = await createClient();
  await supabase
    .from("teams")
    .update({ manager_id: managerId || null })
    .eq("id", teamId);
  revalidatePath("/nhan-su");
}

export async function toggleActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ active }).eq("id", id);
  revalidatePath("/nhan-su");
}

export async function updateProfileTitle(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ title: String(form.get("title") || "").trim() || null, phone: String(form.get("phone") || "").trim() || null })
    .eq("id", id);
  revalidatePath("/nhan-su");
}
