"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { NAV_GROUPS } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/types";

export function Shell({
  children,
  fullName,
  role,
  title,
}: {
  children: ReactNode;
  fullName: string;
  role: UserRole;
  title: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dang-nhap");
    router.refresh();
  }

  const roleLabel: Record<UserRole, string> = { admin: "Quản trị viên", manager: "Trưởng nhóm", agent: "Nhân viên" };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-brand-dark text-white">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-lg font-semibold">🏡 CRM Bất Động Sản</p>
          <p className="text-xs text-white/60">Trung tâm điều hành cho cả doanh nghiệp</p>
        </div>
        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group, gi) => {
            const items = group.items.filter((i) => !i.adminOnly || role === "admin");
            if (items.length === 0) return null;
            return (
              <div key={gi}>
                {group.label && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{group.label}</p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                          active ? "bg-accent text-brand-dark font-semibold" : "text-white/80 hover:bg-white/10"
                        )}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-4 py-3 text-xs text-white/70">
          <p className="font-medium text-white">{fullName}</p>
          <p>{title || roleLabel[role]}</p>
          <button onClick={signOut} className="mt-2 text-white/70 underline hover:text-white">
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background px-6 py-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
