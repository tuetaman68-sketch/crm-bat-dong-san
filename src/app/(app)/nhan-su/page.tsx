import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Card, SectionTitle, Table, EmptyState, StatCard } from "@/components/ui/Misc";
import { RoleBadge } from "@/components/ui/Badge";
import { IdSelect } from "@/components/ui/IdSelect";
import { ToggleCheckbox } from "@/components/ui/ToggleCheckbox";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Department, Floor, Profile, Team } from "@/lib/types";
import {
  createDepartment,
  createFloor,
  createTeam,
  setTeamManager,
  toggleActive,
  updateDepartmentFloor,
  updateProfileRole,
  updateProfileTeam,
  updateTeamDepartment,
} from "./actions";

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
  const [{ data: profiles }, { data: teams }, { data: departments }, { data: floors }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("teams").select("*").order("name"),
    supabase.from("departments").select("*").order("name"),
    supabase.from("floors").select("*").order("name"),
  ]);

  const staffList = (profiles as Profile[]) ?? [];
  const teamList = (teams as Team[]) ?? [];
  const departmentList = (departments as Department[]) ?? [];
  const floorList = (floors as Floor[]) ?? [];

  const teamOptions = teamList.map((t) => ({ id: t.id, label: t.name }));
  const departmentOptions = departmentList.map((d) => ({ id: d.id, label: d.name }));
  const floorOptions = floorList.map((f) => ({ id: f.id, label: f.name }));
  const activeCount = staffList.filter((p) => p.active).length;

  return (
    <div>
      <PageHeader
        title="Quản trị nhân sự"
        description={`Quản lý ${staffList.length} nhân sự, ${floorList.length} sàn, ${departmentList.length} phòng, ${teamList.length} nhóm trong toàn doanh nghiệp.`}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Tổng nhân sự" value={String(staffList.length)} />
        <StatCard label="Đang hoạt động" value={String(activeCount)} />
        <StatCard label="Số sàn" value={String(floorList.length)} />
        <StatCard label="Số phòng trực thuộc sàn" value={String(departmentList.length)} />
        <StatCard label="Số nhóm trực thuộc phòng" value={String(teamList.length)} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle>Sàn ({floorList.length})</SectionTitle>
          <ul className="mb-3 flex flex-col gap-1">
            {floorList.map((f) => (
              <li key={f.id} className="rounded-md bg-brand-light/60 px-3 py-2 text-sm font-medium">
                {f.name}
              </li>
            ))}
            {floorList.length === 0 && <li className="text-xs text-foreground/40">Chưa có sàn nào.</li>}
          </ul>
          <form action={createFloor} className="flex gap-2">
            <Input name="name" placeholder="Tên sàn mới, VD: Sàn Hà Nội" required className="text-sm" />
            <Button type="submit" variant="secondary" size="sm">
              + Sàn
            </Button>
          </form>
        </Card>

        <Card>
          <SectionTitle>Phòng ({departmentList.length})</SectionTitle>
          <ul className="mb-3 flex flex-col gap-1">
            {departmentList.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md bg-brand-light/60 px-3 py-2 text-sm">
                <span className="font-medium">{d.name}</span>
                <IdSelect
                  value={d.floor_id}
                  options={floorOptions}
                  emptyLabel="— Chưa gán sàn —"
                  action={(floorId) => updateDepartmentFloor(d.id, floorId)}
                />
              </li>
            ))}
            {departmentList.length === 0 && <li className="text-xs text-foreground/40">Chưa có phòng nào.</li>}
          </ul>
          <form action={createDepartment} className="flex flex-col gap-2">
            <Input name="name" placeholder="Tên phòng mới, VD: Phòng Kinh doanh 1" required className="text-sm" />
            <div className="flex gap-2">
              <Select name="floor_id" className="flex-1 text-sm">
                <option value="">— Chọn sàn —</option>
                {floorList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary" size="sm">
                + Phòng
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <SectionTitle>Nhóm ({teamList.length})</SectionTitle>
          <ul className="mb-3 flex flex-col gap-1">
            {teamList.map((t) => (
              <li key={t.id} className="flex flex-col gap-1 rounded-md bg-brand-light/60 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <IdSelect
                    value={t.department_id}
                    options={departmentOptions}
                    emptyLabel="— Chưa gán phòng —"
                    action={(departmentId) => updateTeamDepartment(t.id, departmentId)}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  <span>Trưởng nhóm:</span>
                  <IdSelect
                    value={t.manager_id}
                    options={staffList.map((p) => ({ id: p.id, label: p.full_name }))}
                    action={(managerId) => setTeamManager(t.id, managerId)}
                  />
                </div>
              </li>
            ))}
            {teamList.length === 0 && <li className="text-xs text-foreground/40">Chưa có nhóm nào.</li>}
          </ul>
          <form action={createTeam} className="flex flex-col gap-2">
            <Input name="name" placeholder="Tên nhóm mới, VD: Nhóm Quận 2" required className="text-sm" />
            <div className="flex gap-2">
              <Select name="department_id" className="flex-1 text-sm">
                <option value="">— Chọn phòng —</option>
                {departmentList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary" size="sm">
                + Nhóm
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <SectionTitle>Danh sách nhân sự</SectionTitle>
      {staffList.length === 0 ? (
        <EmptyState message="Chưa có nhân sự nào." />
      ) : (
        <Table head={["Họ tên", "Email", "Vai trò", "Nhóm", "Hoạt động"]}>
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
