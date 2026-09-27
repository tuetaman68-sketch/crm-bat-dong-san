"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

type Mode = "login" | "register";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Sai email hoặc mật khẩu." : error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) {
      setLoading(false);
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password,
      options: {
        data: {
          full_name: String(form.get("full_name")),
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setNotice("Đăng ký thành công! Kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
    setMode("login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-2xl">🏡</p>
          <h1 className="text-lg font-semibold text-brand-dark">CRM Bất Động Sản</h1>
          <p className="text-sm text-foreground/60">Quản lý khách hàng &amp; quy trình giao dịch cho cả doanh nghiệp</p>
        </div>

        <div className="mb-5 flex rounded-lg border border-border bg-brand-light p-1 text-sm">
          <button
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${mode === "login" ? "bg-white shadow-sm" : "text-foreground/60"}`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            type="button"
          >
            Đăng nhập
          </button>
          <button
            className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${mode === "register" ? "bg-white shadow-sm" : "text-foreground/60"}`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            type="button"
          >
            Đăng ký
          </button>
        </div>

        {notice && <p className="mb-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{notice}</p>}
        {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        {mode === "login" ? (
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Mật khẩu" htmlFor="password">
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </Field>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleRegister}>
            <Field label="Họ tên" htmlFor="full_name">
              <Input id="full_name" name="full_name" required />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Mật khẩu" htmlFor="password">
              <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
            </Field>
            <Field label="Nhập lại mật khẩu" htmlFor="confirm">
              <Input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" />
            </Field>
            <p className="text-xs text-foreground/50">
              Người đăng ký đầu tiên sẽ tự động thành Quản trị viên. Các nhân sự sau sẽ đăng ký với vai trò Nhân viên và chờ quản trị viên gán vào team tại
              trang Quản trị nhân sự.
            </p>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Đang đăng ký…" : "Đăng ký"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
