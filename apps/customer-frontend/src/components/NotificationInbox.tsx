import { useEffect, useRef } from 'react';
import { Inbox } from '@novu/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTheme } from '@/shared/hooks/useTheme';

const NOTIFICATION_SOUND = '/sounds/message-pop.mp3';

export function NotificationInbox() {
  const applicationIdentifier = import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER;
  const user = useAuthStore((state) => state.user);
  const { isDark } = useTheme();
  const notificationCountRef = useRef<number>(0);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0.6;
      audio.play().catch((err) => {
        console.warn('[NotificationInbox] Failed to play sound:', err);
      });
    } catch (error) {
      console.warn('[NotificationInbox] Audio error:', error);
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0;
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  useEffect(() => {
    const checkBadgeCount = () => {
      const badgeElement = document.querySelector('[data-test-id="notification-bell"] [class*="badge"], [data-test-id="notification-bell"] span[class*="count"]');
      if (badgeElement) {
        const text = badgeElement.textContent || '';
        const count = parseInt(text.replace(/\D/g, '')) || 0;
        if (count > notificationCountRef.current && notificationCountRef.current > 0) {
          playNotificationSound();
        }
        notificationCountRef.current = count;
      }
    };

    const interval = setInterval(checkBadgeCount, 500);
    return () => clearInterval(interval);
  }, []);

  if (!applicationIdentifier) {
    console.error('VITE_NOVU_APPLICATION_IDENTIFIER is not defined');
    return null;
  }

  const subscriberId = user?._id?.toString();

  if (!subscriberId) {
    return null;
  }

  const backendUrl = import.meta.env.VITE_NOVU_BACKEND_URL;
  const socketUrl = import.meta.env.VITE_NOVU_SOCKET_URL;

  const inboxProps = {
    applicationIdentifier,
    subscriberId,
    backendUrl,
    socketUrl,
    onNotificationReceived: () => {
      playNotificationSound();
    },
    appearance: {
      baseTheme: (isDark ? 'dark' : undefined) as any,
      variables: {
        colorPrimary: 'hsl(221.2, 83.2%, 53.3%)',
        colorPrimaryForeground: 'hsl(210, 40%, 98%)',
        colorSecondary: 'hsl(210, 40%, 96.1%)',
        colorSecondaryForeground: 'hsl(222.2, 47.4%, 11.2%)',
        colorCounter: 'hsl(0, 84.2%, 60.2%)',
        colorCounterForeground: 'hsl(210, 40%, 98%)',
        colorBackground: isDark ? 'hsl(222.2, 84%, 4.9%)' : 'hsl(0, 0%, 100%)',
        colorRing: 'hsl(221.2, 83.2%, 53.3%)',
        colorForeground: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222.2, 47.4%, 11.2%)',
        colorNeutral: isDark ? 'hsl(217.2, 32.6%, 17.5%)' : 'hsl(214.3, 31.8%, 91.4%)',
        colorShadow: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        fontSize: '17px',
      },
      elements: {
        bellIcon: {
          color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222.2, 47.4%, 11.2%)',
        },
      },
    },
    placement: "bottom-end" as const,
    placementOffset: 8,
  };

  return <Inbox {...(inboxProps as any)} />;
}

