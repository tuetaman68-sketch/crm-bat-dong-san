export type UserRole = "admin" | "manager" | "agent";

export interface Floor {
  id: string;
  name: string;
  created_at: string;
}

export interface Department {
  id: string;
  floor_id: string | null;
  name: string;
  created_at: string;
}

export interface Team {
  id: string;
  department_id: string | null;
  name: string;
  manager_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  team_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  title: string | null;
  active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface Lookup {
  id: string;
  category: string;
  value: string;
  color: string | null;
  sort_order: number;
}

export interface Lead {
  id: string;
  created_by: string;
  team_id: string | null;
  assigned_agent_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  lead_type: string;
  source: string | null;
  status: string;
  next_follow_up: string | null;
  notes: string | null;
  consent_marketing: boolean;
  created_at: string;
}

export interface BuyerIntake {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  lead_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_areas: string | null;
  property_type: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  timeline: string | null;
  must_have_features: string | null;
  notes: string | null;
  created_at: string;
}

export interface SellerIntake {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  lead_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  property_address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  desired_price: number | null;
  selling_timeline: string | null;
  motivation: string | null;
  photos_needed: boolean;
  staging_needed: boolean;
  repairs_needed: boolean;
  notes: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  seller_intake_id: string | null;
  address: string;
  ward: string | null;
  province: string | null;
  property_type: string | null;
  status: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  legal_status: string | null;
  land_plot_no: string | null;
  map_sheet_no: string | null;
  cert_no: string | null;
  photo_url: string | null;
  drive_link: string | null;
  listed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  lead_id: string | null;
  listing_id: string | null;
  deal_name: string;
  client_name: string | null;
  price: number | null;
  stage: string;
  priority: string;
  expected_close_date: string | null;
  commission_rate: number | null;
  split_rate: number | null;
  gross_commission: number | null;
  net_commission: number | null;
  notes: string | null;
  created_at: string;
}

export interface Commission {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  deal_id: string;
  close_date: string | null;
  gross_commission: number | null;
  broker_split: number | null;
  net_commission: number | null;
  payment_status: string;
  payout_date: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  created_by: string;
  team_id: string | null;
  assigned_to: string | null;
  title: string;
  due_date: string | null;
  priority: string;
  done: boolean;
  done_at: string | null;
  lead_id: string | null;
  deal_id: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  title: string;
  type: string;
  lead_id: string | null;
  listing_id: string | null;
  client_name: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface OpenHouse {
  id: string;
  created_by: string;
  team_id: string | null;
  agent_id: string | null;
  listing_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  visitors_count: number;
  leads_captured: number;
  notes: string | null;
  created_at: string;
}

export interface MarketingCampaign {
  id: string;
  created_by: string;
  team_id: string | null;
  name: string;
  platform: string;
  period_month: string;
  budget: number;
  spend: number;
  leads_generated: number;
  deals_closed: number;
  revenue_generated: number;
  created_at: string;
}

export interface ZaloCampaign {
  id: string;
  created_by: string;
  team_id: string | null;
  name: string;
  message_template: string;
  created_at: string;
}

export interface ZaloCampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: "Chưa gửi" | "Đã gửi";
  sent_at: string | null;
}

export const LEAD_STATUSES = [
  "Lead mới",
  "Đã liên hệ",
  "Đã sàng lọc",
  "Đã hẹn gặp",
  "Đã lên lịch xem nhà",
  "Đang thương lượng",
  "Đang ký hợp đồng",
  "Thành công",
  "Không thành công",
] as const;

export const DEAL_STAGES = [
  "Tiềm Năng",
  "Đã Chào Giá",
  "Đang Đàm Phán",
  "Đã Xem",
  "Đặt Cọc",
  "Kí Hợp Đồng",
  "Hoàn Tất Giao Dịch",
  "Chăm Sóc Tiếp",
] as const;

export const DEAL_PRIORITIES = ["Thấp", "Trung bình", "Cao", "Khẩn cấp"] as const;

export const LISTING_STATUSES = ["Booking", "Đặt Cọc", "Kí Hợp Đồng", "Hoàn Thành Giao Dịch"] as const;

export const PAYMENT_STATUSES = ["Đã thanh toán", "Đang chờ", "Sắp tới"] as const;

export const APPOINTMENT_STATUSES = ["Đã xác nhận", "Đang chờ", "Đã huỷ"] as const;
