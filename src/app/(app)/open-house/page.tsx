import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatCard } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatDate } from "@/lib/format";
import type { Listing, OpenHouse } from "@/lib/types";
import { createOpenHouse, deleteOpenHouse } from "./actions";

export default async function OpenHousePage() {
  const supabase = await createClient();
  const [{ data: openHouses }, { data: listings }] = await Promise.all([
    supabase.from("open_houses").select("*, listings(address)").order("date", { ascending: false }),
    supabase.from("listings").select("*").order("address"),
  ]);

  const list = (openHouses as (OpenHouse & { listings: { address: string } | null })[]) ?? [];
  const listingList = (listings as Listing[]) ?? [];
  const totalVisitors = list.reduce((s, o) => s + (o.visitors_count ?? 0), 0);
  const totalLeads = list.reduce((s, o) => s + (o.leads_captured ?? 0), 0);
  const conversion = totalVisitors ? Math.round((totalLeads / totalVisitors) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Sự Kiện Giới Thiệu Sản Phẩm"
        description="Biến mỗi sự kiện giới thiệu sản phẩm thành cơ hội — ghi nhận khách ghé thăm và lead thu được."
        actions={
          <Modal triggerLabel="+ Ghi sự kiện" title="Ghi sự kiện giới thiệu sản phẩm mới">
            <form action={createOpenHouse} className="flex flex-col gap-3">
              <Field label="Bất động sản" htmlFor="listing_id">
                <Select id="listing_id" name="listing_id" required>
                  <option value="">— Chọn BĐS —</option>
                  {listingList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.address}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Ngày" htmlFor="date">
                  <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </Field>
                <Field label="Giờ bắt đầu" htmlFor="start_time">
                  <Input id="start_time" name="start_time" type="time" />
                </Field>
                <Field label="Giờ kết thúc" htmlFor="end_time">
                  <Input id="end_time" name="end_time" type="time" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Số khách ghé" htmlFor="visitors_count">
                  <Input id="visitors_count" name="visitors_count" type="number" defaultValue={0} />
                </Field>
                <Field label="Lead thu được" htmlFor="leads_captured">
                  <Input id="leads_captured" name="leads_captured" type="number" defaultValue={0} />
                </Field>
              </div>
              <Field label="Ghi chú" htmlFor="notes">
                <Textarea id="notes" name="notes" />
              </Field>
              <Button type="submit">Lưu</Button>
            </form>
          </Modal>
        }
      />

      {list.length === 0 ? (
        <EmptyState message="Chưa có sự kiện nào." />
      ) : (
        <Table head={["Bất động sản", "Ngày", "Khách ghé", "Lead thu được", "Tỉ lệ chuyển đổi", ""]}>
          {list.map((o) => (
            <tr key={o.id}>
              <td className="px-3 py-2 font-medium">{o.listings?.address ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/60">{formatDate(o.date)}</td>
              <td className="px-3 py-2">{o.visitors_count}</td>
              <td className="px-3 py-2">{o.leads_captured}</td>
              <td className="px-3 py-2">{o.visitors_count ? Math.round((o.leads_captured / o.visitors_count) * 100) : 0}%</td>
              <td className="px-3 py-2">
                <DeleteButton action={deleteOpenHouse.bind(null, o.id)} confirmMessage="Xoá sự kiện này?" />
              </td>
            </tr>
          ))}
        </Table>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng sự kiện" value={String(list.length)} />
        <StatCard label="Tổng khách ghé" value={String(totalVisitors)} />
        <StatCard label="Tổng lead thu được" value={String(totalLeads)} />
        <StatCard label="Tỉ lệ chuyển đổi TB" value={`${conversion}%`} />
      </div>
    </div>
  );
}
