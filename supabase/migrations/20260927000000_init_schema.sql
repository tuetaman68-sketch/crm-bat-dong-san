-- CRM Bất động sản — Postgres / Supabase schema (v2)
-- Kiến trúc cho MỘT doanh nghiệp với tới ~100+ nhân sự, phân cấp:
-- Sàn (floor) > Phòng (department) > Nhóm (team) > Nhân viên.
-- Vai trò: Admin (ban giám đốc, thấy toàn bộ) > Trưởng nhóm (quản lý 1 nhóm) > Nhân viên/môi giới.
-- Chạy trong Supabase SQL Editor hoặc `supabase db push`.

create extension if not exists "pgcrypto";

-- ========================================================================
-- 1. Cơ cấu tổ chức: Sàn > Phòng > Nhóm & phân quyền
-- ========================================================================

create type user_role as enum ('admin', 'manager', 'agent');

create table floors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid references floors on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments on delete set null,
  name text not null,
  manager_id uuid, -- gán sau khi manager có profile
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  team_id uuid references teams on delete set null,
  full_name text not null,
  email text,
  phone text,
  role user_role not null default 'agent',
  title text, -- chức danh hiển thị: "Môi giới cấp cao", "Trưởng phòng kinh doanh"...
  active boolean not null default true,
  avatar_url text,
  created_at timestamptz default now()
);

alter table teams add constraint teams_manager_fk foreign key (manager_id) references profiles(id) on delete set null;

create or replace function my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function my_team_id() returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false)
$$;

-- Người đầu tiên đăng ký trong toàn hệ thống -> admin. Người sau -> agent
-- chờ admin/trưởng nhóm gán vào team + đổi vai trò ở trang Quản trị.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_is_first boolean;
begin
  v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1));
  select not exists (select 1 from profiles) into v_is_first;

  insert into profiles (id, full_name, email, role)
  values (new.id, v_name, new.email, case when v_is_first then 'admin' else 'agent' end);

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ========================================================================
-- 2. Danh mục cấu hình
-- ========================================================================

create table lookups (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- lead_source, lead_type, lead_status, property_type, deal_stage, task_priority, appointment_type, marketing_platform, legal_status
  value text not null,
  color text, -- tuỳ chọn: tên màu badge (green/blue/amber/red/purple/slate...)
  sort_order int default 0
);

-- ========================================================================
-- 3. Leads (Khách tiềm năng) — bảng lõi của phễu CRM
-- ========================================================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  assigned_agent_id uuid references profiles(id),
  full_name text not null,
  phone text,
  email text,
  lead_type text not null default 'Người mua', -- Người mua, Người bán, Nhà đầu tư, Chủ cho thuê, Người thuê
  source text, -- Website, Facebook, Zillow, Referral, Google Ads, Instagram, YouTube, Open House, Cold Call...
  status text not null default 'Lead mới', -- Lead mới, Đã liên hệ, Đã sàng lọc, Đã hẹn gặp, Đã lên lịch xem nhà, Đang thương lượng, Đang ký hợp đồng, Thành công, Không thành công
  next_follow_up date,
  notes text,
  created_at timestamptz default now()
);

-- ========================================================================
-- 4. Buyer / Seller Intake — hồ sơ chi tiết sau khi lead được qualify
-- ========================================================================

create table buyer_intakes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  lead_id uuid references leads on delete set null,
  full_name text not null,
  email text,
  phone text,
  budget_min numeric,
  budget_max numeric,
  preferred_areas text,
  property_type text,
  bedrooms text,
  bathrooms text,
  timeline text, -- Immediate, 3 Months, 6+ Months
  must_have_features text,
  notes text,
  created_at timestamptz default now()
);

create table seller_intakes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  lead_id uuid references leads on delete set null,
  full_name text not null,
  email text,
  phone text,
  property_address text,
  bedrooms int,
  bathrooms int,
  area_m2 numeric,
  desired_price numeric,
  selling_timeline text,
  motivation text,
  photos_needed boolean default false,
  staging_needed boolean default false,
  repairs_needed boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ========================================================================
