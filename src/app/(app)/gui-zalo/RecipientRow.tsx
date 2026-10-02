"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { zaloLink } from "@/lib/format";
import { markRecipientStatus } from "./actions";

export function RecipientRow({
  id,
  campaignId,
  fullName,
  phone,
  message,
  sent,
}: {
  id: string;
  campaignId: string;
  fullName: string;
  phone: string | null;
  message: string;
  sent: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const link = zaloLink(phone);

  function openZalo() {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    if (!sent) startTransition(() => markRecipientStatus(id, campaignId, true));
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard — bỏ qua, người dùng có thể tự bôi đen copy.
    }
  }

  return (
    <li className={clsx("rounded-lg border border-border p-3 text-sm", sent && "bg-emerald-50/60")}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-medium">{fullName}</span>
        <span className="text-xs text-foreground/50">{phone ?? "Chưa có SĐT"}</span>
      </div>
      <p className="mb-2 whitespace-pre-wrap rounded-md bg-brand-light/50 p-2 text-xs text-foreground/70">{message}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={openZalo} disabled={!link}>
          💬 Mở Zalo
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={copyMessage}>
          {copied ? "Đã sao chép ✓" : "Sao chép tin nhắn"}
        </Button>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-foreground/60">
          <input
            type="checkbox"
            checked={sent}
            disabled={pending}
            onChange={(e) => startTransition(() => markRecipientStatus(id, campaignId, e.target.checked))}
          />
          Đã gửi
        </label>
      </div>
    </li>
  );
}
