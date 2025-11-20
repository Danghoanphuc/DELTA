// src/features/chat/components/ChatContainer.tsx
// Container component áp dụng tất cả các nguyên tắc: Smart/Dumb, Custom Hooks, Mobile-First, S.O.L.I.D, Fail-Safe

import React, { Suspense } from "react";
import { ChatProvider } from "../context/ChatProvider";
import { ChatErrorBoundary } from "./ChatErrorBoundary";
import { ChatInterface } from "./ChatInterface";
import { useResponsiveChat } from "../hooks/useResponsiveChat";
import { useChatPerformance } from "../hooks/useChatPerformance";
import { useChatContext } from "../context/ChatProvider";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

// Smart component wrapper
function ChatContainerInner() {
  const { messages, isChatExpanded, setIsChatExpanded } = useChatContext();
  const { isMobile, sidebarCollapsed, toggleSidebar } = useResponsiveChat();
  const { memoryStats } = useChatPerformance({ messages });

  return (
    <div className={cn(
      "flex h-full bg-white dark:bg-gray-900",
      isMobile && "flex-col"
    )}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Chat AI</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ☰
          </button>
        </div>
      )}

      {/* Chat Interface */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        isMobile && sidebarCollapsed && "hidden"
      )}>
        <ChatInterface
          isExpanded={isChatExpanded}
          onToggleExpanded={() => setIsChatExpanded(!isChatExpanded)}
          className="h-full"
        />
      </div>

      {/* Development Memory Stats */}
      {process.env.NODE_ENV === 'development' && memoryStats && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          Messages: {memoryStats.messageCount} | Mem: {memoryStats.estimatedMemoryUsage.toFixed(1)}KB
        </div>
      )}
    </div>
  );
}

// Loading fallback
function ChatSkeleton() {
  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className="h-16 w-64" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main exported component with all patterns applied
export function ChatContainer() {
  return (
    <ChatErrorBoundary>
      <Suspense fallback={<ChatSkeleton />}>
        <ChatProvider>
          <ChatContainerInner />
        </ChatProvider>
      </Suspense>
    </ChatErrorBoundary>
  );
}
