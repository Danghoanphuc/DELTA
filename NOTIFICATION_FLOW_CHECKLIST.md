# ✅ Checklist Kiểm Tra Luồng Notification

## 🔍 Bước 1: Kiểm Tra Backend

### 1.1. Redis Connection
- [ ] Redis đang chạy (port 6379)
- [ ] Kiểm tra logs: `[Queue] 📥 Added job 'chat-notify'...`

### 1.2. Notification Worker
- [ ] Worker đã khởi động (xem logs server: `[Worker] 🚀 Notification Worker started`)
- [ ] Kiểm tra logs: `[Worker] ⚙️ Processing job...`
- [ ] Kiểm tra logs: `[Worker] ✅ Job completed!`

### 1.3. Novu Service
- [ ] `NOVU_API_KEY` đã được set trong `.env` của backend
- [ ] Kiểm tra logs: `[Novu] Service initialized`
- [ ] Kiểm tra logs: `[Novu] ✅ Triggered chat-notification for...`

### 1.4. Social Chat Service
- [ ] Khi gửi tin nhắn, kiểm tra logs: `[Queue] 📥 Added job 'chat-notify'`
- [ ] Đảm bảo `addNotificationJob` được gọi (không có lỗi)

---

## 🔍 Bước 2: Kiểm Tra Frontend

### 2.1. Environment Variables
- [ ] File `.env` hoặc `.env.local` có `VITE_NOVU_APPLICATION_IDENTIFIER`
- [ ] Giá trị: `VITE_NOVU_APPLICATION_IDENTIFIER=xl-4XbtSkQzF`

### 2.2. NotificationInbox Component
- [ ] Component được render trong `GlobalHeader` (chỉ khi authenticated)
- [ ] Mở browser console, không có lỗi: `VITE_NOVU_APPLICATION_IDENTIFIER is not defined`
- [ ] Component hiển thị icon bell trong header

### 2.3. Subscriber ID
- [ ] User đã đăng nhập (`user._id` tồn tại)
- [ ] `subscriberId` được truyền đúng vào `<Inbox />`

### 2.4. Novu Connection
- [ ] Mở browser DevTools → Network tab
- [ ] Kiểm tra có request đến `api.novu.co` hoặc `eu.api.novu.co` không
- [ ] Kiểm tra WebSocket connection đến `ws.novu.co` hoặc `eu.ws.novu.co`

---

## 🔍 Bước 3: Test End-to-End

### 3.1. Gửi Tin Nhắn Test
1. [ ] Đăng nhập với User A
2. [ ] Đăng nhập với User B (tab khác hoặc browser khác)
3. [ ] User A gửi tin nhắn cho User B
4. [ ] Kiểm tra backend logs:
   - `[Queue] 📥 Added job 'chat-notify' for user <UserB_ID>`
   - `[Worker] ⚙️ Processing job...`
   - `[Novu] ✅ Triggered chat-notification for <UserB_ID>`
5. [ ] Kiểm tra frontend User B:
   - Icon bell có hiển thị badge số không?
   - Click vào bell có hiển thị notification không?

### 3.2. Kiểm Tra Lỗi Thường Gặp

#### Lỗi: "Subscriber not found"
- [ ] Backend có gọi `_ensureSubscriber()` trước khi trigger không?
- [ ] User ID có đúng format không?

#### Lỗi: "Workflow not found"
- [ ] Trong Novu Dashboard, workflow `chat-notification` đã được tạo chưa?
- [ ] Workflow ID có đúng là `chat-notification` không?

#### Lỗi: Queue không hoạt động
- [ ] Redis có đang chạy không? (`redis-cli ping`)
- [ ] Worker có được khởi động trong `server.ts` không?

#### Lỗi: Frontend không hiển thị
- [ ] Browser console có lỗi gì không?
- [ ] `VITE_NOVU_APPLICATION_IDENTIFIER` có được set đúng không?
- [ ] User đã đăng nhập chưa?

---

## 🛠️ Debug Commands

### Backend
```bash
# Kiểm tra Redis
redis-cli ping

# Xem logs backend
# Tìm các dòng:
# - [Queue] 📥 Added job
# - [Worker] ⚙️ Processing job
# - [Novu] ✅ Triggered
```

### Frontend
```javascript
// Mở browser console và chạy:
console.log('Novu App ID:', import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER);
console.log('User ID:', useAuthStore.getState().user?._id);
```

---

## 📝 Notes

- Notification chỉ được gửi cho **recipient** (không phải sender)
- Worker xử lý bất đồng bộ, có thể mất vài giây
- Nếu không thấy notification, kiểm tra Novu Dashboard → Activity Feed

