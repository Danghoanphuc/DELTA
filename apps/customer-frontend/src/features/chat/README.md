# 🔥 Chat Feature - Enterprise Grade

## 📁 Folder Structure

```
chat/
├── components/           # UI Components
│   ├── message-status/  # Message status indicators & actions
│   │   ├── MessageStatusIndicator.tsx
│   │   ├── FailedMessageActions.tsx
│   │   └── index.ts
│   ├── offline/         # Offline queue UI
│   │   ├── OfflineQueueIndicator.tsx
│   │   └── index.ts
│   ├── chat-core/       # Core chat components (existing)
│   ├── messages/        # Message display components (existing)
│   └── ...              # Other components
│
├── hooks/               # React Hooks
│   ├── useChat.ts                    # Main chat hook
│   ├── useChatSender.ts              # Original sender (legacy)
│   ├── useChatSender.enhanced.ts     # ✨ NEW: Enhanced with retry
│   ├── useNetworkStatus.ts           # ✨ NEW: Network detection
│   └── ...                           # Other hooks
│
├── stores/              # Zustand Stores
│   ├── useChatStore.ts              # Original store (legacy)
│   └── useChatStore.enhanced.ts     # ✨ NEW: Enhanced with error handling
│
├── services/            # API Services
│   └── chat.api.service.ts
│
├── lib/                 # ✨ NEW: Core Libraries
│   ├── error-handler.ts    # Error parsing & handling
│   ├── retry-manager.ts    # Retry logic with exponential backoff
│   ├── offline-queue.ts    # Offline message queue
│   └── index.ts            # Barrel export
│
├── utils/               # Utilities
├── context/             # React Context
├── pages/               # Page components
└── README.md            # This file
```

## 🎯 Key Features

### 1. **Error Handling & Retry Logic**

#### Error Handler (`lib/error-handler.ts`)

- Parse lỗi từ API response hoặc network error
- Phân loại lỗi: Network, Timeout, Unauthorized, Rate Limit, etc.
- Log lên Sentry với context đầy đủ
- Hiển thị user-friendly error messages
- Debounce toast để tránh spam

```typescript
import { handleChatError } from "./lib";

try {
  await sendMessage();
} catch (error) {
  const chatError = handleChatError(error, {
    action: "send_message",
    conversationId: "xxx",
  });
  // Error đã được log và hiển thị
}
```

#### Retry Manager (`lib/retry-manager.ts`)

- Exponential backoff với jitter
- Configurable retry count & delays
- Abort controller để cancel tasks
- Singleton pattern cho global retry management

```typescript
import { RetryManager } from "./lib";

const retryManager = new RetryManager({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
});

await retryManager.execute(
  "task-id",
  async () => {
    return await apiCall();
  },
  (attempt, delay, error) => {
    console.log(`Retry ${attempt}, waiting ${delay}ms`);
  }
);
```

#### Offline Queue (`lib/offline-queue.ts`)

- Lưu messages khi offline vào localStorage
- Auto-flush khi back online
- Max queue size & retry count
- Persistent across page reloads

```typescript
import { offlineQueue } from "./lib";

// Add to queue
offlineQueue.add({
  tempId: "xxx",
  message: "Hello",
  conversationId: "yyy",
});

// Flush when online
await offlineQueue.flush(async (msg) => {
  await sendMessage(msg);
});
```

### 2. **Enhanced Store**

#### Features

- **Optimistic Messages**: Messages đang gửi
- **Failed Messages**: Messages gửi thất bại (để retry)
- **Typing Indicators**: Ai đang typing
- **Unread Counts**: Số tin chưa đọc
- **Message Status Tracking**: pending → sending → sent → delivered → read

```typescript
import { useEnhancedChatStore } from "./stores/useChatStore.enhanced";

const store = useEnhancedChatStore();

// Add optimistic message
store.addOptimisticMessage(conversationId, message);

// Mark as failed
store.markMessageAsFailed(conversationId, messageId, error);

// Retry
store.retryFailedMessage(conversationId, messageId);
```

### 3. **Enhanced Sender Hook**

#### Features

- Automatic retry với exponential backoff
- Optimistic UI updates
- Failed message tracking
- Offline queue integration
- Network status awareness

