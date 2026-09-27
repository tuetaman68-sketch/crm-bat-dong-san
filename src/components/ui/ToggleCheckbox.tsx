"use client";

import { useTransition } from "react";
import { clsx } from "clsx";

export function ToggleCheckbox({
  checked,
  action,
  label,
}: {
  checked: boolean;
  action: (checked: boolean) => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className={clsx("inline-flex items-center gap-2", pending && "opacity-50")}>
      <input
        type="checkbox"
        defaultChecked={checked}
        disabled={pending}
        className="h-4 w-4 rounded border-border text-brand accent-[var(--brand)]"
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(() => action(next));
        }}
      />
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
