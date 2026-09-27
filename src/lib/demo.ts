// Chế độ xem thử: khi .env.local chưa trỏ tới Supabase thật (còn URL "placeholder"),
// bỏ qua yêu cầu đăng nhập để xem giao diện — tự động tắt ngay khi bạn điền Project URL thật.
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url === "" || url.includes("placeholder");
}
