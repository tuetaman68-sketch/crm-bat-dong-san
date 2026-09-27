"use client";

import { useTransition } from "react";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useModalClose } from "@/components/ui/Modal";
import { LISTING_STATUSES, type Listing, type Lookup, type Profile } from "@/lib/types";

export function ListingForm({
  listing,
  propertyTypes,
  legalStatuses,
  agents,
  action,
}: {
  listing?: Listing;
  propertyTypes: Lookup[];
  legalStatuses: Lookup[];
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
      <Field label="Địa chỉ" htmlFor="address">
        <Input id="address" name="address" required defaultValue={listing?.address} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phường/xã" htmlFor="ward">
          <Input id="ward" name="ward" defaultValue={listing?.ward ?? ""} />
        </Field>
        <Field label="Tỉnh/thành" htmlFor="province">
          <Input id="province" name="province" defaultValue={listing?.province ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Loại BĐS" htmlFor="property_type">
          <Select id="property_type" name="property_type" defaultValue={listing?.property_type ?? ""}>
            <option value="">— Chọn —</option>
            {propertyTypes.map((p) => (
              <option key={p.id} value={p.value}>
                {p.value}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Trạng thái" htmlFor="status">
          <Select id="status" name="status" defaultValue={listing?.status ?? "Booking"}>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Giá (VNĐ)" htmlFor="price">
          <Input id="price" name="price" type="number" defaultValue={listing?.price ?? ""} />
        </Field>
        <Field label="Phòng ngủ" htmlFor="bedrooms">
          <Input id="bedrooms" name="bedrooms" type="number" defaultValue={listing?.bedrooms ?? ""} />
        </Field>
        <Field label="Phòng tắm" htmlFor="bathrooms">
          <Input id="bathrooms" name="bathrooms" type="number" defaultValue={listing?.bathrooms ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Diện tích (m²)" htmlFor="area_m2">
          <Input id="area_m2" name="area_m2" type="number" defaultValue={listing?.area_m2 ?? ""} />
        </Field>
        <Field label="Tình trạng pháp lý" htmlFor="legal_status">
          <Select id="legal_status" name="legal_status" defaultValue={listing?.legal_status ?? ""}>
            <option value="">— Chọn —</option>
            {legalStatuses.map((p) => (
              <option key={p.id} value={p.value}>
                {p.value}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Số thửa" htmlFor="land_plot_no">
          <Input id="land_plot_no" name="land_plot_no" defaultValue={listing?.land_plot_no ?? ""} />
        </Field>
        <Field label="Tờ bản đồ" htmlFor="map_sheet_no">
          <Input id="map_sheet_no" name="map_sheet_no" defaultValue={listing?.map_sheet_no ?? ""} />
        </Field>
        <Field label="Số GCN" htmlFor="cert_no">
          <Input id="cert_no" name="cert_no" defaultValue={listing?.cert_no ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngày đăng" htmlFor="listed_at">
          <Input id="listed_at" name="listed_at" type="date" defaultValue={listing?.listed_at ?? new Date().toISOString().slice(0, 10)} />
        </Field>
        <Field label="Hết hạn hợp tác" htmlFor="expires_at">
          <Input id="expires_at" name="expires_at" type="date" defaultValue={listing?.expires_at ?? ""} />
        </Field>
      </div>
      <Field label="Nhân viên phụ trách" htmlFor="agent_id">
        <Select id="agent_id" name="agent_id" defaultValue={listing?.agent_id ?? ""}>
          <option value="">— Chưa gán —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Link hồ sơ Drive" htmlFor="drive_link">
        <Input id="drive_link" name="drive_link" defaultValue={listing?.drive_link ?? ""} />
      </Field>
      <Button type="submit" disabled={pending} className="mt-1 self-start">
        {pending ? "Đang lưu…" : "Lưu bất động sản"}
      </Button>
    </form>
  );
}
