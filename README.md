# CRM Bất động sản (crm-bat-dong-san)

Ứng dụng CRM tiếng Việt cho môi giới/sàn bất động sản — Next.js (App Router) + Supabase (Postgres), phân quyền theo đội: **môi giới chỉ thấy khách/giao dịch do mình tạo, trưởng nhóm thấy toàn bộ dữ liệu của đội**.

Build theo skill **Real Estate CRM Builder** (mô hình All-in-One 9 module: Đối tác, Khách hàng, Lead 8x8, Chăm sóc 33 điểm chạm, Người bán, Người mua, Giao dịch, Giới thiệu, Dashboard KPI), đã Việt Nam hoá: mốc pháp lý theo Luật Đất đai/công chứng Việt Nam, địa giới phường/xã mới (chính quyền 2 cấp từ 1/7/2025), kênh liên lạc Zalo, và lưu ý về Nghị định 13/2023/NĐ-CP bảo vệ dữ liệu cá nhân.

## Bắt đầu

### 1. Tạo project Supabase (chưa kết nối — cần làm bước này trước khi chạy app)

1. Vào [supabase.com](https://supabase.com) → tạo project mới (miễn phí).
2. Vào **SQL Editor** → dán toàn bộ nội dung `supabase/schema.sql` → chạy (hoặc dùng `npx supabase db push` với `supabase/migrations/`).
3. Vào **Project Settings → API** → copy **Project URL** và khoá **anon/publishable** → điền vào `.env.local` (copy từ `.env.local.example`).
4. Mặc định Supabase **bật xác nhận email** khi đăng ký. Muốn test nhanh nội bộ, tắt ở **Authentication → Sign In / Providers → Email → Confirm email**.

### 2. Chạy ứng dụng

```bash
npm install
npm run dev
```

Mở http://localhost:3000 → bấm **Đăng ký**.

- Người **đầu tiên** đăng ký (để trống ô "Mã đội") sẽ tự động thành **trưởng nhóm** và được cấp một **mã mời đội** (hiện ở góc dưới sidebar).
- Các **môi giới khác** đăng ký sau, nhập đúng **mã mời đội** vào ô "Mã đội" để gia nhập cùng đội với vai trò **môi giới**.
- Sau khi đăng nhập, vào **Cài đặt** → bấm **"Khởi tạo danh mục mặc định"** để tạo sẵn: danh mục dropdown (giai đoạn khách, nguồn lead...), mốc pháp lý giao dịch Việt Nam, điểm chạm chăm sóc năm hiện tại, và mẫu checklist mặc định. Chỉ cần chạy một lần cho cả đội.

## Cấu trúc module

| Module | Route |
|---|---|
| Việc sắp tới (trang chủ) | `/` |
| Khách hàng | `/khach-hang` |
| Lead Tracker 8x8 | `/leads` |
| Chăm sóc 33 điểm chạm | `/cham-soc` |
| Người bán | `/nguoi-ban` |
| Người mua | `/nguoi-mua` |
| Giao dịch | `/giao-dich` |
| Giới thiệu | `/gioi-thieu` |
| Đối tác | `/doi-tac` |
| Dashboard KPI | `/dashboard` |
| Cài đặt | `/cai-dat` |

## Phân quyền

- Mỗi tài khoản thuộc một `team` (đội/sàn). Vai trò `truong_nhom` (trưởng nhóm) hoặc `moi_gioi` (môi giới).
- RLS (Row Level Security) trên Postgres: môi giới chỉ đọc/sửa/xoá được bản ghi do chính mình tạo (`created_by = auth.uid()`); trưởng nhóm thấy và sửa được toàn bộ bản ghi trong đội. Danh mục dùng chung (cài đặt, lookups, điểm chạm, mốc pháp lý, checklist mẫu) thì cả đội cùng thấy và sửa.
- Logic phân quyền nằm ở database (RLS + `SECURITY DEFINER` functions `my_team_id()` / `my_role()`), không chỉ ở giao diện — an toàn kể cả khi gọi thẳng API.

## Lưu ý quan trọng trước khi dùng thật

- **Chưa lưu CCCD, số tài khoản ngân hàng** vào bảng `contacts` mặc định. Nếu bắt buộc cần lưu, hãy thêm bảng/trường riêng có phân quyền chặt và tham khảo Nghị định 13/2023/NĐ-CP.
- Mốc pháp lý, thuế phí trong `milestone_templates` chỉ là **gợi ý cấu hình mặc định** (sinh tự động khi tạo giao dịch) — luôn kiểm tra lại với phòng công chứng/văn phòng đăng ký đất đai vì quy định có thể thay đổi.
- Trước khi giao cho cả đội dùng, hãy tự đăng ký tài khoản thật và đi qua luồng chính: thêm khách → Lead Tracker → chăm sóc → người bán/mua → giao dịch → dashboard.

## Việc có thể làm tiếp

- Lịch dạng lưới tháng thật (hiện "Việc sắp tới" và các module hiển thị dạng danh sách rút gọn cho follow-up/điểm chạm/lịch xem nhà, chưa có calendar grid).
- Trang quản lý thành viên đội cho trưởng nhóm (đổi vai trò, xem/xoá agent).
- Thông báo/nhắc việc chủ động qua email hoặc Zalo OA (hiện "Việc sắp tới" chỉ hiển thị trong app khi mở, chưa gửi thông báo).
- Xuất CSV danh sách người nhận một điểm chạm Universal để gửi bản tin hàng loạt.
