"use client";

import { useTransition } from "react";
import { clsx } from "clsx";

export function StatusSelect({
  value,
  options,
  action,
  className,
}: {
  value: string;
  options: readonly string[];
  action: (value: string) => Promise<void>;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      className={clsx(
        "rounded-full border-none bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark outline-none",
        pending && "opacity-50",
        className
      )}
      onChange={(e) => startTransition(() => action(e.target.value))}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
