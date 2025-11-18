# Custom Hooks Documentation

## 🎯 useMediaQuery

Hook để detect media queries một cách reliable.

### Usage

```tsx
import { useMediaQuery, useIsMobile, useIsDesktop } from '@/shared/hooks/useMediaQuery';

function MyComponent() {
  // Basic usage
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  
  // Preset helpers
  const isMobile = useIsMobile();    // < 1024px
  const isTablet = useIsTablet();    // 768px - 1023px
  const isDesktop = useIsDesktop();  // >= 1024px
  
  return (
    <div>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  );
}
```

### Benefits
- ✅ SSR safe (checks `typeof window`)
- ✅ Auto-updates on resize
- ✅ Better performance than `window.innerWidth`
- ✅ Event-driven, not polling

---

## ⌨️ useKeyboardShortcuts

Hook để register keyboard shortcuts.

### Usage

```tsx
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  useKeyboardShortcuts([
    {
      key: 'k',
      meta: true,      // Cmd on Mac
      ctrl: true,      // Ctrl on Windows
      callback: () => setIsOpen(true),
      description: 'Open search'
    },
    {
      key: 'Escape',
      callback: () => setIsOpen(false)
    }
  ]);
  
  return <div>...</div>;
}
```

### Features
- ✅ Platform-aware (`meta` for Mac, `ctrl` for Windows)
- ✅ Auto-ignores shortcuts when typing in inputs
- ✅ Supports modifier keys: `ctrl`, `meta`, `shift`, `alt`
- ✅ Prevents default browser behavior

### Shortcut Object

```tsx
{
  key: string;          // Key to press (lowercase)
  ctrl?: boolean;       // Require Ctrl key
  meta?: boolean;       // Require Cmd (Mac) / Win (Windows)
  shift?: boolean;      // Require Shift key
  alt?: boolean;        // Require Alt/Option key
  callback: () => void; // Function to run
  description?: string; // Optional description
}
```

---

## 📚 More Hooks

### Coming Soon
- `useDebounce` - Debounce values
- `useThrottle` - Throttle callbacks
- `useLocalStorage` - Sync state with localStorage
- `useOnClickOutside` - Detect clicks outside element

