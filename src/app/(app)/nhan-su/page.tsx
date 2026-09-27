import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Card, SectionTitle, Table, EmptyState, StatCard } from "@/components/ui/Misc";
import { RoleBadge } from "@/components/ui/Badge";
import { IdSelect } from "@/components/ui/IdSelect";
import { ToggleCheckbox } from "@/components/ui/ToggleCheckbox";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Profile, Team } from "@/lib/types";
import { createTeam, setTeamManager, toggleActive, updateProfileRole, updateProfileTeam } from "./actions";

const ROLE_OPTIONS = [
  { id: "admin", label: "Quản trị viên" },
  { id: "manager", label: "Trưởng nhóm" },
  { id: "agent", label: "Nhân viên" },
];

export default async function StaffAdminPage() {
  const profile = await requireProfile();

  if (profile.role !== "admin") {
    return (
      <div>
        <PageHeader title="Quản trị nhân sự" />
        <Card>
          <p className="text-sm text-foreground/60">Chỉ quản trị viên mới có quyền truy cập trang này.</p>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: profiles }, { data: teams }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("teams").select("*").order("name"),
  ]);

  const staffList = (profiles as Profile[]) ?? [];
  const teamList = (teams as Team[]) ?? [];
  const teamOptions = teamList.map((t) => ({ id: t.id, label: t.name }));
  const activeCount = staffList.filter((p) => p.active).length;
  const managerCount = staffList.filter((p) => p.role === "manager").length;

  return (
    <div>
      <PageHeader title="Quản trị nhân sự" description={`Quản lý ${staffList.length} nhân sự, ${teamList.length} đội trong toàn doanh nghiệp.`} />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng nhân sự" value={String(staffList.length)} />
        <StatCard label="Đang hoạt động" value={String(activeCount)} />
        <StatCard label="Số đội" value={String(teamList.length)} />
        <StatCard label="Trưởng nhóm" value={String(managerCount)} />
      </div>

      <Card className="mb-5">
        <SectionTitle>Đội nhóm ({teamList.length})</SectionTitle>
        <ul className="mb-3 flex flex-col gap-1">
          {teamList.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-md bg-brand-light/60 px-3 py-2 text-sm">
              <span className="font-medium">{t.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/50">Trưởng nhóm:</span>
                <IdSelect
                  value={t.manager_id}
                  options={staffList.map((p) => ({ id: p.id, label: p.full_name }))}
                  action={(managerId) => setTeamManager(t.id, managerId)}
                />
              </div>
            </li>
          ))}
          {teamList.length === 0 && <li className="text-xs text-foreground/40">Chưa có đội nào.</li>}
        </ul>
        <form action={createTeam} className="flex gap-2">
          <Field label="" htmlFor="name">
            <Input name="name" placeholder="Tên đội mới, VD: Đội Quận 2" required />
          </Field>
          <Button type="submit" variant="secondary" className="self-end">
            + Tạo đội
          </Button>
        </form>
      </Card>

      <SectionTitle>Danh sách nhân sự</SectionTitle>
      {staffList.length === 0 ? (
        <EmptyState message="Chưa có nhân sự nào." />
      ) : (
        <Table head={["Họ tên", "Email", "Vai trò", "Đội", "Hoạt động"]}>
          {staffList.map((p) => (
            <tr key={p.id}>
              <td className="px-3 py-2 font-medium">{p.full_name}</td>
              <td className="px-3 py-2 text-foreground/60">{p.email ?? "—"}</td>
              <td className="px-3 py-2">
                {p.id === profile.id ? (
                  <RoleBadge role={p.role} />
                ) : (
                  <IdSelect value={p.role} options={ROLE_OPTIONS} allowEmpty={false} action={(v) => updateProfileRole(p.id, v)} />
                )}
              </td>
              <td className="px-3 py-2">
                <IdSelect value={p.team_id} options={teamOptions} action={(teamId) => updateProfileTeam(p.id, teamId)} />
              </td>
              <td className="px-3 py-2">
                <ToggleCheckbox checked={p.active} action={(c) => toggleActive(p.id, c)} />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
