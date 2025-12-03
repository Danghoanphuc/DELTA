// apps/customer-frontend/src/features/chat/components/offline/OfflineQueueIndicator.tsx
/**
 * 🔥 OFFLINE QUEUE INDICATOR
 * Hiển thị số tin nhắn đang chờ gửi
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { offlineQueue } from "../../lib";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

interface OfflineQueueIndicatorProps {
  onFlush?: () => void;
}

export function OfflineQueueIndicator({ onFlush }: OfflineQueueIndicatorProps) {
  const [queueSize, setQueueSize] = useState(0);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    // Initial size
    setQueueSize(offlineQueue.size());

    // Subscribe to changes
    const unsubscribe = offlineQueue.subscribe(() => {
      setQueueSize(offlineQueue.size());
    });

    return unsubscribe;
  }, []);

  if (queueSize === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 flex items-center gap-3 min-w-[200px]">
          <div className="flex-shrink-0">
            {isOnline ? (
              <Send className="w-5 h-5 text-blue-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {queueSize} tin nhắn chờ gửi
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isOnline ? "Nhấn để gửi ngay" : "Chờ kết nối..."}
            </p>
          </div>

          {isOnline && onFlush && (
            <Button
              size="sm"
              onClick={onFlush}
              className="flex-shrink-0 h-8 px-3 text-xs"
            >
              Gửi
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
