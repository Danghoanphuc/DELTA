// src/pages/FulfillmentQueuePage.tsx
// ✅ Admin Fulfillment Queue - Kanban-style view with Drag & Drop

import { useState, useEffect, useCallback, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Users,
  Building2,
  GripVertical,
} from "lucide-react";
import {
  swagOpsService,
  SwagOrder,
} from "@/services/admin.swag-operations.service";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface FulfillmentQueue {
  readyToProcess: SwagOrder[];
  processing: SwagOrder[];
  kitting: SwagOrder[];
}

export default function FulfillmentQueuePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<FulfillmentQueue>({
    readyToProcess: [],
    processing: [],
    kitting: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [draggedOrder, setDraggedOrder] = useState<SwagOrder | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await swagOpsService.getFulfillmentQueue();
      setQueue(data);
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Start processing
  const handleStartProcessing = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await swagOpsService.startProcessing(orderId);
      fetchQueue();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Complete kitting
  const handleCompleteKitting = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await swagOpsService.completeKitting(orderId);
      fetchQueue();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: DragEvent, order: SwagOrder) => {
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

  const handleDrop = async (e: DragEvent, targetColumn: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedOrder) return;

    const currentStatus = draggedOrder.status;

    // Determine valid transitions
    if (targetColumn === "processing" && currentStatus === "paid") {
      await handleStartProcessing(draggedOrder._id);
    } else if (targetColumn === "kitting" && currentStatus === "processing") {
      await handleCompleteKitting(draggedOrder._id);
    } else if (targetColumn === "shipped" && currentStatus === "kitting") {
      // Navigate to order detail for shipping
      navigate(`/swag-ops/orders/${draggedOrder._id}`);
    }

    setDraggedOrder(null);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  const OrderCard = ({
    order,
    onAction,
    actionLabel,
    actionColor,
    draggable = true,
  }: {
    order: SwagOrder;
    onAction?: () => void;
    actionLabel?: string;
    actionColor?: string;
    draggable?: boolean;
  }) => (
    <div
      draggable={draggable}
      onDragStart={(e) => handleDragStart(e, order)}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        draggedOrder?._id === order._id ? "opacity-50" : ""
      }`}
      onClick={() => navigate(`/swag-ops/orders/${order._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
          <div>
            <p className="font-mono text-sm font-medium text-orange-600">
              {order.orderNumber}
            </p>
            <p className="text-sm text-gray-600 truncate max-w-44">
              {order.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          {order.totalRecipients}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
        <Building2 className="w-4 h-4" />
        <span className="truncate">{order.organization?.businessName}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formatDate(order.createdAt)}</span>
        <span className="font-medium">
          {formatCurrency(order.pricing?.total || 0)}
        </span>
      </div>

      {onAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          disabled={isUpdating === order._id}
          className={`w-full mt-3 py-2 rounded-lg text-sm font-medium text-white ${actionColor} disabled:opacity-50`}
        >
          {isUpdating === order._id ? (
            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              {actionLabel}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const totalInQueue =
    queue.readyToProcess.length +
    queue.processing.length +
    queue.kitting.length;

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
        <div
          className={`bg-gray-50 rounded-xl p-4 transition-colors ${
            dragOverColumn === "ready" ? "bg-blue-50 ring-2 ring-blue-300" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, "ready")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "ready")}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Chờ xử lý</h2>
              <p className="text-sm text-gray-500">
                {queue.readyToProcess.length} đơn
              </p>
            </div>
          </div>

          <div className="space-y-3 min-h-32">
            {queue.readyToProcess.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p>Không có đơn nào</p>
              </div>
            ) : (
              queue.readyToProcess.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onAction={() => handleStartProcessing(order._id)}
                  actionLabel="Bắt đầu xử lý"
                  actionColor="bg-blue-500 hover:bg-blue-600"
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Processing */}
        <div
          className={`bg-gray-50 rounded-xl p-4 transition-colors ${
            dragOverColumn === "processing"
              ? "bg-indigo-50 ring-2 ring-indigo-300"
              : ""
          }`}
          onDragOver={(e) => handleDragOver(e, "processing")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "processing")}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Đang xử lý</h2>
              <p className="text-sm text-gray-500">
                {queue.processing.length} đơn
              </p>
            </div>
          </div>

          <div className="space-y-3 min-h-32">
            {queue.processing.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2" />
                <p>Không có đơn nào</p>
              </div>
            ) : (
              queue.processing.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onAction={() => handleCompleteKitting(order._id)}
                  actionLabel="Hoàn tất đóng gói"
                  actionColor="bg-purple-500 hover:bg-purple-600"
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Kitting (Ready to Ship) */}
        <div
          className={`bg-gray-50 rounded-xl p-4 transition-colors ${
            dragOverColumn === "kitting"
              ? "bg-green-50 ring-2 ring-green-300"
              : ""
          }`}
          onDragOver={(e) => handleDragOver(e, "kitting")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "kitting")}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Sẵn sàng gửi</h2>
              <p className="text-sm text-gray-500">
                {queue.kitting.length} đơn
              </p>
            </div>
          </div>

          <div className="space-y-3 min-h-32">
            {queue.kitting.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-2" />
                <p>Không có đơn nào</p>
              </div>
            ) : (
              queue.kitting.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onAction={() => navigate(`/swag-ops/orders/${order._id}`)}
                  actionLabel="Gửi hàng"
                  actionColor="bg-green-500 hover:bg-green-600"
                />
              ))
            )}
          </div>
        </div>
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
