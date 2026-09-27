"use client";

import { useTransition } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useModalClose } from "@/components/ui/Modal";
import type { Lead, Profile, SellerIntake } from "@/lib/types";

export function SellerIntakeForm({
  intake,
  leads,
  agents,
  action,
}: {
  intake?: SellerIntake;
  leads: Lead[];
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
      <Field label="Địa chỉ BĐS" htmlFor="property_address">
        <Input id="property_address" name="property_address" defaultValue={intake?.property_address ?? ""} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Phòng ngủ" htmlFor="bedrooms">
          <Input id="bedrooms" name="bedrooms" type="number" defaultValue={intake?.bedrooms ?? ""} />
        </Field>
        <Field label="Phòng tắm" htmlFor="bathrooms">
          <Input id="bathrooms" name="bathrooms" type="number" defaultValue={intake?.bathrooms ?? ""} />
        </Field>
        <Field label="Diện tích (m²)" htmlFor="area_m2">
          <Input id="area_m2" name="area_m2" type="number" defaultValue={intake?.area_m2 ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Giá mong muốn (VNĐ)" htmlFor="desired_price">
          <Input id="desired_price" name="desired_price" type="number" defaultValue={intake?.desired_price ?? ""} />
        </Field>
        <Field label="Thời gian dự kiến bán" htmlFor="selling_timeline">
          <Select id="selling_timeline" name="selling_timeline" defaultValue={intake?.selling_timeline ?? ""}>
            <option value="">— Chọn —</option>
            <option value="Ngay lập tức">Ngay lập tức</option>
            <option value="Trong 3 tháng">Trong 3 tháng</option>
            <option value="Từ 6 tháng trở lên">Từ 6 tháng trở lên</option>
          </Select>
        </Field>
      </div>
      <Field label="Lý do bán" htmlFor="motivation">
        <Input id="motivation" name="motivation" defaultValue={intake?.motivation ?? ""} placeholder="Chuyển nhà, đầu tư, tài chính..." />
      </Field>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="photos_needed" defaultChecked={intake?.photos_needed} /> Cần chụp ảnh
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="staging_needed" defaultChecked={intake?.staging_needed} /> Cần dàn dựng nhà mẫu
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="repairs_needed" defaultChecked={intake?.repairs_needed} /> Cần sửa chữa
        </label>
      </div>
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
        {pending ? "Đang lưu…" : "Lưu hồ sơ người bán"}
      </Button>
    </form>
  );
}
