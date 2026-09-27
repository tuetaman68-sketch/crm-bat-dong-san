import { LoginForm } from "./LoginForm";

// Trang này gọi Supabase client bằng biến môi trường lúc chạy — không prerender tĩnh lúc build.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
