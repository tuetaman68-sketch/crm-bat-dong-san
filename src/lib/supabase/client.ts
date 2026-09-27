import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/demo";
import { createMockSupabaseClient } from "@/lib/supabase/mock";

export function createClient() {
  if (isDemoMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
