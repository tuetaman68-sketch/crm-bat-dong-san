import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatCard } from "@/components/ui/Misc";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getLookups } from "@/lib/lookups";
import { formatCurrency } from "@/lib/format";
import type { MarketingCampaign } from "@/lib/types";
import { createCampaign, deleteCampaign } from "./actions";

export default async function MarketingPage() {
  const supabase = await createClient();
  const [{ data: campaigns }, platforms] = await Promise.all([
    supabase.from("marketing_campaigns").select("*").order("period_month", { ascending: false }),
    getLookups(supabase, "marketing_platform"),
  ]);

  const list = (campaigns as MarketingCampaign[]) ?? [];
  const totalBudget = list.reduce((s, c) => s + c.budget, 0);
  const totalSpend = list.reduce((s, c) => s + c.spend, 0);
  const totalLeads = list.reduce((s, c) => s + c.leads_generated, 0);
  const totalDeals = list.reduce((s, c) => s + c.deals_closed, 0);
  const totalRevenue = list.reduce((s, c) => s + c.revenue_generated, 0);
  const totalROI = totalSpend ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Hiệu quả Marketing"
        description="Biết chính xác kênh nào mang lại khách hàng — đầu tư đúng chỗ, cắt chi phí lãng phí."
        actions={
          <Modal triggerLabel="+ Thêm chiến dịch" title="Thêm chiến dịch marketing">
            <form action={createCampaign} className="flex flex-col gap-3">
              <Field label="Tên chiến dịch" htmlFor="name">
                <Input id="name" name="name" required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kênh" htmlFor="platform">
                  <Select id="platform" name="platform" required>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.value}>
                        {p.value}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tháng" htmlFor="period_month">
                  <Input id="period_month" name="period_month" type="month" required defaultValue={new Date().toISOString().slice(0, 7)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ngân sách (VNĐ)" htmlFor="budget">
                  <Input id="budget" name="budget" type="number" defaultValue={0} />
                </Field>
                <Field label="Đã chi (VNĐ)" htmlFor="spend">
                  <Input id="spend" name="spend" type="number" defaultValue={0} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lead thu được" htmlFor="leads_generated">
                  <Input id="leads_generated" name="leads_generated" type="number" defaultValue={0} />
                </Field>
                <Field label="Giao dịch chốt" htmlFor="deals_closed">
                  <Input id="deals_closed" name="deals_closed" type="number" defaultValue={0} />
                </Field>
              </div>
              <Field label="Doanh thu mang lại (VNĐ)" htmlFor="revenue_generated">
                <Input id="revenue_generated" name="revenue_generated" type="number" defaultValue={0} />
              </Field>
              <Button type="submit">Lưu chiến dịch</Button>
            </form>
          </Modal>
        }
      />

      {list.length === 0 ? (
        <EmptyState message="Chưa có chiến dịch marketing nào." />
      ) : (
        <Table head={["Chiến dịch", "Kênh", "Ngân sách", "Đã chi", "Lead", "Chi phí/Lead", "Giao dịch chốt", "ROI", ""]}>
          {list.map((c) => {
            const costPerLead = c.leads_generated ? c.spend / c.leads_generated : 0;
            const roi = c.spend ? Math.round(((c.revenue_generated - c.spend) / c.spend) * 100) : 0;
            return (
              <tr key={c.id}>
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2">
                  <Badge>{c.platform}</Badge>
                </td>
                <td className="px-3 py-2">{formatCurrency(c.budget)}</td>
                <td className="px-3 py-2">{formatCurrency(c.spend)}</td>
                <td className="px-3 py-2">{c.leads_generated}</td>
                <td className="px-3 py-2">{formatCurrency(costPerLead)}</td>
                <td className="px-3 py-2">{c.deals_closed}</td>
                <td className={`px-3 py-2 font-medium ${roi >= 0 ? "text-emerald-600" : "text-red-600"}`}>{roi}%</td>
                <td className="px-3 py-2">
                  <DeleteButton action={deleteCampaign.bind(null, c.id)} confirmMessage={`Xoá chiến dịch "${c.name}"?`} />
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Tổng ngân sách" value={formatCurrency(totalBudget)} />
        <StatCard label="Tổng đã chi" value={formatCurrency(totalSpend)} />
        <StatCard label="Tổng lead" value={String(totalLeads)} />
        <StatCard label="Giao dịch chốt" value={String(totalDeals)} />
        <StatCard label="ROI tổng" value={`${totalROI}%`} />
      </div>
    </div>
  );
}
