# Shared Components Documentation

## 🛡️ ErrorBoundary

React Error Boundary để catch và handle errors gracefully.

### Usage

```tsx
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponentThatMightCrash />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
<ErrorBoundary 
  fallback={
    <div>Custom error UI here</div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

### Features
- ✅ Catches all React errors in children
- ✅ Shows friendly error UI
- ✅ "Try again" button to reset
- ✅ "Reload page" button
- ✅ Expandable error details for developers
- ✅ Dark mode support

### When to Use
- Wrap entire pages/routes
- Wrap complex features (chat, editor, etc.)
- Wrap third-party components
- **Don't** wrap every single component (too granular)

---

## 🔒 FocusTrap

Component để trap focus trong modals/drawers.

### Usage

```tsx
import { FocusTrap } from '@/shared/components/ui/FocusTrap';

function Modal({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap active={isOpen}>
          <div role="dialog" aria-modal="true">
            <button>First button</button>
            <input type="text" />
            <button>Last button</button>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}
```

### Props

```tsx
interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;  // Default: true
}
```

### Behavior
- ✅ Auto-focuses first focusable element
- ✅ Tab cycles: first → ... → last → first
- ✅ Shift+Tab cycles: last → ... → first → last
- ✅ Only traps when `active={true}`
- ✅ Handles disabled elements correctly

### Focusable Elements
Traps these elements:
- `<button>` (not disabled)
- `<a href="...">`
- `<input>` (not disabled)
- `<select>` (not disabled)
- `<textarea>` (not disabled)
- `[tabindex]` (not `-1`)

---

## 💀 Skeleton Loaders

Loading placeholder components.

### Usage

```tsx
import { 
  Skeleton, 
  ChatHistorySkeleton, 
  ChatMessageSkeleton 
} from '@/shared/components/ui/skeleton';

function MyComponent({ isLoading, data }) {
  if (isLoading) {
    return <ChatHistorySkeleton />;
  }
  
  return <div>{data}</div>;
}
```

### Available Skeletons

#### 1. `<Skeleton />` - Generic
```tsx
<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-32 rounded-full" />
```

#### 2. `<ChatHistorySkeleton />` - Chat History
Shows 5 conversation items with icon + 2 lines

#### 3. `<ChatMessageSkeleton />` - Chat Messages
Shows 3 messages with avatar + 3 lines each

### Customization

```tsx
// Custom skeleton
<Skeleton className="h-20 w-20 rounded-full" />

// Multiple skeletons
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
  <Skeleton className="h-4 w-4/6" />
</div>
```

### Features
- ✅ Dark mode support
- ✅ Pulse animation
- ✅ Fully customizable with Tailwind classes
- ✅ Semantic (conveys "loading" state)

---

## 🎨 Best Practices

### ErrorBoundary
```tsx
// ✅ Good: Wrap features
<ErrorBoundary>
  <ChatMessages />
</ErrorBoundary>

// ❌ Bad: Too granular
<ErrorBoundary>
  <Button />
</ErrorBoundary>
```

### FocusTrap
```tsx
// ✅ Good: Active only when open
<FocusTrap active={isOpen}>
  <Dialog />
</FocusTrap>

// ❌ Bad: Always active
<FocusTrap>
  <div />
</FocusTrap>
```

### Skeleton
```tsx
// ✅ Good: Match actual content size
{isLoading ? (
  <Skeleton className="h-48 w-full rounded-lg" />
) : (
  <img className="h-48 w-full rounded-lg" />
)}

// ❌ Bad: Different size
{isLoading ? (
  <Skeleton className="h-10 w-10" />
) : (
  <img className="h-48 w-full" />
)}
```

---

## 📦 Component Checklist

When creating new shared components:
- [ ] TypeScript types/interfaces
- [ ] Dark mode support
- [ ] Accessibility (ARIA labels, roles, etc.)
- [ ] JSDoc comments
- [ ] Storybook story (if complex)
- [ ] Unit tests (if logic)
- [ ] README entry (this file)

---

## 🔗 Related

- [Custom Hooks](../hooks/README.md)
- [UI Components](./ui/README.md)
- [Design System](../../../docs/design-system.md)

