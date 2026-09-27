"use client";

import { useTransition } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useModalClose } from "@/components/ui/Modal";
import type { BuyerIntake, Lead, Lookup, Profile } from "@/lib/types";

export function BuyerIntakeForm({
  intake,
  leads,
  propertyTypes,
  agents,
  action,
}: {
  intake?: BuyerIntake;
  leads: Lead[];
  propertyTypes: Lookup[];
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
      <Field label="Lead gốc (nếu có)" htmlFor="lead_id">
        <Select id="lead_id" name="lead_id" defaultValue={intake?.lead_id ?? ""}>
          <option value="">— Không liên kết —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Họ tên" htmlFor="full_name">
        <Input id="full_name" name="full_name" required defaultValue={intake?.full_name} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={intake?.email ?? ""} />
        </Field>
        <Field label="Điện thoại" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={intake?.phone ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngân sách từ (VNĐ)" htmlFor="budget_min">
          <Input id="budget_min" name="budget_min" type="number" defaultValue={intake?.budget_min ?? ""} />
        </Field>
        <Field label="Ngân sách đến (VNĐ)" htmlFor="budget_max">
          <Input id="budget_max" name="budget_max" type="number" defaultValue={intake?.budget_max ?? ""} />
        </Field>
      </div>
      <Field label="Khu vực mong muốn" htmlFor="preferred_areas">
        <Input id="preferred_areas" name="preferred_areas" defaultValue={intake?.preferred_areas ?? ""} placeholder="VD: Quận 2, Thủ Đức" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Loại BĐS" htmlFor="property_type">
          <Select id="property_type" name="property_type" defaultValue={intake?.property_type ?? ""}>
            <option value="">— Chọn —</option>
            {propertyTypes.map((p) => (
              <option key={p.id} value={p.value}>
                {p.value}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Phòng ngủ" htmlFor="bedrooms">
          <Input id="bedrooms" name="bedrooms" defaultValue={intake?.bedrooms ?? ""} placeholder="3-4" />
        </Field>
        <Field label="Phòng tắm" htmlFor="bathrooms">
          <Input id="bathrooms" name="bathrooms" defaultValue={intake?.bathrooms ?? ""} placeholder="2-3" />
        </Field>
      </div>
      <Field label="Thời gian dự kiến mua" htmlFor="timeline">
        <Select id="timeline" name="timeline" defaultValue={intake?.timeline ?? ""}>
          <option value="">— Chọn —</option>
          <option value="Ngay lập tức">Ngay lập tức</option>
          <option value="Trong 3 tháng">Trong 3 tháng</option>
          <option value="Từ 6 tháng trở lên">Từ 6 tháng trở lên</option>
        </Select>
      </Field>
      <Field label="Yêu cầu bắt buộc" htmlFor="must_have_features">
        <Input id="must_have_features" name="must_have_features" defaultValue={intake?.must_have_features ?? ""} placeholder="Sân sau, gara, phòng làm việc..." />
      </Field>
      <Field label="Nhân viên phụ trách" htmlFor="agent_id">
        <Select id="agent_id" name="agent_id" defaultValue={intake?.agent_id ?? ""}>
          <option value="">— Chưa gán —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Ghi chú" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={intake?.notes ?? ""} />
      </Field>
      <Button type="submit" disabled={pending} className="mt-1 self-start">
        {pending ? "Đang lưu…" : "Lưu hồ sơ khách hàng"}
      </Button>
    </form>
  );
}
