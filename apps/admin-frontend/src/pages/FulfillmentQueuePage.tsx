// src/pages/FulfillmentQueuePage.tsx
// ✅ SOLID Refactored: UI composition only

import { DragEvent } from "react";
import { Package, Truck, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useFulfillmentQueue } from "@/hooks/useFulfillmentQueue";
import { KanbanColumn } from "@/components/fulfillment/KanbanColumn";
import { OrderCard } from "@/components/fulfillment/OrderCard";

export default function FulfillmentQueuePage() {
  const {
    queue,
    isLoading,
    isUpdating,
    draggedOrder,
    dragOverColumn,
    totalInQueue,
    fetchQueue,
    startProcessing,
    completeKitting,
    viewOrderDetail,
    setDraggedOrder,
    setDragOverColumn,
    handleDrop,
  } = useFulfillmentQueue();

  // Drag handlers
  const handleDragStart = (e: DragEvent, order: any) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDropColumn = (e: DragEvent, column: string) => {
    e.preventDefault();
    handleDrop(column);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Fulfillment Queue
          </h1>
          <p className="text-gray-600">
            {totalInQueue} đơn hàng đang chờ xử lý
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Ready to Process */}
        <KanbanColumn
          title="Chờ xử lý"
          count={queue.readyToProcess.length}
          icon={Clock}
          iconColor="bg-blue-100 text-blue-600"
          bgColor="bg-blue-50 ring-blue-300"
          isDragOver={dragOverColumn === "ready"}
          onDragOver={(e) => handleDragOver(e, "ready")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropColumn(e, "processing")}
          emptyIcon={CheckCircle}
          emptyMessage="Không có đơn nào"
        >
          {queue.readyToProcess.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              isDragging={draggedOrder?._id === order._id}
              isUpdating={isUpdating === order._id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => viewOrderDetail(order._id)}
              onAction={() => startProcessing(order._id)}
              actionLabel="Bắt đầu xử lý"
              actionColor="bg-blue-500 hover:bg-blue-600"
            />
          ))}
        </KanbanColumn>

        {/* Column 2: Processing */}
        <KanbanColumn
          title="Đang xử lý"
          count={queue.processing.length}
          icon={Package}
          iconColor="bg-indigo-100 text-indigo-600"
          bgColor="bg-indigo-50 ring-indigo-300"
          isDragOver={dragOverColumn === "processing"}
          onDragOver={(e) => handleDragOver(e, "processing")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropColumn(e, "kitting")}
          emptyIcon={Package}
          emptyMessage="Không có đơn nào"
        >
          {queue.processing.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              isDragging={draggedOrder?._id === order._id}
              isUpdating={isUpdating === order._id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => viewOrderDetail(order._id)}
              onAction={() => completeKitting(order._id)}
              actionLabel="Hoàn tất đóng gói"
              actionColor="bg-purple-500 hover:bg-purple-600"
            />
          ))}
        </KanbanColumn>

        {/* Column 3: Kitting (Ready to Ship) */}
        <KanbanColumn
          title="Sẵn sàng gửi"
          count={queue.kitting.length}
          icon={Truck}
          iconColor="bg-green-100 text-green-600"
          bgColor="bg-green-50 ring-green-300"
          isDragOver={dragOverColumn === "kitting"}
          onDragOver={(e) => handleDragOver(e, "kitting")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropColumn(e, "shipped")}
          emptyIcon={Truck}
          emptyMessage="Không có đơn nào"
        >
          {queue.kitting.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              isDragging={draggedOrder?._id === order._id}
              isUpdating={isUpdating === order._id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => viewOrderDetail(order._id)}
              onAction={() => viewOrderDetail(order._id)}
              actionLabel="Gửi hàng"
              actionColor="bg-green-500 hover:bg-green-600"
            />
          ))}
        </KanbanColumn>
      </div>

      {/* Empty State */}
      {totalInQueue === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm mt-6">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tất cả đơn hàng đã được xử lý!
          </h3>
          <p className="text-gray-500">Không có đơn hàng nào trong hàng đợi</p>
        </div>
      )}
    </div>
  );
}
