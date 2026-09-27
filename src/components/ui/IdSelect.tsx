"use client";

import { useTransition } from "react";
import { clsx } from "clsx";

export function IdSelect({
  value,
  options,
  action,
  emptyLabel = "— Chưa gán —",
  allowEmpty = true,
  className,
}: {
  value: string | null;
  options: { id: string; label: string }[];
  action: (id: string) => Promise<void>;
  emptyLabel?: string;
  allowEmpty?: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value ?? ""}
      disabled={pending}
      className={clsx("rounded-lg border border-border bg-white px-2 py-1 text-xs", pending && "opacity-50", className)}
      onChange={(e) => startTransition(() => action(e.target.value))}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
