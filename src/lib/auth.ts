import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import type { Profile } from "@/lib/types";

const DEMO_PROFILE: Profile = {
  id: "00000000-0000-0000-0000-000000000000",
  team_id: null,
  full_name: "Người dùng xem thử",
  email: "demo@crm.local",
  phone: null,
  role: "admin",
  title: "Quản trị viên",
  active: true,
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export async function requireProfile(): Promise<Profile> {
  if (isDemoMode()) return DEMO_PROFILE;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error || !profile) redirect("/dang-nhap");
  return profile as Profile;
}
