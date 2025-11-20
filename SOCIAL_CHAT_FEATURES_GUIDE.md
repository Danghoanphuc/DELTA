# 🚀 Hướng Dẫn Sử Dụng Tính Năng Chat Xã Hội (Social Chat)

## 📋 **TÓM TẮT CÁC TÍNH NĂNG MỚI**

Hệ thống PrintZ giờ đã có **3 loại chat**:

1. **🤖 Chat với AI Bot** (đã có từ trước)
2. **🏭 Chat với Printer** (NEW)
3. **👥 Chat Peer-to-Peer** (P2P - Chat 1-1 với bạn bè) (NEW)

---

## 🎯 **TÍNH NĂNG 1: KẾT BẠN (CONNECTION SYSTEM)**

### Backend APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/connections/send` | Gửi lời mời kết bạn |
| PUT | `/api/connections/:id/accept` | Chấp nhận lời mời |
| PUT | `/api/connections/:id/decline` | Từ chối lời mời |
| POST | `/api/connections/block` | Chặn người dùng |
| GET | `/api/connections/friends` | Lấy danh sách bạn bè |
| GET | `/api/connections/pending` | Lấy lời mời chờ duyệt |
| GET | `/api/connections/sent` | Lấy lời mời đã gửi |
| DELETE | `/api/connections/:id` | Hủy kết bạn |

### Frontend Components

```tsx
import { 
  ConnectionButton, 
  FriendsList, 
  PendingRequests 
} from '@/features/social/components';

// Sử dụng button kết bạn
<ConnectionButton userId="..." userName="..." />

// Hiển thị danh sách bạn bè
<FriendsList />

// Hiển thị lời mời chờ duyệt
<PendingRequests />
```

### Testing Scenario - Kết Bạn

**Bước 1: User A gửi lời mời kết bạn**
```bash
# Login as User A
POST /api/connections/send
{
  "recipientId": "<USER_B_ID>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã gửi lời mời kết bạn",
  "data": {
    "connection": {
      "_id": "...",
      "requester": {...},
      "recipient": {...},
      "status": "pending"
    }
  }
}
```

**Bước 2: User B xem lời mời chờ duyệt**
```bash
# Login as User B
GET /api/connections/pending
```

**Bước 3: User B chấp nhận lời mời**
```bash
PUT /api/connections/<CONNECTION_ID>/accept
```

**Expected:**
- Connection status → `"accepted"`
- User A và B giờ là bạn bè
- Socket event `connection_accepted` được emit đến User A

---

## 🎯 **TÍNH NĂNG 2: CHAT VỚI PRINTER**

### Backend API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/chat/conversations/printer/:printerId` | Tạo hoặc lấy cuộc trò chuyện với Printer |

### Frontend Hook

```tsx
import { useChatWithPrinter } from '@/features/chat/hooks/useChatWithPrinter';

const { startChatWithPrinter, isLoading } = useChatWithPrinter();

// Sử dụng
<button onClick={() => startChatWithPrinter(printerId)}>
  Nhắn tin với Printer
</button>
```

### Component Integration

File: `apps/customer-frontend/src/features/printers/components/PrinterCard.tsx`

```tsx
import { useChatWithPrinter } from '../../chat/hooks/useChatWithPrinter';

export const PrinterCard = ({ printer }) => {
  const { startChatWithPrinter, isLoading } = useChatWithPrinter();
  
  return (
    <div>
      {/* ... printer info ... */}
      <button onClick={() => startChatWithPrinter(printer._id)}>
        Nhắn tin
      </button>
    </div>
  );
};
```

### Testing Scenario - Chat với Printer

**Bước 1: Customer tạo conversation với Printer**
```bash
# Login as Customer
POST /api/chat/conversations/printer/<PRINTER_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã tạo cuộc trò chuyện với nhà in",
  "data": {
    "conversation": {
      "_id": "...",
      "type": "customer-printer",
      "title": "Chat với ABC Print Shop",
      "participants": [
        { "userId": {...}, "role": "customer" },
        { "userId": {...}, "role": "printer" }
      ]
    },
    "isNew": true
  }
}
```

**Bước 2: Gửi tin nhắn**
```bash
POST /api/chat/message
{
  "message": "Anh ơi, shop có in nhanh được không?",
  "conversationId": "<CONVERSATION_ID>"
}
```

