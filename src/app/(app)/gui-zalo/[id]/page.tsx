import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, SectionTitle, StatCard } from "@/components/ui/Misc";
import type { Lead, ZaloCampaign, ZaloCampaignRecipient } from "@/lib/types";
import { RecipientRow } from "../RecipientRow";

export default async function ZaloCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: campaign }, { data: recipients }] = await Promise.all([
    supabase.from("zalo_campaigns").select("*").eq("id", id).maybeSingle(),
    supabase.from("zalo_campaign_recipients").select("*, leads(full_name, phone)").eq("campaign_id", id).order("id"),
  ]);

  if (!campaign) notFound();
  const c = campaign as ZaloCampaign;
  const list = (recipients as (ZaloCampaignRecipient & { leads: Pick<Lead, "full_name" | "phone"> | null })[]) ?? [];
  const sentCount = list.filter((r) => r.status === "Đã gửi").length;

  return (
    <div>
      <div className="mb-1">
        <Link href="/gui-zalo" className="text-sm text-brand hover:underline">
          ← Danh sách chiến dịch
        </Link>
      </div>
      <PageHeader title={c.name} description="Bấm “Mở Zalo” cho từng khách để gửi tin đã soạn sẵn — hệ thống tự đánh dấu tiến độ." />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Tổng người nhận" value={String(list.length)} />
        <StatCard label="Đã gửi" value={String(sentCount)} />
        <StatCard label="Chưa gửi" value={String(list.length - sentCount)} />
      </div>

      <Card className="mb-5">
        <SectionTitle>Nội dung gốc</SectionTitle>
        <p className="whitespace-pre-wrap text-sm text-foreground/70">{c.message_template}</p>
      </Card>

      <SectionTitle>Danh sách gửi ({list.length})</SectionTitle>
      <ul className="flex flex-col gap-2">
        {list.map((r) => (
          <RecipientRow
            key={r.id}
            id={r.id}
            campaignId={id}
            fullName={r.leads?.full_name ?? "—"}
            phone={r.leads?.phone ?? null}
            message={c.message_template.replace(/\{ten\}/g, r.leads?.full_name ?? "")}
            sent={r.status === "Đã gửi"}
          />
        ))}
      </ul>
    </div>
  );
}
