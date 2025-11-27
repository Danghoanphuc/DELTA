// apps/customer-frontend/src/features/notifications/components/NotificationInbox.tsx
// ✅ Novu Inbox Component

import { Inbox } from '@novu/react';
import { useAuthStore } from '@/stores/useAuthStore';

function NotificationInbox() {
  const appIdentifier = import.meta.env.VITE_NOVU_APP_ID;
  const { user } = useAuthStore();
  
  // Dùng user ID thật hoặc fallback
  const subscriberId = user?._id || "guest_subscriber";

  if (!appIdentifier) {
    console.error('[NotificationInbox] NOVU_APP_ID missing');
    return null;
  }

  return (
    <Inbox
      applicationIdentifier={appIdentifier}
      subscriberId={subscriberId}
      appearance={{
        baseTheme: {
          variables: {
            colorBackground: 'white',
            colorForeground: 'black',
            colorPrimary: '#2563eb', // Blue-600
          }
        },
        elements: {
          bellIcon: {
            width: '20px',
            height: '20px',
          }
        }
      }}
    />
  );
}

export default NotificationInbox;

