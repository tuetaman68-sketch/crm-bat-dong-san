"use client";

import { useTransition } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useModalClose } from "@/components/ui/Modal";
import { LEAD_STATUSES } from "@/lib/types";
import type { Lead, Lookup, Profile } from "@/lib/types";

export function LeadForm({
  lead,
  sources,
  types,
  agents,
  action,
}: {
  lead?: Lead;
  sources: Lookup[];
  types: Lookup[];
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
      <Field label="Họ tên" htmlFor="full_name">
        <Input id="full_name" name="full_name" required defaultValue={lead?.full_name} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Điện thoại" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={lead?.phone ?? ""} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={lead?.email ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Loại khách" htmlFor="lead_type">
          <Select id="lead_type" name="lead_type" defaultValue={lead?.lead_type ?? "Người mua"}>
            {types.map((t) => (
              <option key={t.id} value={t.value}>
                {t.value}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nguồn" htmlFor="source">
          <Select id="source" name="source" defaultValue={lead?.source ?? ""}>
            <option value="">— Chọn —</option>
            {sources.map((s) => (
              <option key={s.id} value={s.value}>
                {s.value}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Trạng thái" htmlFor="status">
          <Select id="status" name="status" defaultValue={lead?.status ?? "Lead mới"}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Follow-up tiếp theo" htmlFor="next_follow_up">
          <Input id="next_follow_up" name="next_follow_up" type="date" defaultValue={lead?.next_follow_up ?? ""} />
        </Field>
      </div>
      <Field label="Nhân viên phụ trách" htmlFor="assigned_agent_id">
        <Select id="assigned_agent_id" name="assigned_agent_id" defaultValue={lead?.assigned_agent_id ?? ""}>
          <option value="">— Chưa gán —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={lead?.notes ?? ""} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="consent_marketing" defaultChecked={lead?.consent_marketing ?? false} className="h-4 w-4" />
        Đồng ý nhận tin marketing (bắt buộc để đưa vào danh sách gửi Zalo hàng loạt)
      </label>
      <Button type="submit" disabled={pending} className="mt-1 self-start">
        {pending ? "Đang lưu…" : "Lưu lead"}
      </Button>
    </form>
  );
}
