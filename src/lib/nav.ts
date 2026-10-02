export interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/", label: "Tổng quan", icon: "🏠" }],
  },
  {
    label: "CRM",
    items: [
      { href: "/leads", label: "Khách tiềm năng", icon: "🎯" },
      { href: "/nguoi-mua", label: "Hồ Sơ Khách Hàng", icon: "🧑‍💼" },
      { href: "/nguoi-ban", label: "Hồ sơ người bán", icon: "🏡" },
    ],
  },
  {
    label: "Giao dịch",
    items: [
      { href: "/deals", label: "Pipeline giao dịch", icon: "🤝" },
      { href: "/listings", label: "Bất động sản", icon: "🏘️" },
      { href: "/open-house", label: "Sự Kiện Giới Thiệu Sản Phẩm", icon: "🎉" },
    ],
  },
  {
    label: "Công việc",
    items: [
      { href: "/tasks", label: "Công việc", icon: "✅" },
      { href: "/lich-hen", label: "Lịch hẹn", icon: "📅" },
    ],
  },
  {
    label: "Tài chính & Marketing",
    items: [
      { href: "/hoa-hong", label: "Hoa hồng", icon: "💰" },
      { href: "/marketing", label: "Hiệu quả Marketing", icon: "📣" },
      { href: "/gui-zalo", label: "Gửi tin nhắn Zalo", icon: "💬" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { href: "/nhan-su", label: "Quản trị nhân sự", icon: "👥", adminOnly: true },
      { href: "/cai-dat", label: "Cài đặt", icon: "⚙️" },
    ],
  },
];
