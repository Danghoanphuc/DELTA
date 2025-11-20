// src/features/chat/hooks/useChatPerformance.ts
// Hook để optimize performance và memory management

import { useCallback, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";

interface UseChatPerformanceProps {
  messages: ChatMessage[];
  maxMessagesInMemory?: number;
  cleanupInterval?: number;
}

export function useChatPerformance(props: UseChatPerformanceProps) {
  const { messages, maxMessagesInMemory = 100, cleanupInterval = 30000 } = props;

  const cleanupRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCleanupRef = useRef<number>(Date.now());

  // Cleanup old messages to prevent memory leaks
  const cleanupOldMessages = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCleanup = now - lastCleanupRef.current;

    if (timeSinceLastCleanup < cleanupInterval) return;

    // Keep only recent messages in memory
    if (messages.length > maxMessagesInMemory) {
      console.log(`[ChatPerformance] Cleaning up old messages. Current: ${messages.length}`);

      // Note: This would need to be implemented in the parent component
      // as we can't modify the messages array directly here
      // Parent should use this callback to cleanup
    }

    lastCleanupRef.current = now;
  }, [messages.length, maxMessagesInMemory, cleanupInterval]);

  // Debounced cleanup
  useEffect(() => {
    if (cleanupRef.current) {
      clearTimeout(cleanupRef.current);
    }

    cleanupRef.current = setTimeout(cleanupOldMessages, 1000);

    return () => {
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
    };
  }, [cleanupOldMessages]);

  // Memory usage monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logMemoryUsage = () => {
        if ('memory' in performance) {
          const memInfo = (performance as any).memory;
          console.log(`[ChatPerformance] Memory: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB used`);
        }
      };

      const interval = setInterval(logMemoryUsage, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, []);

  // Virtual scrolling optimization
  const getVirtualizationConfig = useCallback(() => ({
    estimateSize: () => 80, // Average message height
    overscan: 5, // Render 5 extra items outside viewport
    scrollMargin: 100, // Start virtualization 100px from edges
  }), []);

  // Lazy loading for images
  const getImageLoadingConfig = useCallback(() => ({
    rootMargin: '50px', // Start loading 50px before entering viewport
    threshold: 0.1,
  }), []);

  return {
    cleanupOldMessages,
    getVirtualizationConfig,
    getImageLoadingConfig,
    memoryStats: process.env.NODE_ENV === 'development' ? {
      messageCount: messages.length,
      estimatedMemoryUsage: messages.length * 0.5, // Rough estimate: 0.5KB per message
    } : null,
  };
}
