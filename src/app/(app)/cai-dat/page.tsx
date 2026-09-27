import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Card, SectionTitle } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { getAllLookups, LOOKUP_CATEGORIES } from "@/lib/lookups";
import { addLookup, deleteLookup, seedDefaultLookups } from "./actions";

export default async function SettingsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const lookups = await getAllLookups(supabase);
  const isAdmin = profile.role === "admin";

  return (
    <div>
      <PageHeader title="Cài đặt" description="Danh mục dropdown dùng chung cho toàn doanh nghiệp." />

      {isAdmin && lookups.length === 0 && (
        <Card className="mb-5">
          <SectionTitle>Khởi tạo danh mục mặc định</SectionTitle>
          <p className="mb-3 text-sm text-foreground/60">Tạo sẵn nguồn lead, loại khách, loại BĐS, tình trạng pháp lý, loại lịch hẹn và kênh marketing mặc định.</p>
          <form action={seedDefaultLookups}>
            <Button type="submit" variant="secondary">
              Khởi tạo danh mục mặc định
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LOOKUP_CATEGORIES.map((cat) => {
          const items = lookups.filter((l) => l.category === cat.key);
          return (
            <Card key={cat.key}>
              <p className="mb-2 text-sm font-semibold">{cat.label}</p>
              <ul className="mb-3 flex flex-col gap-1">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-md bg-brand-light/60 px-2 py-1 text-sm">
                    <span>{item.value}</span>
                    {isAdmin && (
                      <form action={deleteLookup.bind(null, item.id)}>
                        <button className="text-xs text-red-600 hover:underline" type="submit">
                          Xoá
                        </button>
                      </form>
                    )}
                  </li>
                ))}
                {items.length === 0 && <li className="text-xs text-foreground/40">Chưa có giá trị</li>}
              </ul>
              {isAdmin && (
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const value = String(formData.get("value") || "").trim();
                    if (value) await addLookup(cat.key, value);
                  }}
                  className="flex gap-2"
                >
                  <Input name="value" placeholder="Thêm giá trị mới" className="text-xs" />
                  <Button type="submit" size="sm" variant="secondary">
                    Thêm
                  </Button>
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
