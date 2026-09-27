import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatCard } from "@/components/ui/Misc";
import { PriorityBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatCurrency, formatDate } from "@/lib/format";
import { DEAL_STAGES } from "@/lib/types";
import type { Deal, Listing, Profile } from "@/lib/types";
import { createDeal, deleteDeal, updateDeal, updateDealStage } from "./actions";
import { DealForm } from "./DealForm";

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "kanban" } = await searchParams;
  const supabase = await createClient();

  const [{ data: deals }, { data: listings }, { data: agents }] = await Promise.all([
    supabase.from("deals").select("*, profiles:agent_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("listings").select("*").order("address"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const list = (deals as (Deal & { profiles: { full_name: string } | null })[]) ?? [];
  const listingList = (listings as Listing[]) ?? [];
  const agentList = (agents as Profile[]) ?? [];

  const byStage = new Map<string, typeof list>();
  for (const s of DEAL_STAGES) byStage.set(s, []);
  for (const d of list) byStage.get(d.stage)?.push(d);

  const activeDeals = list.filter((d) => d.stage !== "Đã chốt thành công" && d.stage !== "Thất bại");
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.price ?? 0), 0);
  const wonThisMonth = list.filter(
    (d) => d.stage === "Đã chốt thành công" && d.created_at.slice(0, 7) === new Date().toISOString().slice(0, 7)
  ).length;

  return (
    <div>
      <PageHeader
        title="Quy trình giao dịch"
        description="Theo dõi mọi giao dịch từ tiếp cận đến chốt sổ."
        actions={
          <Modal triggerLabel="+ Tạo giao dịch" title="Tạo giao dịch mới">
            <DealForm listings={listingList} agents={agentList} action={createDeal} />
          </Modal>
        }
      />

      <div className="mb-4 flex justify-end">
        <div className="flex rounded-lg border border-border bg-white p-1 text-sm">
          <Link href="/deals?view=kanban" className={`rounded-md px-3 py-1 ${view === "kanban" ? "bg-brand-light text-brand-dark" : ""}`}>
            Kanban
          </Link>
          <Link href="/deals?view=table" className={`rounded-md px-3 py-1 ${view === "table" ? "bg-brand-light text-brand-dark" : ""}`}>
            Bảng
          </Link>
        </div>
      </div>

      {view === "table" ? (
        list.length === 0 ? (
          <EmptyState message="Chưa có giao dịch nào." />
        ) : (
          <Table head={["Tên giao dịch", "Khách hàng", "Giai đoạn", "Ưu tiên", "Giá", "Hoa hồng ròng", "Phụ trách", ""]}>
            {list.map((d) => (
              <tr key={d.id}>
                <td className="px-3 py-2 font-medium">{d.deal_name}</td>
                <td className="px-3 py-2 text-foreground/70">{d.client_name ?? "—"}</td>
                <td className="px-3 py-2">
                  <StatusSelect value={d.stage} options={DEAL_STAGES} action={(v) => updateDealStage(d.id, v)} />
                </td>
                <td className="px-3 py-2">
                  <PriorityBadge priority={d.priority} />
                </td>
                <td className="px-3 py-2">{formatCurrency(d.price)}</td>
                <td className="px-3 py-2">{formatCurrency(d.net_commission)}</td>
                <td className="px-3 py-2 text-foreground/70">{d.profiles?.full_name ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Modal triggerLabel="Sửa" title={`Sửa giao dịch — ${d.deal_name}`} triggerVariant="secondary">
                      <DealForm deal={d} listings={listingList} agents={agentList} action={updateDeal.bind(null, d.id)} />
                    </Modal>
                    <DeleteButton action={deleteDeal.bind(null, d.id)} confirmMessage={`Xoá giao dịch "${d.deal_name}"?`} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-x-auto md:grid-cols-4 xl:grid-cols-8">
          {DEAL_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? [];
            const sum = items.reduce((s, d) => s + (d.price ?? 0), 0);
            return (
              <div key={stage} className="min-w-[190px] rounded-xl border border-border bg-white p-2">
                <p className="mb-1 px-1 text-xs font-semibold text-foreground/70">
                  {stage} <span className="text-foreground/40">({items.length})</span>
                </p>
                <p className="mb-2 px-1 text-[11px] text-foreground/40">{formatCurrency(sum)}</p>
                <div className="flex flex-col gap-2">
                  {items.map((d) => (
                    <div key={d.id} className="rounded-lg border border-border bg-brand-light/40 p-2 text-xs">
                      <p className="truncate font-medium">{d.deal_name}</p>
                      <p className="text-foreground/60">{formatCurrency(d.price)}</p>
                      <p className="text-foreground/40">{formatDate(d.expected_close_date)}</p>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <PriorityBadge priority={d.priority} />
                      </div>
                      <div className="mt-1.5">
                        <StatusSelect value={d.stage} options={DEAL_STAGES} action={(v) => updateDealStage(d.id, v)} className="w-full text-center" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Giao dịch đang chạy" value={String(activeDeals.length)} />
        <StatCard label="Giá trị pipeline" value={formatCurrency(totalPipelineValue)} />
        <StatCard label="Đã chốt tháng này" value={String(wonThisMonth)} />
        <StatCard label="Tổng giao dịch" value={String(list.length)} />
      </div>
    </div>
  );
}
