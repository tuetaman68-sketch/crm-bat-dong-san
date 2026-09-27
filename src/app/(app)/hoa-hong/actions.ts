"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePaymentStatus(id: string, status: string) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { payment_status: status };
  if (status === "Đã thanh toán") payload.payout_date = new Date().toISOString().slice(0, 10);
  await supabase.from("commissions").update(payload).eq("id", id);
  revalidatePath("/hoa-hong");
  revalidatePath("/");
}