-- 5. Listings (Bất động sản)
-- ========================================================================

create table listings (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  seller_intake_id uuid references seller_intakes on delete set null,
  address text not null,
  ward text,
  province text,
  property_type text,
  status text not null default 'Booking', -- Booking, Đặt Cọc, Kí Hợp Đồng, Hoàn Thành Giao Dịch
  price numeric,
  bedrooms int,
  bathrooms int,
  area_m2 numeric,
  legal_status text,
  land_plot_no text,
  map_sheet_no text,
  cert_no text,
  photo_url text,
  drive_link text,
  listed_at date,
  expires_at date,
  created_at timestamptz default now()
);

-- ========================================================================
-- 6. Deal Pipeline (Giao dịch)
-- ========================================================================

create table deals (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  lead_id uuid references leads on delete set null,
  listing_id uuid references listings on delete set null,
  deal_name text not null,
  client_name text,
  price numeric,
  stage text not null default 'Tiềm Năng', -- Tiềm Năng, Đã Chào Giá, Đang Đàm Phán, Đã Xem, Đặt Cọc, Kí Hợp Đồng, Hoàn Tất Giao Dịch, Chăm Sóc Tiếp
  priority text not null default 'Trung bình', -- Thấp, Trung bình, Cao, Khẩn cấp
  expected_close_date date,
  commission_rate numeric default 0.02,
  split_rate numeric default 0.7, -- % môi giới nhận sau chia sàn
  gross_commission numeric generated always as (coalesce(price,0) * coalesce(commission_rate,0)) stored,
  net_commission numeric generated always as (coalesce(price,0) * coalesce(commission_rate,0) * coalesce(split_rate,1)) stored,
  notes text,
  created_at timestamptz default now()
);

-- ========================================================================
-- 7. Hoa hồng (thanh toán thực tế theo từng giao dịch đã chốt)
-- ========================================================================

create table commissions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  deal_id uuid references deals on delete cascade,
  close_date date,
  gross_commission numeric,
  broker_split numeric,
  net_commission numeric,
  payment_status text not null default 'Đang chờ', -- Đã thanh toán, Đang chờ, Sắp tới
  payout_date date,
  created_at timestamptz default now()
);

-- ========================================================================
-- 8. Công việc & Lịch hẹn
-- ========================================================================

create table tasks (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  assigned_to uuid references profiles(id),
  title text not null,
  due_date date,
  priority text not null default 'Trung bình', -- Thấp, Trung bình, Cao
  done boolean default false,
  done_at timestamptz,
  lead_id uuid references leads on delete set null,
  deal_id uuid references deals on delete set null,
  created_at timestamptz default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  title text not null,
  type text not null default 'Dẫn xem nhà', -- Dẫn xem nhà, Tư vấn, Thuyết trình bán, Mở nhà, Họp
  lead_id uuid references leads on delete set null,
  listing_id uuid references listings on delete set null,
  client_name text,
  date date not null,
  start_time time,
  end_time time,
  status text not null default 'Đã xác nhận', -- Đã xác nhận, Đang chờ, Đã huỷ
  notes text,
  created_at timestamptz default now()
);

create table open_houses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  agent_id uuid references profiles(id),
  listing_id uuid references listings on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  visitors_count int default 0,
  leads_captured int default 0,
  notes text,
  created_at timestamptz default now()
);

-- ========================================================================
-- 9. Marketing ROI
-- ========================================================================

create table marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references profiles(id),
  team_id uuid references teams,
  name text not null,
  platform text not null, -- Facebook, Google Ads, Zillow, Referral, Website, Instagram, YouTube...
  period_month date not null default date_trunc('month', current_date),
  budget numeric default 0,
  spend numeric default 0,
  leads_generated int default 0,
  deals_closed int default 0,
  revenue_generated numeric default 0,
  created_at timestamptz default now()
);

-- ========================================================================
-- 10. View tổng hợp
-- ========================================================================

create or replace view lead_counts with (security_invoker = true) as
select status, count(*) as total from leads group by status;

