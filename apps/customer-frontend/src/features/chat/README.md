# Chat AI Feature - Clean Architecture Implementation

## Tổng quan

Hệ thống Chat AI đã được refactor hoàn toàn theo các nguyên tắc:
- **Smart vs Dumb Components** (Tách biệt trách nhiệm)
- **Custom Hooks** (Giấu logic vào hậu trường)
- **Mobile-First & Safe Layout** (Tránh vỡ giao diện)
- **S.O.L.I.D Principles** (Single Responsibility, DRY, v.v.)
- **Fail-Safe Pattern** (Xử lý lỗi từ gốc)

## Cấu trúc Architecture

```
features/chat/
├── components/           # Dumb components (chỉ UI)
│   ├── ChatContainer.tsx      # Smart container
│   ├── ChatInterface.tsx      # Smart interface
│   ├── MessageList.tsx        # Dumb - render messages
│   ├── MessageBubble.tsx      # Dumb - single message
│   ├── QuickReplyButtons.tsx  # Dumb - quick replies
│   ├── ChatInput.tsx          # Dumb - input field
│   ├── ChatErrorBoundary.tsx  # Error boundary
│   └── ...
├── hooks/               # Custom hooks (logic)
│   ├── useChat.ts            # Main chat logic
│   ├── useMessageState.ts    # Message state management
│   ├── useConversationState.ts # Conversation management
│   ├── useFileUpload.ts      # File upload logic
│   ├── useResponsiveChat.ts  # Responsive design
│   └── useChatPerformance.ts # Performance optimization
├── context/             # React Context
│   └── ChatProvider.tsx      # State provider
├── services/            # API services
│   └── chat.api.service.ts   # API calls
└── types/               # TypeScript types
```

## Nguyên tắc Implementation

### 1. Smart vs Dumb Components

**Smart Components** (Có logic):
- `ChatContainer` - Container chính, manage state
- `ChatInterface` - Kết hợp các dumb components

**Dumb Components** (Chỉ UI):
- `MessageList` - Chỉ render list messages
- `MessageBubble` - Chỉ render một message
- `ChatInput` - Chỉ input field, không logic business

### 2. Custom Hooks Pattern

```tsx
// ❌ Bad: Logic trong component
function ChatComponent() {
  const [messages, setMessages] = useState([]);
  // 50+ lines of state logic...
}

// ✅ Good: Logic trong custom hook
function ChatComponent() {
  const { messages, sendMessage } = useChat();
  // Chỉ UI logic
}
```

### 3. Mobile-First Layout

```tsx
const { isMobile, sidebarCollapsed } = useResponsiveChat();

return (
  <div className={cn(
    "flex h-full",
    isMobile ? "flex-col" : "flex-row"  // Mobile-first
  )}>
    {/* Responsive layout */}
  </div>
);
```

### 4. S.O.L.I.D Principles

**Single Responsibility:**
- `useMessageState` - Chỉ quản lý messages
- `useConversationState` - Chỉ quản lý conversations
- `useFileUpload` - Chỉ handle file upload

**DRY (Don't Repeat Yourself):**
- Logic validation tập trung trong custom hooks
- UI patterns tái sử dụng qua dumb components

### 5. Fail-Safe Error Handling

```tsx
<ChatErrorBoundary>
  <Suspense fallback={<ChatSkeleton />}>
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  </Suspense>
</ChatErrorBoundary>
```

## Cách sử dụng

### Basic Usage

```tsx
import { ChatContainer } from '@/features/chat/components/ChatContainer';

function App() {
  return (
    <div className="h-screen">
      <ChatContainer />
    </div>
  );
}
```

### Custom Hook Usage

```tsx
import { useChatContext } from '@/features/chat/context/ChatProvider';

function CustomChat() {
  const {
    messages,
    sendMessage,
    conversations,
    isLoading
  } = useChatContext();

  // Your custom UI logic
}
```

## Performance Optimizations

1. **Virtual Scrolling**: Render chỉ visible messages
2. **Memory Management**: Cleanup old messages automatically
3. **Lazy Loading**: Components load on demand
4. **Debounced Operations**: Prevent excessive API calls

## Error Handling

1. **Error Boundaries**: Catch React errors
2. **API Error Handling**: Graceful API failures
3. **Loading States**: Proper UX during async operations
4. **Fallback UI**: Always show something to user

## Mobile Responsiveness

- **Breakpoint System**: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- **Touch-Friendly**: Large touch targets
- **Swipe Gestures**: Native mobile interactions
- **Safe Layouts**: Prevent content overflow

## Testing Strategy

```tsx
// Test dumb components in isolation
describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    // Pure UI testing
  });
});

// Test custom hooks with React Testing Library
describe('useMessageState', () => {
  it('adds messages correctly', () => {
    // Logic testing
  });
});
```

## Migration Guide

### From Old to New Structure

1. **Replace imports:**
```tsx
// Old
import { ChatMessages } from '@/features/chat/components/ChatMessages';

// New
import { MessageList } from '@/features/chat/components/MessageList';
import { ChatContainer } from '@/features/chat/components/ChatContainer';
```

2. **Update usage:**
```tsx
// Old
<ChatMessages messages={messages} />

// New
<ChatContainer />
```

## Best Practices

1. **Keep dumb components pure** - No side effects
2. **Extract logic to hooks** - Business logic in custom hooks
3. **Use TypeScript strictly** - Type safety first
4. **Test components in isolation** - Unit test dumb components
5. **Monitor performance** - Use React DevTools Profiler

## Future Enhancements

- [ ] Message search functionality
- [ ] Message reactions/emojis
- [ ] Voice messages
- [ ] Message threading
- [ ] Advanced moderation tools
- [ ] Analytics dashboard
