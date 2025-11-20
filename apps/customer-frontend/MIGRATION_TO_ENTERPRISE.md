# 🔄 MIGRATION GUIDE - Upgrade to Enterprise Chat

## 📋 CHECKLIST

Follow these steps to migrate your Chat Module to Enterprise features:

---

## ✅ STEP 1: Update Imports

### **Option A: Complete Migration (Recommended)**

Replace all `useChat` imports:

```typescript
// Before:
import { useChat } from "@/features/chat/hooks/useChat";

// After:
import { useChat } from "@/features/chat/hooks/useChat.enterprise";
```

**Files to update:**
- `src/features/chat/pages/ChatPage.tsx`
- `src/features/chat/components/ChatInterface.tsx`
- Any component using `useChat()`

### **Option B: Gradual Migration**

Keep old `useChat` and rename enterprise version:

```typescript
import { useChat as useChatEnterprise } from "@/features/chat/hooks/useChat.enterprise";

// Use in specific components
const { onSendText, retryMessage, isOnline } = useChatEnterprise();
```

---

## ✅ STEP 2: Update MessageBubble Component

Add status indicators and retry button:

```typescript
// File: src/features/chat/components/MessageBubble.tsx

import { Check, CheckCheck, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (tempId: string) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUserMessage = message.senderType === "User";

  // ✅ NEW: Status Icon
  const StatusIcon = () => {
    if (!isUserMessage) return null;

    switch (message.status) {
      case "pending":
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case "error":
        return (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            {message.tempId && onRetry && (
              <button
                onClick={() => onRetry(message.tempId!)}
                className="text-red-500 hover:text-red-600"
                title="Gửi lại"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto",
      message.status === "error" && "opacity-70"
    )}>
      <div className="flex-shrink-0">
        {isUserMessage ? <UserAvatar /> : <BotAvatar />}
      </div>

      <div className={cn(
        "rounded-lg px-4 py-2 max-w-full break-words",
        isUserMessage
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-900",
        message.status === "sending" && "opacity-60"
      )}>
        <MessageContent message={message} />
        
        {/* ✅ NEW: Status & Timestamp */}
        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
          <span>{new Date(message.createdAt!).toLocaleTimeString()}</span>
          <StatusIcon />
        </div>

        {/* ✅ NEW: Error message */}
        {message.error && (
          <div className="text-xs text-red-200 mt-1">
            {message.error}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ STEP 3: Update ChatMessages Component

Add typing indicator and offline banner:

```typescript
// File: src/features/chat/components/ChatMessages.tsx

import { useChat } from "@/features/chat/hooks/useChat.enterprise";
import { WifiOff, Loader2 } from "lucide-react";

