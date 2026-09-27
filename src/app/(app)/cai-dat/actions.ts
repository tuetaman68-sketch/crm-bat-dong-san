"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOOKUPS } from "@/lib/lookups";

export async function seedDefaultLookups() {
  const supabase = await createClient();
  const { count } = await supabase.from("lookups").select("id", { count: "exact", head: true });
  if (count && count > 0) return;

  const rows: { category: string; value: string; sort_order: number }[] = [];
  for (const [category, values] of Object.entries(DEFAULT_LOOKUPS)) {
    values.forEach((value, i) => rows.push({ category, value, sort_order: i + 1 }));
  }
  await supabase.from("lookups").insert(rows);
  revalidatePath("/cai-dat");
}

export async function addLookup(category: string, value: string) {
  const supabase = await createClient();
  const { count } = await supabase.from("lookups").select("id", { count: "exact", head: true }).eq("category", category);
  await supabase.from("lookups").insert({ category, value, sort_order: (count ?? 0) + 1 });
  revalidatePath("/cai-dat");
}

export async function deleteLookup(id: string) {
  const supabase = await createClient();
  await supabase.from("lookups").delete().eq("id", id);
  revalidatePath("/cai-dat");
}
