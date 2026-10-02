"use client";

import { useState, useTransition } from "react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Lead } from "@/lib/types";
import { createCampaign } from "./actions";

export function CampaignForm({ leads }: { leads: Lead[] }) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState("Chào {ten}, ");

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(leads.map((l) => l.id)) : new Set());
  }
  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <form
      className="flex flex-col gap-3"
      action={(form) => startTransition(async () => createCampaign(form))}
    >
      <Field label="Tên chiến dịch" htmlFor="name">
        <Input id="name" name="name" required placeholder="VD: Chúc mừng năm mới 2027" />
      </Field>
      <Field label="Nội dung tin nhắn" htmlFor="message_template" hint="Dùng {ten} để tự điền tên từng khách.">
        <Textarea
          id="message_template"
          name="message_template"
          required
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="min-h-28"
        />
      </Field>
      {template.includes("{ten}") && leads[0] && (
        <p className="rounded-lg bg-brand-light/60 p-2 text-xs text-foreground/60">
          Xem trước: {template.replace(/\{ten\}/g, leads[0].full_name)}
        </p>
      )}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/80">Chọn khách nhận tin ({selected.size}/{leads.length})</span>
          <label className="flex items-center gap-1.5 text-xs text-foreground/60">
            <input
              type="checkbox"
              checked={leads.length > 0 && selected.size === leads.length}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            Chọn tất cả
          </label>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
          {leads.length === 0 ? (
            <p className="p-3 text-xs text-foreground/40">
              Chưa có khách nào đồng ý nhận tin marketing và có số điện thoại. Vào Khách tiềm năng → tick &quot;Đồng ý nhận tin
              marketing&quot; cho từng khách.
            </p>
          ) : (
            leads.map((l) => (
              <label key={l.id} className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0 odd:bg-brand-light/30">
                <input
                  type="checkbox"
                  name="lead_ids"
                  value={l.id}
                  checked={selected.has(l.id)}
                  onChange={(e) => toggleOne(l.id, e.target.checked)}
                />
                <span className="flex-1">{l.full_name}</span>
                <span className="text-xs text-foreground/50">{l.phone}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <Button type="submit" disabled={pending || selected.size === 0} className="self-start">
        {pending ? "Đang tạo…" : `Tạo chiến dịch cho ${selected.size} khách`}
      </Button>
    </form>
  );
}
