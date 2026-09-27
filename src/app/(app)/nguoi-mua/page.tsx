import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getLookups } from "@/lib/lookups";
import { formatCurrency } from "@/lib/format";
import type { BuyerIntake, Lead, Profile } from "@/lib/types";
import { createBuyerIntake, deleteBuyerIntake, updateBuyerIntake } from "./actions";
import { BuyerIntakeForm } from "./BuyerIntakeForm";

export default async function BuyerIntakesPage() {
  const supabase = await createClient();
  const [{ data: intakes }, { data: leads }, propertyTypes, { data: agents }] = await Promise.all([
    supabase.from("buyer_intakes").select("*, profiles:agent_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("leads").select("*").order("full_name"),
    getLookups(supabase, "property_type"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const list = (intakes as (BuyerIntake & { profiles: { full_name: string } | null })[]) ?? [];
  const leadList = (leads as Lead[]) ?? [];
  const agentList = (agents as Profile[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Hồ Sơ Khách Hàng"
        description="Nắm rõ ngân sách, khu vực và nhu cầu của từng khách mua ngay từ ngày đầu."
        actions={
          <Modal triggerLabel="+ Thêm hồ sơ" title="Thêm hồ sơ khách hàng">
            <BuyerIntakeForm leads={leadList} propertyTypes={propertyTypes} agents={agentList} action={createBuyerIntake} />
          </Modal>
        }
      />

      {list.length === 0 ? (
        <EmptyState message="Chưa có hồ sơ khách hàng nào." />
      ) : (
        <Table head={["Họ tên", "Ngân sách", "Khu vực", "Loại BĐS", "Thời gian", "Phụ trách", ""]}>
          {list.map((b) => (
            <tr key={b.id}>
              <td className="px-3 py-2 font-medium">{b.full_name}</td>
              <td className="px-3 py-2 text-foreground/70">
                {formatCurrency(b.budget_min)} – {formatCurrency(b.budget_max)}
              </td>
              <td className="px-3 py-2 text-foreground/70">{b.preferred_areas ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{b.property_type ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{b.timeline ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{b.profiles?.full_name ?? "—"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Modal triggerLabel="Sửa" title={`Sửa hồ sơ — ${b.full_name}`} triggerVariant="secondary">
                    <BuyerIntakeForm intake={b} leads={leadList} propertyTypes={propertyTypes} agents={agentList} action={updateBuyerIntake.bind(null, b.id)} />
                  </Modal>
                  <DeleteButton action={deleteBuyerIntake.bind(null, b.id)} confirmMessage={`Xoá hồ sơ "${b.full_name}"?`} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
