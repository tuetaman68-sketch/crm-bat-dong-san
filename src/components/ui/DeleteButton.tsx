"use client";

import { useTransition } from "react";
import { Button } from "./Button";

export function DeleteButton({
  action,
  confirmMessage = "Xoá bản ghi này? Không thể hoàn tác.",
  label = "Xoá",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmMessage)) startTransition(() => action());
      }}
    >
      {pending ? "Đang xoá…" : label}
    </Button>
  );
}
