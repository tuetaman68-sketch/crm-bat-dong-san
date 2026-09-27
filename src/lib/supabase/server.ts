import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/demo";
import { createMockSupabaseClient } from "@/lib/supabase/mock";

export async function createClient() {
  if (isDemoMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Được gọi từ Server Component — middleware sẽ refresh session.
          }
        },
      },
    }
  );
}
