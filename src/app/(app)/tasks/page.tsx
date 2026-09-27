import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "@/components/ui/Misc";
import { PriorityBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ToggleCheckbox } from "@/components/ui/ToggleCheckbox";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatDate } from "@/lib/format";
import type { Profile, Task } from "@/lib/types";
import { createTask, deleteTask, toggleTask } from "./actions";

export default async function TasksPage() {
  const supabase = await createClient();
  const [{ data: tasks }, { data: agents }] = await Promise.all([
    supabase.from("tasks").select("*, profiles:assigned_to(full_name)").order("due_date", { ascending: true }),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const list = (tasks as (Task & { profiles: { full_name: string } | null })[]) ?? [];
  const agentList = (agents as Profile[]) ?? [];
  const pending = list.filter((t) => !t.done);
  const done = list.filter((t) => t.done);

  return (
    <div>
      <PageHeader
        title="Công việc"
        description="Không bỏ lỡ bất kỳ follow-up hay công việc quan trọng nào."
        actions={
          <Modal triggerLabel="+ Thêm công việc" title="Thêm công việc mới">
            <form action={createTask} className="flex flex-col gap-3">
              <Field label="Nội dung công việc" htmlFor="title">
                <Input id="title" name="title" required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hạn chót" htmlFor="due_date">
                  <Input id="due_date" name="due_date" type="date" />
                </Field>
                <Field label="Độ ưu tiên" htmlFor="priority">
                  <Select id="priority" name="priority" defaultValue="Trung bình">
                    <option value="Thấp">Thấp</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Cao">Cao</option>
                  </Select>
                </Field>
              </div>
              <Field label="Giao cho" htmlFor="assigned_to">
                <Select id="assigned_to" name="assigned_to">
                  <option value="">— Chưa gán —</option>
                  {agentList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit">Lưu công việc</Button>
            </form>
          </Modal>
        }
      />

      <Card className="mb-4">
        <p className="mb-3 text-sm font-semibold">Chưa hoàn thành ({pending.length})</p>
        {pending.length === 0 ? (
          <EmptyState message="Không có công việc nào đang chờ." />
        ) : (
          <ul className="flex flex-col gap-1">
            {pending.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm odd:bg-brand-light/40">
                <div className="flex items-center gap-3">
                  <ToggleCheckbox checked={t.done} action={(c) => toggleTask(t.id, c)} />
                  <span>{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <div className="flex items-center gap-3 text-foreground/60">
                  <span>{t.profiles?.full_name ?? "Chưa gán"}</span>
                  <span>{formatDate(t.due_date)}</span>
                  <DeleteButton action={deleteTask.bind(null, t.id)} confirmMessage="Xoá công việc này?" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold">Đã hoàn thành ({done.length})</p>
        {done.length === 0 ? (
          <EmptyState message="Chưa có công việc nào hoàn thành." />
        ) : (
          <ul className="flex flex-col gap-1">
            {done.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-foreground/40 odd:bg-brand-light/20">
                <div className="flex items-center gap-3">
                  <ToggleCheckbox checked={t.done} action={(c) => toggleTask(t.id, c)} />
                  <span className="line-through">{t.title}</span>
                </div>
                <DeleteButton action={deleteTask.bind(null, t.id)} confirmMessage="Xoá công việc này?" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