```typescript
import { useEnhancedChatSender } from "./hooks/useChatSender.enhanced";

const { onSendText, retryMessage, cancelFailedMessage, flushOfflineQueue } =
  useEnhancedChatSender();

// Send message (auto-retry on failure)
await onSendText("Hello");

// Retry failed message
await retryMessage(messageId, conversationId);

// Flush offline queue
await flushOfflineQueue();
```

### 4. **UI Components**

#### MessageStatusIndicator

Hiển thị trạng thái tin nhắn:

- ⏱️ Pending/Sending
- 🔄 Retrying
- ✓ Sent
- ✓✓ Delivered
- ✓✓ Read (blue)
- ❌ Failed

#### FailedMessageActions

UI để retry hoặc cancel tin nhắn failed:

- Hiển thị error message
- Button "Thử lại"
- Button "Hủy"

#### OfflineQueueIndicator

Hiển thị số tin nhắn đang chờ gửi:

- Badge với số lượng
- Button "Gửi ngay" khi online
- Auto-hide khi queue empty

### 5. **Network Status Hook**

```typescript
import { useNetworkStatus } from "./hooks/useNetworkStatus";

const { isOnline, wasOffline } = useNetworkStatus();

// Auto-flush queue when back online
// Auto-show toast notifications
```

## 🚀 Migration Guide

### Step 1: Import Enhanced Components

```typescript
// Old
import { useChatSender } from "./hooks/useChatSender";

// New
import { useEnhancedChatSender } from "./hooks/useChatSender.enhanced";
```

### Step 2: Update MessageBubble

MessageBubble đã được update để hiển thị:

- Status indicator
- Failed message actions
- Retry UI

### Step 3: Add OfflineQueueIndicator

```tsx
import { OfflineQueueIndicator } from "./components/offline";

function ChatPage() {
  const { flushOfflineQueue } = useEnhancedChatSender();

  return (
    <>
      <ChatInterface />
      <OfflineQueueIndicator onFlush={flushOfflineQueue} />
    </>
  );
}
```

### Step 4: Add Network Status

```tsx
import { useNetworkStatus } from "./hooks/useNetworkStatus";

function ChatInterface() {
  const { isOnline } = useNetworkStatus();

  return (
    <div>
      {!isOnline && <OfflineBanner />}
      {/* ... */}
    </div>
  );
}
```

## 📊 Type Safety

### Enhanced Types

```typescript
// Message Status
type MessageStatus =
  | "pending"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "retrying";

// Chat Error
interface ChatError {
  code: ChatErrorCode;
  message: string;
  originalError?: any;
  retryable: boolean;
  userMessage: string;
}

// Queued Message
interface QueuedMessage {
  tempId: string;
  message: string;
  conversationId: string | null;
  retryCount: number;
  createdAt: number;
  error?: string;
}
```

## 🧪 Testing

### Test Error Scenarios

```typescript
// Simulate network error
await sendMessage(); // Will auto-retry 3 times

// Simulate offline
window.dispatchEvent(new Event("offline"));
await sendMessage(); // Will add to offline queue

// Simulate back online
window.dispatchEvent(new Event("online"));
// Queue will auto-flush
```

### Test Retry Logic

```typescript
const retryManager = new RetryManager({ maxRetries: 3 });

let attempt = 0;
await retryManager.execute("test", async () => {
  attempt++;
  if (attempt < 3) throw new Error("Fail");
  return "Success";
});

expect(attempt).toBe(3);
```

## 📈 Performance

### Optimizations

- Debounced error toasts (3s)
- Exponential backoff để tránh spam server
- Jitter để tránh thundering herd
- LocalStorage cho offline queue (persistent)
- Zustand immer middleware (immutable updates)

### Memory Management

- Auto-cleanup retry tasks on unmount
- Max queue size (50 messages)
- Auto-remove old messages (>24h)

## 🔒 Security

### Best Practices

- Không retry unauthorized errors
- Không retry validation errors
- Log sensitive errors to Sentry only
- Sanitize error messages cho user

## 📝 TODO

- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Add Storybook stories
- [ ] Add performance monitoring
- [ ] Add analytics tracking
- [ ] Migrate all components to enhanced versions
- [ ] Remove legacy code

## 🤝 Contributing

Khi thêm features mới:

1. Đặt trong folder phù hợp (components/hooks/lib)
2. Export qua index.ts
3. Update README.md
4. Add TypeScript types
5. Add error handling
6. Add tests

## 📚 References

- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Optimistic UI](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- [Offline First](https://offlinefirst.org/)
- [Zustand](https://github.com/pmndrs/zustand)