**Expected:**
- Printer nhận được tin nhắn qua Socket event `new_message`
- Conversation `lastMessageAt` được update

---

## 🎯 **TÍNH NĂNG 3: PEER-TO-PEER CHAT (P2P)**

### Backend API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/chat/conversations/peer/:userId` | Tạo hoặc lấy cuộc trò chuyện 1-1 với bạn bè |

### Frontend Hook

```tsx
import { useChatWithUser } from '@/features/chat/hooks/useChatWithUser';

const { startChatWithUser, isLoading } = useChatWithUser();

// Sử dụng
<button onClick={() => startChatWithUser(friendId)}>
  Nhắn tin
</button>
```

### Constraint (Quan trọng!)

- **Chỉ có thể chat 1-1 nếu 2 người đã kết bạn (status = "accepted")**
- Backend sẽ validate bằng `Connection.areConnected()`
- Nếu chưa kết bạn → Trả về error `"Bạn phải kết bạn trước khi có thể chat"`

### Testing Scenario - P2P Chat

**Bước 1: Đảm bảo User A và User B đã kết bạn**
```bash
GET /api/connections/friends
# Confirm User B có trong danh sách
```

**Bước 2: User A tạo P2P conversation với User B**
```bash
POST /api/chat/conversations/peer/<USER_B_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã tạo cuộc trò chuyện",
  "data": {
    "conversation": {
      "_id": "...",
      "type": "peer-to-peer",
      "title": "Chat với User B",
      "participants": [
        { "userId": {...}, "role": "member" },
        { "userId": {...}, "role": "member" }
      ]
    },
    "isNew": true
  }
}
```

**Bước 3: Gửi tin nhắn**
```bash
POST /api/chat/message
{
  "message": "Chào bạn! 👋",
  "conversationId": "<CONVERSATION_ID>"
}
```

**Expected:**
- User B nhận được tin nhắn qua Socket event `new_message`
- UI hiển thị tin nhắn trong `MessageList`

---

## 🎯 **SOCKET EVENTS - REAL-TIME**

### Connection Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `connection_request_sent` | Client → Server | `{ recipientId, requestId }` |
| `connection_request_received` | Server → Client | `{ requestId, requesterId, timestamp }` |
| `connection_accepted` | Client → Server | `{ requesterId, connectionId }` |
| `connection_accepted` | Server → Client | `{ connectionId, accepterId, timestamp }` |

### Typing Indicator Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `typing_start` | Client → Server | `{ conversationId, recipientId }` |
| `typing_stop` | Client → Server | `{ conversationId, recipientId }` |
| `partner_typing` | Server → Client | `{ conversationId, userId, isTyping, timestamp }` |

### Read Receipt Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `mark_read` | Client → Server | `{ conversationId, messageId, recipientId }` |
| `message_read` | Server → Client | `{ conversationId, messageId, readBy, timestamp }` |
| `message_delivered` | Client → Server | `{ messageId, senderId }` |
| `message_delivered_ack` | Server → Client | `{ messageId, deliveredTo, timestamp }` |

---

## 🧪 **TESTING CHECKLIST**

### ✅ Backend Testing

- [ ] Connection CRUD operations hoạt động
- [ ] Không thể gửi duplicate connection request
- [ ] Chỉ recipient mới có thể accept/decline
- [ ] `Connection.areConnected()` static method hoạt động đúng
- [ ] Chat với Printer tạo conversation với type `"customer-printer"`
- [ ] P2P Chat kiểm tra connection trước khi tạo conversation
- [ ] Socket events được emit đúng room (`user:xxx`)

### ✅ Frontend Testing

- [ ] `ConnectionButton` hiển thị đúng state (Kết bạn / Đã gửi / Bạn bè)
- [ ] `FriendsList` hiển thị danh sách bạn bè
- [ ] `PendingRequests` hiển thị lời mời chờ duyệt
- [ ] Click "Nhắn tin với Printer" → Tạo conversation và navigate đến chat
- [ ] Click "Nhắn tin" (friend) → Tạo P2P conversation
- [ ] Không thể P2P chat nếu chưa kết bạn (hiển thị toast error)

### ✅ UI/UX Testing

