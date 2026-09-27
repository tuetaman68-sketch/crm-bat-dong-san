"use client";

import { useTransition } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useModalClose } from "@/components/ui/Modal";
import { DEAL_STAGES, DEAL_PRIORITIES } from "@/lib/types";
import type { Deal, Listing, Profile } from "@/lib/types";

export function DealForm({
  deal,
  listings,
  agents,
  action,
}: {
  deal?: Deal;
  listings: Listing[];
  agents: Profile[];
  action: (form: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const close = useModalClose();

  return (
    <form
      className="flex flex-col gap-3"
      action={(form) =>
        startTransition(async () => {
          await action(form);
          close();
        })
      }
    >
      <Field label="Tên giao dịch" htmlFor="deal_name">
        <Input id="deal_name" name="deal_name" required defaultValue={deal?.deal_name} placeholder="VD: Căn hộ 123 Nguyễn Huệ" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Khách hàng" htmlFor="client_name">
          <Input id="client_name" name="client_name" defaultValue={deal?.client_name ?? ""} />
        </Field>
        <Field label="Giá (VNĐ)" htmlFor="price">
          <Input id="price" name="price" type="number" defaultValue={deal?.price ?? ""} />
        </Field>
      </div>
      <Field label="Bất động sản liên kết" htmlFor="listing_id">
        <Select id="listing_id" name="listing_id" defaultValue={deal?.listing_id ?? ""}>
          <option value="">— Không liên kết —</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.address}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Giai đoạn" htmlFor="stage">
          <Select id="stage" name="stage" defaultValue={deal?.stage ?? "Tiềm Năng"}>
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Độ ưu tiên" htmlFor="priority">
          <Select id="priority" name="priority" defaultValue={deal?.priority ?? "Trung bình"}>
            {DEAL_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngày dự kiến chốt" htmlFor="expected_close_date">
          <Input id="expected_close_date" name="expected_close_date" type="date" defaultValue={deal?.expected_close_date ?? ""} />
        </Field>
        <Field label="Nhân viên phụ trách" htmlFor="agent_id">
          <Select id="agent_id" name="agent_id" defaultValue={deal?.agent_id ?? ""}>
            <option value="">— Chưa gán —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="% Hoa hồng" htmlFor="commission_rate_pct">
          <Input id="commission_rate_pct" name="commission_rate_pct" type="number" step="0.01" defaultValue={deal?.commission_rate ? deal.commission_rate * 100 : 2} />
        </Field>
        <Field label="% Nhận sau chia sàn" htmlFor="split_rate_pct">
          <Input id="split_rate_pct" name="split_rate_pct" type="number" step="0.01" defaultValue={deal?.split_rate ? deal.split_rate * 100 : 70} />
        </Field>
      </div>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={deal?.notes ?? ""} />
      </Field>
      <Button type="submit" disabled={pending} className="mt-1 self-start">
        {pending ? "Đang lưu…" : "Lưu giao dịch"}
      </Button>
    </form>
  );
}
