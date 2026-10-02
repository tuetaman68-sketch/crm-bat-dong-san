import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatDate } from "@/lib/format";
import type { Lead, ZaloCampaign, ZaloCampaignRecipient } from "@/lib/types";
import { deleteCampaign } from "./actions";
import { CampaignForm } from "./CampaignForm";

export default async function ZaloCampaignsPage() {
  const supabase = await createClient();
  const [{ data: campaigns }, { data: recipients }, { data: leads }] = await Promise.all([
    supabase.from("zalo_campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("zalo_campaign_recipients").select("*"),
    supabase.from("leads").select("*").eq("consent_marketing", true).not("phone", "is", null).order("full_name"),
  ]);

  const campaignList = (campaigns as ZaloCampaign[]) ?? [];
  const recipientList = (recipients as ZaloCampaignRecipient[]) ?? [];
  const leadList = (leads as Lead[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Gửi tin nhắn Zalo hàng loạt"
        description="Soạn nội dung một lần, gửi cá nhân hoá cho từng khách đã đồng ý nhận tin — theo dõi ai đã gửi, ai chưa."
        actions={
          <Modal triggerLabel="+ Tạo chiến dịch" title="Tạo chiến dịch gửi Zalo mới">
            <CampaignForm leads={leadList} />
          </Modal>
        }
      />

      <Card className="mb-5 border-accent/40 bg-accent-light/40">
        <p className="text-sm text-foreground/70">
          ⚠️ Zalo không cung cấp API gửi tin tự động cho tài khoản cá nhân, nên đây là công cụ <strong>hỗ trợ gửi thủ công có kiểm soát</strong>:
          bạn bấm &quot;Mở Zalo&quot; cho từng khách để gửi tin đã soạn sẵn, hệ thống tự đánh dấu tiến độ. Chỉ những khách đã tick
          &quot;Đồng ý nhận tin marketing&quot; mới xuất hiện trong danh sách chọn.
        </p>
      </Card>

      {campaignList.length === 0 ? (
        <EmptyState message="Chưa có chiến dịch nào. Bấm “+ Tạo chiến dịch” để bắt đầu." />
      ) : (
        <div className="flex flex-col gap-3">
          {campaignList.map((c) => {
            const items = recipientList.filter((r) => r.campaign_id === c.id);
            const sent = items.filter((r) => r.status === "Đã gửi").length;
            return (
              <Card key={c.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/gui-zalo/${c.id}`} className="font-medium text-brand-dark hover:underline">
                    {c.name}
                  </Link>
                  <p className="text-xs text-foreground/50">
                    {formatDate(c.created_at)} · {sent}/{items.length} đã gửi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/gui-zalo/${c.id}`} className="text-sm text-brand hover:underline">
                    Xem chi tiết →
                  </Link>
                  <DeleteButton action={deleteCampaign.bind(null, c.id)} confirmMessage={`Xoá chiến dịch "${c.name}"?`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
