// apps/customer-frontend/src/features/delivery-checkin/pages/ShipperCheckinHistoryPage.tsx
/**
 * Shipper Check-in History Page
 * Displays shipper's check-in history with filtering, pagination, and detail view
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CheckinHistory } from "../components/CheckinHistory";
import { SyncStatusIndicator } from "../components/SyncStatusIndicator";
import { useOfflineQueue } from "../hooks/useOfflineQueue";

export function ShipperCheckinHistoryPage() {
  const navigate = useNavigate();
  const { status, syncProgress, syncQueue } = useOfflineQueue();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleNewCheckin = () => {
    navigate("/shipper/checkin");
  };

  const handleViewThread = (threadId: string) => {
    // Navigate to thread view
    navigate(`/messages/thread/${threadId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lịch sử Check-in
            </h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý các check-in đã thực hiện
            </p>
          </div>
          <Button onClick={handleNewCheckin}>
            <Plus className="w-4 h-4 mr-2" />
            Check-in mới
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Lịch sử Check-in</h1>
        </div>

        {/* New check-in button */}
        <Button size="sm" onClick={handleNewCheckin}>
          <Plus className="w-4 h-4 mr-1" />
          Mới
        </Button>
      </header>

      {/* Sync status indicator for offline queue */}
      {(status.pendingCount > 0 ||
        status.failedCount > 0 ||
        !status.isOnline ||
        status.isSyncing) && (
        <div className="px-4 lg:px-8 pt-4 lg:pt-6">
          <div className="max-w-6xl mx-auto">
            <SyncStatusIndicator
              status={status}
              syncProgress={syncProgress}
              onSync={syncQueue}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <CheckinHistory onViewThread={handleViewThread} />
        </div>
      </div>
    </div>
  );
}
