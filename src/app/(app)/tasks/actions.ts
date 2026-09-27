"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  const s = v === null ? "" : String(v).trim();
  return s === "" ? null : s;
}

export async function createTask(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("tasks").insert({
    created_by: profile.id,
    title: String(form.get("title")),
    due_date: str(form, "due_date"),
    priority: String(form.get("priority") || "Trung bình"),
    assigned_to: str(form, "assigned_to"),
  });
  revalidatePath("/tasks");
}

export async function toggleTask(id: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ done, done_at: done ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/tasks");
}