create or replace view deal_counts with (security_invoker = true) as
select stage, count(*) as total, coalesce(sum(price),0) as total_price from deals group by stage;

-- ========================================================================
-- 11. Row Level Security
-- Admin: thấy toàn bộ. Trưởng nhóm (manager): thấy dữ liệu trong team mình.
-- Nhân viên (agent): chỉ thấy bản ghi do mình tạo hoặc được giao (assigned/agent_id).
-- ========================================================================

alter table floors enable row level security;
create policy floors_read on floors for select using (true);
create policy floors_admin_write on floors for insert with check (is_admin());
create policy floors_admin_update on floors for update using (is_admin());
create policy floors_admin_delete on floors for delete using (is_admin());

alter table departments enable row level security;
create policy departments_read on departments for select using (true);
create policy departments_admin_write on departments for insert with check (is_admin());
create policy departments_admin_update on departments for update using (is_admin());
create policy departments_admin_delete on departments for delete using (is_admin());

alter table teams enable row level security;
create policy teams_read on teams for select using (true);
create policy teams_admin_write on teams for insert with check (is_admin());
create policy teams_admin_update on teams for update using (is_admin());
create policy teams_admin_delete on teams for delete using (is_admin());

alter table profiles enable row level security;
create policy profiles_read on profiles for select using (true);
create policy profiles_self_update on profiles for update using (id = auth.uid() or is_admin());
create policy profiles_admin_insert on profiles for insert with check (is_admin() or id = auth.uid());
create policy profiles_admin_delete on profiles for delete using (is_admin());

alter table lookups enable row level security;
create policy lookups_read on lookups for select using (true);
create policy lookups_admin_write on lookups for all using (is_admin()) with check (is_admin());

-- Bảng nghiệp vụ: quyền theo team + người tạo/người được giao.
do $$
declare t text;
declare owner_col text;
begin
  foreach t in array array['leads','buyer_intakes','seller_intakes','listings','deals','commissions','tasks','appointments','open_houses']
  loop
    execute format('alter table %I enable row level security', t);

    execute format($p$create policy %1$I_select on %1$I for select using (
      is_admin()
      or (my_role() = 'manager' and team_id = my_team_id())
      or created_by = auth.uid()
      or (to_jsonb(%1$I.*) ? 'agent_id' and (to_jsonb(%1$I.*)->>'agent_id')::uuid = auth.uid())
      or (to_jsonb(%1$I.*) ? 'assigned_to' and (to_jsonb(%1$I.*)->>'assigned_to')::uuid = auth.uid())
      or (to_jsonb(%1$I.*) ? 'assigned_agent_id' and (to_jsonb(%1$I.*)->>'assigned_agent_id')::uuid = auth.uid())
    )$p$, t);

    execute format('create policy %1$I_insert on %1$I for insert with check (created_by = auth.uid())', t);

    execute format($p$create policy %1$I_update on %1$I for update using (
      is_admin() or (my_role() = 'manager' and team_id = my_team_id()) or created_by = auth.uid()
    )$p$, t);

    execute format($p$create policy %1$I_delete on %1$I for delete using (
      is_admin() or (my_role() = 'manager' and team_id = my_team_id()) or created_by = auth.uid()
    )$p$, t);
  end loop;
end $$;

alter table marketing_campaigns enable row level security;
create policy marketing_select on marketing_campaigns for select using (true);
create policy marketing_write on marketing_campaigns for all using (is_admin() or my_role() = 'manager') with check (is_admin() or my_role() = 'manager');

-- Team_id mặc định lấy theo profile của người tạo (trigger, tránh phải gửi từ client).
create or replace function set_team_id() returns trigger
language plpgsql as $$
begin
  if new.team_id is null then
    new.team_id := (select team_id from profiles where id = new.created_by);
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['leads','buyer_intakes','seller_intakes','listings','deals','commissions','tasks','appointments','open_houses','marketing_campaigns']
  loop
    execute format('create trigger trg_set_team_id before insert on %I for each row execute function set_team_id()', t);
  end loop;
end $$;
