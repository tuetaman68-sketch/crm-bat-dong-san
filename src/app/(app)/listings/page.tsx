import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui/Misc";
import { ListingStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getLookups } from "@/lib/lookups";
import { formatCurrency, formatDate } from "@/lib/format";
import { LISTING_STATUSES, type Listing, type Profile } from "@/lib/types";
import { createListing, deleteListing, updateListing } from "./actions";
import { ListingForm } from "./ListingForm";

const TABS = [{ key: "", label: "Tổng Sản Phẩm" }, ...LISTING_STATUSES.map((s) => ({ key: s, label: s }))];

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("listings").select("*, profiles:agent_id(full_name)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const [{ data: listings }, propertyTypes, legalStatuses, { data: agents }] = await Promise.all([
    query,
    getLookups(supabase, "property_type"),
    getLookups(supabase, "legal_status"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const list = (listings as (Listing & { profiles: { full_name: string } | null })[]) ?? [];
  const agentList = (agents as Profile[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Bất động sản"
        description="Cập nhật danh sách BĐS và không bỏ lỡ lịch hẹn xem nhà."
        actions={
          <Modal triggerLabel="+ Thêm BĐS" title="Thêm bất động sản mới">
            <ListingForm propertyTypes={propertyTypes} legalStatuses={legalStatuses} agents={agentList} action={createListing} />
          </Modal>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/listings?status=${t.key}` : "/listings"}
            className={`rounded-full border px-3 py-1 text-sm ${status === t.key || (!status && t.key === "") ? "border-brand bg-brand-light text-brand-dark" : "border-border bg-white text-foreground/60"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState message="Chưa có bất động sản nào." />
      ) : (
        <Table head={["Địa chỉ", "Trạng thái", "Giá", "Loại", "PN", "PT", "Ngày đăng", "Phụ trách", ""]}>
          {list.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2 font-medium">
                {l.address}
                <p className="text-xs font-normal text-foreground/50">{[l.ward, l.province].filter(Boolean).join(", ")}</p>
              </td>
              <td className="px-3 py-2">
                <ListingStatusBadge status={l.status} />
              </td>
              <td className="px-3 py-2">{formatCurrency(l.price)}</td>
              <td className="px-3 py-2 text-foreground/70">{l.property_type ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{l.bedrooms ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/70">{l.bathrooms ?? "—"}</td>
              <td className="px-3 py-2 text-foreground/60">{formatDate(l.listed_at)}</td>
              <td className="px-3 py-2 text-foreground/70">{l.profiles?.full_name ?? "—"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Modal triggerLabel="Sửa" title={`Sửa BĐS — ${l.address}`} triggerVariant="secondary">
                    <ListingForm listing={l} propertyTypes={propertyTypes} legalStatuses={legalStatuses} agents={agentList} action={updateListing.bind(null, l.id)} />
                  </Modal>
                  <DeleteButton action={deleteListing.bind(null, l.id)} confirmMessage={`Xoá BĐS "${l.address}"?`} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
