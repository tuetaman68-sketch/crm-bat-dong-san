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

function dealPayload(form: FormData) {
  return {
    deal_name: String(form.get("deal_name")),
    client_name: str(form, "client_name"),
    listing_id: str(form, "listing_id"),
    price: num(form, "price"),
    stage: String(form.get("stage") || "Tiềm Năng"),
    priority: String(form.get("priority") || "Trung bình"),
    expected_close_date: str(form, "expected_close_date"),
    commission_rate: num(form, "commission_rate_pct") !== null ? Number(form.get("commission_rate_pct")) / 100 : 0.02,
    split_rate: num(form, "split_rate_pct") !== null ? Number(form.get("split_rate_pct")) / 100 : 0.7,
    agent_id: str(form, "agent_id"),
    notes: str(form, "notes"),
  };
}

export async function createDeal(form: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("deals").insert({ created_by: profile.id, ...dealPayload(form) });
  revalidatePath("/deals");
  revalidatePath("/");
}

export async function updateDeal(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase.from("deals").update(dealPayload(form)).eq("id", id);
  revalidatePath("/deals");
  revalidatePath("/");
}

export async function updateDealStage(id: string, stage: string) {
  const supabase = await createClient();
  const { data: deal } = await supabase.from("deals").update({ stage }).eq("id", id).select("*").single();

  if (stage === "Hoàn Tất Giao Dịch" && deal) {
    await supabase.from("commissions").insert({
      created_by: deal.created_by,
      agent_id: deal.agent_id,
      deal_id: deal.id,
      close_date: new Date().toISOString().slice(0, 10),
      gross_commission: deal.gross_commission,
      broker_split: deal.split_rate,
      net_commission: deal.net_commission,
      payment_status: "Đang chờ",
    });
  }
  revalidatePath("/deals");
  revalidatePath("/hoa-hong");
  revalidatePath("/");
}

export async function deleteDeal(id: string) {
  const supabase = await createClient();
  await supabase.from("deals").delete().eq("id", id);
  revalidatePath("/deals");
}
