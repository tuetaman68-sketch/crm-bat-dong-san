"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function createCampaign(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const name = String(form.get("name"));
  const template = String(form.get("message_template"));
  const leadIds = form.getAll("lead_ids").map(String);

  const { data: campaign, error } = await supabase
    .from("zalo_campaigns")
    .insert({ created_by: profile.id, name, message_template: template })
    .select("id")
    .single();

  if (!error && campaign && leadIds.length > 0) {
    await supabase.from("zalo_campaign_recipients").insert(leadIds.map((leadId) => ({ campaign_id: campaign.id, lead_id: leadId })));
  }

  revalidatePath("/gui-zalo");
  if (campaign) redirect(`/gui-zalo/${campaign.id}`);
}

export async function markRecipientStatus(id: string, campaignId: string, sent: boolean) {
  const supabase = await createClient();
  await supabase
    .from("zalo_campaign_recipients")
    .update({ status: sent ? "Đã gửi" : "Chưa gửi", sent_at: sent ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath(`/gui-zalo/${campaignId}`);
  revalidatePath("/gui-zalo");
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  await supabase.from("zalo_campaigns").delete().eq("id", id);
  revalidatePath("/gui-zalo");
}
