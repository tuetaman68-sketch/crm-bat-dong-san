"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

function num(form: FormData, key: string): number {
  const v = form.get(key);
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export async function createCampaign(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("marketing_campaigns").insert({
    created_by: profile.id,
    name: String(form.get("name")),
    platform: String(form.get("platform")),
    period_month: String(form.get("period_month")) + "-01",
    budget: num(form, "budget"),
    spend: num(form, "spend"),
    leads_generated: num(form, "leads_generated"),
    deals_closed: num(form, "deals_closed"),
    revenue_generated: num(form, "revenue_generated"),
  });
  revalidatePath("/marketing");
  revalidatePath("/");
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  await supabase.from("marketing_campaigns").delete().eq("id", id);
  revalidatePath("/marketing");
}
