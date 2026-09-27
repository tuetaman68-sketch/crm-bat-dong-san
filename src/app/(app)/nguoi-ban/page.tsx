import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import type { Lead, Profile, SellerIntake } from "@/lib/types";
import { convertToListing, createSellerIntake, deleteSellerIntake, updateSellerIntake } from "./actions";
import { SellerIntakeForm } from "./SellerIntakeForm";

export default async function SellerIntakesPage() {
  const supabase = await createClient();
  const [{ data: intakes }, { data: leads }, { data: agents }] = await Promise.all([
    supabase.from("seller_intakes").select("*, profiles:agent_id(full_name)").order("created_at", { ascending: false }),
    supabase.from("leads").select("*").order("full_name"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const list = (intakes as (SellerIntake & { profiles: { full_name: string } | null })[]) ?? [];
  const leadList = (leads as Lead[]) ?? [];
  const agentList = (agents as Profile[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Hồ sơ người bán"
        description="Thu thập thông tin BĐS và mục tiêu bán ngay từ buổi gặp đầu tiên."
        actions={
          <Modal triggerLabel="+ Thêm hồ sơ" title="Thêm hồ sơ người bán">
            <SellerIntakeForm leads={leadList} agents={agentList} action={createSellerIntake} />
          </Modal>
        }
      />

      {list.length === 0 ? (
        <EmptyState message="Chưa có hồ sơ người bán nào." />
      ) : (
        <Table head={["Họ tên", "Địa chỉ BĐS", "Giá mong muốn", "Thời gian", "Phụ trách", ""]}>
          {list.map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-2 font-medium">{s.full_name}</td>
              <td className="px-3 py-2 text-foreground/70">{s.property_address ?? "—"}</td>
              <td className="px-3 py-2">{formatCurrency(s.desired_price)}</td>
              <td className="px-3 py-2 text-foreground/70">{s.selling_timeline ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{s.profiles?.full_name ?? "—"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Modal triggerLabel="Sửa" title={`Sửa hồ sơ — ${s.full_name}`} triggerVariant="secondary">
                    <SellerIntakeForm intake={s} leads={leadList} agents={agentList} action={updateSellerIntake.bind(null, s.id)} />
                  </Modal>
                  <form action={convertToListing.bind(null, s.id)}>
                    <Button type="submit" size="sm" variant="secondary">
                      + Tạo tin đăng
                    </Button>
                  </form>
                  <DeleteButton action={deleteSellerIntake.bind(null, s.id)} confirmMessage={`Xoá hồ sơ "${s.full_name}"?`} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
