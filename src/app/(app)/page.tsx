import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, PageHeader, SectionTitle, StatCard, EmptyState } from "@/components/ui/Misc";
import { QuickAction } from "@/components/ui/QuickAction";
import { PaymentStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { DEAL_STAGES } from "@/lib/types";
import type { Deal, Appointment, Commission, MarketingCampaign } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date().toISOString().slice(0, 7) + "-01";

  const [
    { count: totalLeads },
    { data: deals },
    { count: activeListings },
    { count: openHouseCount },
    { count: activeBuyers },
    { count: activeSellers },
    { data: upcomingAppointments },
    { data: campaigns },
    { data: commissions },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("deals").select("*"),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "Booking"),
    supabase.from("open_houses").select("id", { count: "exact", head: true }),
    supabase.from("buyer_intakes").select("id", { count: "exact", head: true }),
    supabase.from("seller_intakes").select("id", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("*, leads(full_name), listings(address)")
      .gte("date", today)
      .order("date")
      .limit(6),
    supabase.from("marketing_campaigns").select("*").gte("period_month", monthStart).order("spend", { ascending: false }).limit(6),
    supabase.from("commissions").select("*, deals(deal_name)").order("created_at", { ascending: false }).limit(6),
  ]);

  const dealList = (deals as Deal[]) ?? [];
  const activeDeals = dealList.filter((d) => d.stage !== "Đã chốt thành công" && d.stage !== "Thất bại");
  const expectedCommission = activeDeals.reduce((sum, d) => sum + (d.net_commission ?? 0), 0);

  const byStage = new Map<string, Deal[]>();
  for (const stage of DEAL_STAGES) byStage.set(stage, []);
  for (const d of dealList) byStage.get(d.stage)?.push(d);

  return (
    <div>
      <PageHeader
        title={`Chào mừng trở lại, ${profile.full_name.split(" ").slice(-1)[0]} 👋`}
        description="Quản lý khách tiềm năng, bất động sản, giao dịch và tăng trưởng doanh nghiệp từ một nơi duy nhất."
      />

      <SectionTitle>Thao tác nhanh</SectionTitle>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <QuickAction href="/leads" icon="➕" label="Lead mới" color="var(--accent-light)" />
        <QuickAction href="/listings" icon="🏠" label="BĐS mới" color="var(--brand-light)" />
        <QuickAction href="/deals" icon="🤝" label="Giao dịch mới" color="var(--brand-light)" />
        <QuickAction href="/tasks" icon="📝" label="Công việc mới" color="var(--accent-light)" />
        <QuickAction href="/lich-hen" icon="📅" label="Lịch hẹn mới" color="var(--brand-light)" />
      </div>

      <SectionTitle>Tổng quan doanh nghiệp</SectionTitle>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng khách tiềm năng" value={String(totalLeads ?? 0)} />
        <StatCard label="Giao dịch đang chạy" value={String(activeDeals.length)} />
        <StatCard label="Hoa hồng dự kiến" value={formatCurrency(expectedCommission)} />
        <StatCard label="BĐS đang Booking" value={String(activeListings ?? 0)} />
        <StatCard label="Sự kiện giới thiệu SP" value={String(openHouseCount ?? 0)} />
        <StatCard label="Người mua đang chăm sóc" value={String(activeBuyers ?? 0)} />
        <StatCard label="Người bán đang chăm sóc" value={String(activeSellers ?? 0)} />
        <StatCard label="Lịch hẹn sắp tới" value={String(upcomingAppointments?.length ?? 0)} />
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <SectionTitle>Quy trình giao dịch</SectionTitle>
          <Link href="/deals" className="text-sm text-brand hover:underline">
            Xem toàn bộ quy trình →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-x-auto md:grid-cols-4 lg:grid-cols-8">
          {DEAL_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <div key={stage} className="rounded-xl border border-border bg-white p-2">
                <p className="mb-2 truncate text-xs font-semibold text-foreground/70">
                  {stage} <span className="text-foreground/40">({items.length})</span>
                </p>
                <div className="flex flex-col gap-1">
                  {items.slice(0, 2).map((d) => (
                    <div key={d.id} className="rounded-lg bg-brand-light/60 p-1.5 text-[11px]">
                      <p className="truncate font-medium">{d.deal_name}</p>
                      <p className="text-foreground/50">{formatCurrency(d.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle>Lịch hẹn sắp tới</SectionTitle>
          {(upcomingAppointments?.length ?? 0) === 0 ? (
            <EmptyState message="Không có lịch hẹn sắp tới." />
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {(
                upcomingAppointments as (Appointment & { leads: { full_name: string } | null; listings: { address: string } | null })[]
              ).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-md px-2 py-1.5 odd:bg-brand-light/40">
                  <span>
                    {a.title} {a.leads?.full_name ? `— ${a.leads.full_name}` : ""}
                  </span>
                  <span className="text-foreground/60">{formatDate(a.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle>Hoa hồng gần đây</SectionTitle>
          {(commissions?.length ?? 0) === 0 ? (
            <EmptyState message="Chưa có dữ liệu hoa hồng." />
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {(commissions as (Commission & { deals: { deal_name: string } | null })[]).map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-md px-2 py-1.5 odd:bg-brand-light/40">
                  <span>{c.deals?.deal_name ?? "—"}</span>
                  <span className="flex items-center gap-2">
                    {formatCurrency(c.net_commission)}
                    <PaymentStatusBadge status={c.payment_status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle>Hiệu quả marketing tháng này</SectionTitle>
          {(campaigns?.length ?? 0) === 0 ? (
            <EmptyState message="Chưa có chiến dịch marketing nào tháng này." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead className="text-xs uppercase text-foreground/50">
                  <tr>
                    <th className="px-2 py-1">Chiến dịch</th>
                    <th className="px-2 py-1">Kênh</th>
                    <th className="px-2 py-1">Ngân sách</th>
                    <th className="px-2 py-1">Đã chi</th>
                    <th className="px-2 py-1">Lead</th>
                    <th className="px-2 py-1">Giao dịch chốt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(campaigns as MarketingCampaign[]).map((c) => (
                    <tr key={c.id}>
                      <td className="px-2 py-1.5 font-medium">{c.name}</td>
                      <td className="px-2 py-1.5">{c.platform}</td>
                      <td className="px-2 py-1.5">{formatCurrency(c.budget)}</td>
                      <td className="px-2 py-1.5">{formatCurrency(c.spend)}</td>
                      <td className="px-2 py-1.5">{c.leads_generated}</td>
                      <td className="px-2 py-1.5">{c.deals_closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
