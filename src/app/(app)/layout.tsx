import { Shell } from "@/components/Shell";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <Shell fullName={profile.full_name} role={profile.role} title={profile.title}>
      {children}
    </Shell>
  );
}