export function ChatMessages() {
  const {
    messages,
    isLoadingAI,
    typingState,      // ✅ NEW
    isOnline,         // ✅ NEW
    retryMessage,     // ✅ NEW
  } = useChat();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ✅ NEW: Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline mode. Messages will be sent when online.</span>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 p-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            onRetry={msg.status === "error" ? retryMessage : undefined} // ✅ NEW
          />
        ))}

        {/* ✅ NEW: Typing Indicator */}
        {typingState?.isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{typingState.userName || "AI"} đang soạn tin...</span>
          </div>
        )}

        {/* AI Loading */}
        {isLoadingAI && !typingState && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI đang suy nghĩ...</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ STEP 4: Update ChatInput Component

Add typing event emission:

```typescript
// File: src/features/chat/components/ChatInput.tsx

import { useChat } from "@/features/chat/hooks/useChat.enterprise";

export function ChatInput() {
  const {
    onSendText,
    handleTyping,   // ✅ NEW
    emitTypingStop, // ✅ NEW
  } = useChat();

  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    handleTyping(); // ✅ NEW: Emit typing event (debounced)
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSendText(text);
    setText("");
    emitTypingStop(); // ✅ NEW: Stop typing indicator immediately
  };

  return (
    <div className="border-t p-4">
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Nhập tin nhắn..."
        className="w-full resize-none"
      />
      <button onClick={handleSubmit}>Gửi</button>
    </div>
  );
}
```

---

## ✅ STEP 5: Install Dependencies

Ensure these packages are installed:

```bash
cd apps/customer-frontend

# uuid for generating tempIds
pnpm add uuid
pnpm add -D @types/uuid

# lucide-react for icons (if not already installed)
pnpm add lucide-react
```

---

## ✅ STEP 6: Backend Socket Events (REQUIRED)

Implement these Socket.IO events in backend:

```javascript
// File: apps/customer-backend/src/infrastructure/realtime/socket.service.js

// 1. Typing Events
socket.on("typing_start", (data) => {
  const { conversationId, userId, userName } = data;
  socket.to(`conversation:${conversationId}`).emit("partner_typing", {
    conversationId,
    userId,
    userName,
  });
  console.log(`[Socket] ${userName} is typing in ${conversationId}`);
});

socket.on("typing_stop", (data) => {
  const { conversationId } = data;
  socket.to(`conversation:${conversationId}`).emit("typing_stop", {
    conversationId,
  });
  console.log(`[Socket] Typing stopped in ${conversationId}`);
});

// 2. Message Delivery ACK
socket.on("message_sent", (data) => {
  const { tempId, messageId } = data;
  socket.emit("message_delivered", {
    tempId,
    messageId,
  });
  console.log(`[Socket] Message delivered: ${messageId}`);
});

// 3. Read Receipts
socket.on("mark_read", async (data) => {
  const { conversationId, messageIds } = data;
  
  try {
    // Update messages in DB
    await Message.updateMany(
      { _id: { $in: messageIds }, conversationId },
      { $set: { readAt: new Date(), status: "read" } }
    );

    // Broadcast to other participants
    socket.to(`conversation:${conversationId}`).emit("message_read", {
      messageIds,
      userId: socket.userId,
      readAt: new Date(),
    });

    console.log(`[Socket] Messages marked as read in ${conversationId}`);
  } catch (error) {
    console.error(`[Socket] Error marking messages as read:`, error);
  }
});
```

---

## ✅ STEP 7: Test Everything

### **Test Checklist:**

```bash
# 1. Offline Queue
- [ ] Disconnect internet
- [ ] Send message → Shows "pending"
- [ ] Reconnect → Auto-sends

# 2. Typing Indicator
- [ ] Type in input → Partner sees indicator
- [ ] Stop typing 2s → Indicator disappears

# 3. Cross-Tab Sync
- [ ] Open 2 tabs → Send in Tab A → Appears in Tab B

# 4. Read Receipts
- [ ] Send message → 1 check
- [ ] Partner receives → 2 gray checks
- [ ] Partner reads → 2 blue checks

# 5. Retry Failed Messages
- [ ] Kill backend → Send message → Shows error
- [ ] Click retry → Message resends
```

---

## ⚠️ BREAKING CHANGES

### **None!**

The Enterprise `useChat` API is **100% backward compatible** with the original.

Existing code will work without changes. New features are optional.

---

## 🐛 TROUBLESHOOTING

### **Problem: TypeScript errors on `message.status`**

**Solution:** Update `ChatMessage` type import:

```typescript
import { ChatMessage, MessageStatus } from "@/types/chat";
```

### **Problem: Messages stuck in "sending"**

**Solution:** Check:
1. Backend API is running
2. Network tab shows successful requests
3. localStorage queue: `localStorage.getItem("printz_message_queue")`

### **Problem: Typing indicator not showing**

**Solution:** Check:
1. Socket.IO connection is active
2. Backend has `typing_start`/`typing_stop` handlers
3. User is in same conversation

### **Problem: Cross-tab sync not working**

**Solution:**
1. Check if BroadcastChannel is supported: `typeof BroadcastChannel !== "undefined"`
2. Fallback to localStorage events should work on all browsers
3. Check browser console for errors

---

## 📊 ROLLBACK PLAN

If you encounter issues, you can easily rollback:

### **Step 1: Revert imports**

```typescript
// Change back to:
import { useChat } from "@/features/chat/hooks/useChat";
```

### **Step 2: Remove Enterprise components**

- Remove status icons from `MessageBubble`
- Remove typing indicator from `ChatMessages`
- Remove offline banner

### **Step 3: Clear localStorage**

```javascript
localStorage.removeItem("printz_message_queue");
```

---

## ✅ SUCCESS METRICS

After migration, you should see:

- ✅ **Zero message loss** - Even when offline
- ✅ **Instant UI updates** - Optimistic rendering
- ✅ **Better UX** - Typing indicators, status tracking
- ✅ **Multi-tab support** - Real-time sync

---

## 🎉 DONE!

Your Chat Module is now **Enterprise-Grade**!

**Questions?** Check `ENTERPRISE_CHAT_GUIDE.md` for detailed documentation.

**Happy Coding! 🚀**

