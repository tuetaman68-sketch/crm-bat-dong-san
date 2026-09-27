import Link from "next/link";

export function QuickAction({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-base" style={{ background: color }}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
