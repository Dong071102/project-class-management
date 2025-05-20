# 🎓 Class Manager System – Lecturer Frontend

Đây là giao diện quản lý dành riêng cho **giảng viên** trong hệ thống **Class Manager System**, giúp giảng viên theo dõi, quản lý lịch dạy, điểm danh và sinh viên trong lớp một cách dễ dàng, trực quan và real-time.

Để có thể hoạt động được ứng dụng vui lòng cài đặt các services backend phụ thuộc:
(🔐 Auth CMS Backend)[https://github.com/Dong071102/cms-auth-API-service] là một dịch vụ xác thực và phân quyền người dùng được xây dựng bằng Golang + Echo, phục vụ cho hệ thống quản lý lớp học thông minh. Hệ thống cung cấp các tính năng quản lý tài khoản, xác thực JWT, phân quyền theo vai trò (role-based access control), và khôi phục mật khẩu.

---

## 🚀 Tính năng chính cho giảng viên

### 📅 Quản lý lịch giảng dạy
- Hiển thị lịch dạy theo tuần
- Xem lớp học sắp diễn ra trong 2 giờ tới
- Giao diện dạng calendar/table trực quan

### 📋 Quản lý lớp học & sinh viên
- Xem danh sách lớp đang giảng dạy
- Xem danh sách sinh viên theo lớp
- Thêm / xóa / chỉnh sửa sinh viên
- Cập nhật điểm danh thủ công

### 📊 Báo cáo điểm danh
- Tổng hợp số buổi điểm danh
- Tỷ lệ chuyên cần của từng sinh viên
- Tra cứu lịch sử điểm danh

### 🤖 Tích hợp AI Camera
- Xem ảnh nhận diện khuôn mặt từ camera (Face Recognition)
- Xem ảnh đếm người trong lớp học (Human Counter)
- Giao tiếp WebSocket để stream ảnh real-time

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Vai trò |
|----------|---------|
| ⚛️ React + Vite | Giao diện người dùng hiện đại |
| 🧠 TypeScript | An toàn, rõ ràng |
| 💨 TailwindCSS | Thiết kế responsive, tiện lợi |
| 🔄 React Query | Quản lý gọi API, caching |
| 🧩 Context / Zustand | Quản lý trạng thái đăng nhập |
| 🌐 WebSocket | Nhận ảnh AI real-time |
| 🔐 JWT Token | Phân quyền theo vai trò `lecturer` |

---

## ⚙️ Cài đặt & chạy ứng dụng

### 1. Clone project

```bash
git clone https://github.com/yourusername/class_manager_frontend.git
cd class_manager_frontend
```

### 2. Cài dependencies

```bash
npm install
# hoặc:
yarn
```

### 3. Chạy project

```bash
npm run dev
# hoặc:
yarn dev
```

Ứng dụng chạy tại: `http://localhost:5173`

---

## 🔗 Biến môi trường `.env`

```env
VITE_API_URL=http://localhost:8080              # CMS Backend
VITE_AUTH_API_URL=http://localhost:8081         # Auth Service
VITE_WEBSOCKET_URL=ws://localhost:11000         # WebSocket Camera AI
VITE_IMAGE_URL=http://localhost:15000           # Image Handle Service
```

---

## 📁 Cấu trúc thư mục chính

```
src/
├── pages/                 # Trang: Dashboard, Attendance, Profile,...
├── components/            # Header, Sidebar, Table,...
├── services/              # Gọi API backend
├── sockets/               # Kết nối WebSocket
├── types/                 # TypeScript types
├── hooks/                 # Custom hooks
├── stores/                # Auth / UI state
└── utils/                 # Helper functions
```

---

## 🧑‍🏫 Phân quyền

- Giảng viên khi đăng nhập sẽ được gán role `"lecturer"`
- Các route được bảo vệ bằng `ProtectedRoute` và `AuthContext`

---

## 📧 Tác giả

- **Tên**: Vũ Bá Đông  
- 📩 Email: [vubadong071102@gmail.com](mailto:vubadong071102@gmail.com)

---

## 📄 License

MIT License
