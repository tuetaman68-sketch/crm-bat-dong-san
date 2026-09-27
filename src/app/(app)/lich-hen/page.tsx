import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { AppointmentStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { getLookups } from "@/lib/lookups";
import { formatDate } from "@/lib/format";
import type { Appointment, Lead, Listing, Profile } from "@/lib/types";
import { createAppointment, deleteAppointment } from "./actions";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const supabase = await createClient();
  const now = month ? new Date(month + "-01") : new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const monthStart = new Date(year, monthIdx, 1);
  const monthEnd = new Date(year, monthIdx + 1, 0);
  const prevMonth = new Date(year, monthIdx - 1, 1).toISOString().slice(0, 7);
  const nextMonth = new Date(year, monthIdx + 1, 1).toISOString().slice(0, 7);

  const [{ data: appointments }, { data: leads }, { data: listings }, { data: agents }, appointmentTypes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, leads(full_name), listings(address)")
      .gte("date", monthStart.toISOString().slice(0, 10))
      .lte("date", monthEnd.toISOString().slice(0, 10))
      .order("date"),
    supabase.from("leads").select("*").order("full_name"),
    supabase.from("listings").select("*").order("address"),
    supabase.from("profiles").select("*").order("full_name"),
    getLookups(supabase, "appointment_type"),
  ]);

  const list = (appointments as (Appointment & { leads: { full_name: string } | null; listings: { address: string } | null })[]) ?? [];
  const byDate = new Map<string, typeof list>();
  for (const a of list) {
    const key = a.date;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(a);
  }

  const leadDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const cells: (number | null)[] = [...Array(leadDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader
        title="Lịch hẹn"
        description="Toàn bộ lịch xem nhà, tư vấn và gặp khách trong một nơi duy nhất."
        actions={
          <Modal triggerLabel="+ Thêm lịch hẹn" title="Thêm lịch hẹn mới">
            <form action={createAppointment} className="flex flex-col gap-3">
              <Field label="Tiêu đề" htmlFor="title">
                <Input id="title" name="title" required placeholder="VD: Dẫn khách xem nhà" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Loại" htmlFor="type">
                  <Select id="type" name="type" defaultValue="Dẫn xem nhà">
                    {appointmentTypes.map((t) => (
                      <option key={t.id} value={t.value}>
                        {t.value}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Khách hàng" htmlFor="client_name">
                  <Input id="client_name" name="client_name" />
                </Field>
              </div>
              <Field label="Lead liên kết" htmlFor="lead_id">
                <Select id="lead_id" name="lead_id">
                  <option value="">— Không liên kết —</option>
                  {((leads as Lead[]) ?? []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Bất động sản" htmlFor="listing_id">
                <Select id="listing_id" name="listing_id">
                  <option value="">— Không liên kết —</option>
                  {((listings as Listing[]) ?? []).map((l) => (
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
              <Field label="Nhân viên phụ trách" htmlFor="agent_id">
                <Select id="agent_id" name="agent_id">
                  <option value="">— Chưa gán —</option>
                  {((agents as Profile[]) ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit">Lưu lịch hẹn</Button>
            </form>
          </Modal>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <Link href={`/lich-hen?month=${prevMonth}`} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm hover:bg-brand-light">
          ← Tháng trước
        </Link>
        <p className="text-lg font-semibold capitalize text-brand-dark">{monthLabel}</p>
        <Link href={`/lich-hen?month=${nextMonth}`} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm hover:bg-brand-light">
          Tháng sau →
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-7 gap-1.5 rounded-xl border border-border bg-white p-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-1 py-1 text-center text-xs font-semibold text-foreground/50">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          const dateKey = day ? `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
          const dayAppointments = dateKey ? byDate.get(dateKey) ?? [] : [];
          return (
            <div key={idx} className={`min-h-24 rounded-lg border p-1 text-xs ${day ? "border-border bg-background" : "border-transparent"}`}>
              {day && <p className="mb-1 text-right text-foreground/50">{day}</p>}
              <div className="flex flex-col gap-0.5">
                {dayAppointments.slice(0, 3).map((a) => (
                  <div key={a.id} className="truncate rounded bg-brand-light px-1 py-0.5 text-brand-dark" title={a.title}>
                    {a.start_time?.slice(0, 5) ?? ""} {a.title}
                  </div>
                ))}
                {dayAppointments.length > 3 && <p className="text-[10px] text-foreground/40">+{dayAppointments.length - 3} khác</p>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">Danh sách lịch hẹn tháng này</p>
      {list.length === 0 ? (
        <EmptyState message="Không có lịch hẹn nào trong tháng." />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {list.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm">
              <div>
                <p className="font-medium">
                  {a.title} {a.leads?.full_name ? `— ${a.leads.full_name}` : a.client_name ? `— ${a.client_name}` : ""}
                </p>
                <p className="text-xs text-foreground/50">
                  {a.type} · {a.listings?.address ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-foreground/60">
                  {formatDate(a.date)} {a.start_time?.slice(0, 5) ?? ""}
                </span>
                <AppointmentStatusBadge status={a.status} />
                <DeleteButton action={deleteAppointment.bind(null, a.id)} confirmMessage="Xoá lịch hẹn này?" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
