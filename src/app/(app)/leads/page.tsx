import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatCard } from "@/components/ui/Misc";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { getLookups } from "@/lib/lookups";
import { formatDate } from "@/lib/format";
import { LEAD_STATUSES } from "@/lib/types";
import type { Lead, Profile } from "@/lib/types";
import { createLead, deleteLead, updateLead, updateLeadStatus } from "./actions";
import { LeadForm } from "./LeadForm";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ view?: string; filter?: string }> }) {
  const { view = "table", filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("leads").select("*, profiles:assigned_agent_id(full_name)").order("created_at", { ascending: false });
  if (filter === "qualified") query = query.eq("status", "Đã sàng lọc");
  if (filter === "buyers") query = query.eq("lead_type", "Người mua");
  if (filter === "sellers") query = query.eq("lead_type", "Người bán");
  if (filter === "month") {
    const monthStart = new Date().toISOString().slice(0, 7) + "-01";
    query = query.gte("created_at", monthStart);
  }

  const [{ data: leads }, sources, types, { data: agents }, { count: totalLeads }, { count: newThisMonth }, { count: qualifiedCount }] =
    await Promise.all([
      query,
      getLookups(supabase, "lead_source"),
      getLookups(supabase, "lead_type"),
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().slice(0, 7) + "-01"),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "Đã sàng lọc"),
    ]);

  const list = (leads as (Lead & { profiles: { full_name: string } | null })[]) ?? [];
  const agentList = (agents as Profile[]) ?? [];
  const conversionRate = totalLeads ? Math.round(((qualifiedCount ?? 0) / totalLeads) * 100) : 0;

  const byStatus = new Map<string, typeof list>();
  for (const s of LEAD_STATUSES) byStatus.set(s, []);
  for (const l of list) byStatus.get(l.status)?.push(l);

  const tabs = [
    { key: "", label: "Tất cả" },
    { key: "month", label: "Tháng này" },
    { key: "qualified", label: "Đã sàng lọc" },
    { key: "buyers", label: "Người mua" },
    { key: "sellers", label: "Người bán" },
  ];

  return (
    <div>
      <PageHeader
        title="Khách tiềm năng"
        description="Không bao giờ để lỡ một lead — nắm bắt, theo dõi và chuyển đổi mọi cơ hội."
        actions={
          <Modal triggerLabel="+ Thêm lead" title="Thêm lead mới">
            <LeadForm sources={sources} types={types} agents={agentList} action={createLead} />
          </Modal>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/leads${t.key ? `?filter=${t.key}` : ""}${view === "kanban" ? `${t.key ? "&" : "?"}view=kanban` : ""}`}
              className={`rounded-full border px-3 py-1 text-sm ${filter === t.key || (!filter && t.key === "") ? "border-brand bg-brand-light text-brand-dark" : "border-border bg-white text-foreground/60"}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="flex rounded-lg border border-border bg-white p-1 text-sm">
          <Link href={`/leads${filter ? `?filter=${filter}` : ""}`} className={`rounded-md px-3 py-1 ${view !== "kanban" ? "bg-brand-light text-brand-dark" : ""}`}>
            Bảng
          </Link>
          <Link href={`/leads?view=kanban${filter ? `&filter=${filter}` : ""}`} className={`rounded-md px-3 py-1 ${view === "kanban" ? "bg-brand-light text-brand-dark" : ""}`}>
            Kanban
          </Link>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-2 gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-5">
          {LEAD_STATUSES.map((status) => {
            const items = byStatus.get(status) ?? [];
            return (
              <div key={status} className="min-w-[220px] rounded-xl border border-border bg-white p-2">
                <p className="mb-2 px-1 text-xs font-semibold text-foreground/70">
                  {status} <span className="text-foreground/40">({items.length})</span>
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((l) => (
                    <div key={l.id} className="rounded-lg border border-border bg-brand-light/40 p-2 text-xs">
                      <p className="font-medium">{l.full_name}</p>
                      <p className="text-foreground/50">
                        {l.lead_type} · {l.source ?? "—"}
                      </p>
                      <p className="mt-1 text-foreground/50">{l.profiles?.full_name ?? "Chưa gán"}</p>
                      <div className="mt-1.5">
                        <StatusSelect value={l.status} options={LEAD_STATUSES} action={(v) => updateLeadStatus(l.id, v)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : list.length === 0 ? (
        <EmptyState message="Chưa có lead nào phù hợp." />
      ) : (
        <Table head={["Tên lead", "Loại", "Nguồn", "Trạng thái", "Follow-up tiếp theo", "Phụ trách", ""]}>
          {list.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2 font-medium">{l.full_name}</td>
              <td className="px-3 py-2">
                <Badge>{l.lead_type}</Badge>
              </td>
              <td className="px-3 py-2 text-foreground/70">{l.source ?? "—"}</td>
              <td className="px-3 py-2">
                <StatusSelect value={l.status} options={LEAD_STATUSES} action={(v) => updateLeadStatus(l.id, v)} />
              </td>
              <td className="px-3 py-2 text-foreground/60">{formatDate(l.next_follow_up)}</td>
              <td className="px-3 py-2 text-foreground/70">{l.profiles?.full_name ?? "Chưa gán"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Modal triggerLabel="Sửa" title={`Sửa lead — ${l.full_name}`} triggerVariant="secondary">
                    <LeadForm lead={l} sources={sources} types={types} agents={agentList} action={updateLead.bind(null, l.id)} />
                  </Modal>
                  <DeleteButton action={deleteLead.bind(null, l.id)} confirmMessage={`Xoá lead "${l.full_name}"?`} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng lead" value={String(totalLeads ?? 0)} />
        <StatCard label="Mới tháng này" value={String(newThisMonth ?? 0)} />
        <StatCard label="Đã sàng lọc" value={String(qualifiedCount ?? 0)} />
        <StatCard label="Tỉ lệ chuyển đổi" value={`${conversionRate}%`} />
      </div>
    </div>
  );
}
