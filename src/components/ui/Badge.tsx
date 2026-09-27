import { clsx } from "clsx";

const COLOR_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  gray: "bg-gray-200 text-gray-600",
  blue: "bg-sky-100 text-sky-700",
  indigo: "bg-indigo-100 text-indigo-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
  amber: "bg-amber-100 text-amber-800",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  green: "bg-emerald-100 text-emerald-700",
  teal: "bg-teal-100 text-teal-700",
  gold: "bg-accent-light text-accent",
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  "Lead mới": COLOR_CLASSES.blue,
  "Đã liên hệ": COLOR_CLASSES.amber,
  "Đã sàng lọc": COLOR_CLASSES.green,
  "Đã hẹn gặp": COLOR_CLASSES.teal,
  "Đã lên lịch xem nhà": COLOR_CLASSES.amber,
  "Đang thương lượng": COLOR_CLASSES.orange,
  "Đang ký hợp đồng": COLOR_CLASSES.purple,
  "Thành công": COLOR_CLASSES.green,
  "Không thành công": COLOR_CLASSES.gray,
};

const DEAL_PRIORITY_COLORS: Record<string, string> = {
  Thấp: COLOR_CLASSES.slate,
  "Trung bình": COLOR_CLASSES.green,
  Cao: COLOR_CLASSES.orange,
  "Khẩn cấp": COLOR_CLASSES.red,
};

const LISTING_STATUS_COLORS: Record<string, string> = {
  Booking: COLOR_CLASSES.amber,
  "Đặt Cọc": COLOR_CLASSES.blue,
  "Kí Hợp Đồng": COLOR_CLASSES.purple,
  "Hoàn Thành Giao Dịch": COLOR_CLASSES.green,
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  "Đã thanh toán": COLOR_CLASSES.green,
  "Đang chờ": COLOR_CLASSES.amber,
  "Sắp tới": COLOR_CLASSES.slate,
};

const APPT_STATUS_COLORS: Record<string, string> = {
  "Đã xác nhận": COLOR_CLASSES.green,
  "Đang chờ": COLOR_CLASSES.amber,
  "Đã huỷ": COLOR_CLASSES.red,
};

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        color ?? COLOR_CLASSES.slate,
        className
      )}
    >
      {children}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: string }) {
  return <Badge color={LEAD_STATUS_COLORS[status] ?? COLOR_CLASSES.slate}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge color={DEAL_PRIORITY_COLORS[priority] ?? COLOR_CLASSES.slate}>{priority}</Badge>;
}

export function ListingStatusBadge({ status }: { status: string }) {
  return <Badge color={LISTING_STATUS_COLORS[status] ?? COLOR_CLASSES.slate}>{status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge color={PAYMENT_STATUS_COLORS[status] ?? COLOR_CLASSES.slate}>{status}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  return <Badge color={APPT_STATUS_COLORS[status] ?? COLOR_CLASSES.slate}>{status}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = { admin: COLOR_CLASSES.red, manager: COLOR_CLASSES.purple, agent: COLOR_CLASSES.blue };
  const label: Record<string, string> = { admin: "Quản trị", manager: "Trưởng nhóm", agent: "Nhân viên" };
  return <Badge color={map[role] ?? COLOR_CLASSES.slate}>{label[role] ?? role}</Badge>;
}
