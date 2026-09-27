import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lookup } from "@/lib/types";

export async function getLookups(supabase: SupabaseClient, category: string): Promise<Lookup[]> {
  const { data } = await supabase.from("lookups").select("*").eq("category", category).order("sort_order");
  return (data as Lookup[]) ?? [];
}

export async function getAllLookups(supabase: SupabaseClient): Promise<Lookup[]> {
  const { data } = await supabase.from("lookups").select("*").order("category").order("sort_order");
  return (data as Lookup[]) ?? [];
}

export const LOOKUP_CATEGORIES: { key: string; label: string }[] = [
  { key: "lead_source", label: "Nguồn khách tiềm năng" },
  { key: "lead_type", label: "Loại khách" },
  { key: "property_type", label: "Loại bất động sản" },
  { key: "legal_status", label: "Tình trạng pháp lý" },
  { key: "appointment_type", label: "Loại lịch hẹn" },
  { key: "marketing_platform", label: "Kênh marketing" },
];

export const DEFAULT_LOOKUPS: Record<string, string[]> = {
  lead_source: [
    "Trang web",
    "Facebook",
    "Zalo",
    "Google Ads",
    "Zillow",
    "Batdongsan.com.vn",
    "Giới thiệu",
    "Sự Kiện Giới Thiệu Sản Phẩm",
    "Gọi lạnh",
    "Instagram",
    "YouTube",
  ],
  lead_type: ["Người mua", "Người bán", "Nhà đầu tư", "Chủ cho thuê", "Người thuê"],
  property_type: ["Nhà phố", "Căn hộ chung cư", "Đất nền", "Biệt thự", "Shophouse", "Nhà xưởng/kho", "Khác"],
  legal_status: ["Sổ hồng/sổ đỏ riêng", "Sổ chung", "HĐMB chủ đầu tư", "Giấy tay", "Đang chờ sổ"],
  appointment_type: ["Dẫn xem nhà", "Tư vấn", "Thuyết trình bán", "Sự Kiện Giới Thiệu Sản Phẩm", "Họp"],
  marketing_platform: ["Facebook", "Google Ads", "Zillow", "Giới thiệu", "Trang web", "Instagram", "YouTube", "Zalo OA"],
};
