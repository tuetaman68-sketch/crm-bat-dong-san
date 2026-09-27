import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatCard, Card, SectionTitle } from "@/components/ui/Misc";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { formatCurrency, formatDate } from "@/lib/format";
import { PAYMENT_STATUSES, type Commission } from "@/lib/types";
import { updatePaymentStatus } from "./actions";

export default async function CommissionsPage() {
  const supabase = await createClient();
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, deals(deal_name, client_name), profiles:agent_id(full_name)")
    .order("created_at", { ascending: false });

  const list = (commissions as (Commission & { deals: { deal_name: string; client_name: string | null } | null; profiles: { full_name: string } | null })[]) ?? [];

  const gross = list.reduce((s, c) => s + (c.gross_commission ?? 0), 0);
  const net = list.reduce((s, c) => s + (c.net_commission ?? 0), 0);
  const brokerSplit = gross - net;
  const paid = list.filter((c) => c.payment_status === "Đã thanh toán").reduce((s, c) => s + (c.net_commission ?? 0), 0);
  const pending = list.filter((c) => c.payment_status === "Đang chờ").reduce((s, c) => s + (c.net_commission ?? 0), 0);
  const upcoming = list.filter((c) => c.payment_status === "Sắp tới").reduce((s, c) => s + (c.net_commission ?? 0), 0);

  return (
    <div>
      <PageHeader title="Hoa hồng" description="Biết chính xác đã kiếm được bao nhiêu, sắp nhận bao nhiêu và mang về bao nhiêu." />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng hoa hồng gộp" value={formatCurrency(gross)} />
        <StatCard label="Hoa hồng ròng" value={formatCurrency(net)} />
        <StatCard label="Chia sàn" value={formatCurrency(brokerSplit)} />
        <StatCard label="Đã thanh toán" value={formatCurrency(paid)} />
      </div>

      <Card className="mb-5">
        <SectionTitle>Trạng thái thanh toán</SectionTitle>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
            <span>Đã thanh toán</span>
            <span className="font-semibold text-emerald-700">{formatCurrency(paid)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
            <span>Đang chờ</span>
            <span className="font-semibold text-amber-700">{formatCurrency(pending)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2">
            <span>Sắp tới</span>
            <span className="font-semibold text-slate-600">{formatCurrency(upcoming)}</span>
          </div>
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState message="Chưa có hoa hồng nào — hoa hồng sẽ tự động tạo khi giao dịch chuyển sang Hoàn Tất Giao Dịch." />
      ) : (
        <Table head={["Giao dịch", "Khách hàng", "Ngày chốt", "Hoa hồng gộp", "Chia sàn", "Hoa hồng ròng", "Trạng thái", "Ngày thanh toán"]}>
          {list.map((c) => (
            <tr key={c.id}>
              <td className="px-3 py-2 font-medium">{c.deals?.deal_name ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{c.deals?.client_name ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/60">{formatDate(c.close_date)}</td>
              <td className="px-3 py-2">{formatCurrency(c.gross_commission)}</td>
              <td className="px-3 py-2 text-foreground/60">{c.broker_split ? `${Math.round((1 - c.broker_split) * 100)}%` : "—"}</td>
              <td className="px-3 py-2 font-medium">{formatCurrency(c.net_commission)}</td>
              <td className="px-3 py-2">
                <StatusSelect value={c.payment_status} options={PAYMENT_STATUSES} action={(v) => updatePaymentStatus(c.id, v)} />
              </td>
              <td className="px-3 py-2 text-foreground/60">{formatDate(c.payout_date)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