- [ ] Loading states được hiển thị (spinner, disabled buttons)
- [ ] Toast notifications hiển thị đúng thông báo
- [ ] Real-time updates (Socket events) hoạt động
- [ ] Responsive design (Mobile & Desktop)

---

## 📁 **FILE STRUCTURE OVERVIEW**

### Backend

```
apps/customer-backend/
├── src/
│   ├── shared/models/
│   │   ├── connection.model.js          # NEW
│   │   └── conversation.model.js        # UPDATED (type: peer-to-peer)
│   ├── modules/
│   │   ├── connections/                  # NEW
│   │   │   ├── connection.repository.js
│   │   │   ├── connection.service.js
│   │   │   ├── connection.controller.js
│   │   │   └── connection.routes.js
│   │   └── chat/
│   │       ├── chat-conversation.controller.js  # NEW
│   │       └── chat.routes.js           # UPDATED
│   └── infrastructure/realtime/
│       └── socket.service.js            # UPDATED (3 new event setups)
```

### Frontend

```
apps/customer-frontend/
├── src/
│   ├── services/api/
│   │   └── connection.api.service.ts    # NEW
│   ├── stores/
│   │   └── useConnectionStore.ts        # NEW
│   ├── features/
│   │   ├── social/components/           # NEW
│   │   │   ├── ConnectionButton.tsx
│   │   │   ├── FriendsList.tsx
│   │   │   └── PendingRequests.tsx
│   │   ├── chat/
│   │   │   ├── services/
│   │   │   │   └── chat.api.service.ts  # UPDATED
│   │   │   └── hooks/
│   │   │       ├── useChatWithPrinter.ts # NEW
│   │   │       └── useChatWithUser.ts    # NEW
│   │   └── printers/components/
│   │       └── PrinterCard.tsx          # UPDATED
```

---

## 🚀 **QUICK START - Test Ngay!**

### 1. Start Backend

```bash
cd apps/customer-backend
pnpm dev
```

### 2. Start Frontend

```bash
cd apps/customer-frontend
pnpm dev
```

### 3. Test Flow

**A. Test Kết Bạn:**
1. Đăng nhập 2 user khác nhau (dùng 2 browser)
2. User A tìm profile của User B
3. Click "Kết bạn"
4. User B vào tab "Lời mời kết bạn" → Click "Chấp nhận"
5. Check danh sách bạn bè của cả 2

**B. Test Chat với Printer:**
1. Đăng nhập Customer
2. Vào trang "Danh sách Printer"
3. Click "Nhắn tin" trên 1 printer card
4. Gửi tin nhắn → Check printer có nhận được không

**C. Test P2P Chat:**
1. Đảm bảo 2 user đã kết bạn (từ test A)
2. User A vào "Bạn bè" → Click "Nhắn tin" với User B
3. Gửi tin nhắn
4. User B mở chat → Xem có nhận tin nhắn không

---

## 🐛 **TROUBLESHOOTING**

### Lỗi: "pnpm: command not found"

```bash
npm install -g pnpm
```

### Lỗi: Connection không tạo được

- Check MongoDB connection
- Check `Connection.model.js` có được import đúng không
- Xem log backend: `[ConnectionService]`

### Lỗi: Socket events không nhận được

- Check Redis có đang chạy không (`redis-server`)
- Check `@socket.io/redis-adapter` đã được cài đặt chưa
- Xem log: `[SocketService]`

### Lỗi: Frontend không navigate sau khi tạo conversation

- Check `react-router-dom` version
- Check `useNavigate()` hook có được gọi đúng không

---

## 📚 **NEXT STEPS (Tương Lai)**

- [ ] **Group Chat** (Chat nhóm nhiều người)
- [ ] **Voice Call** (Gọi thoại)
- [ ] **Video Call** (Gọi video)
- [ ] **Message Reactions** (React tin nhắn bằng emoji)
- [ ] **Message Threading** (Trả lời thread)
- [ ] **File Sharing** (Chia sẻ file)
- [ ] **Online Status Indicator** (Hiển thị trạng thái online/offline)

---

## 💬 **HỖ TRỢ**

Nếu gặp lỗi hoặc cần hỗ trợ, hãy kiểm tra:
1. Console logs (Browser DevTools)
2. Backend logs (Terminal)
3. Network tab (API responses)

Happy coding! 🚀

