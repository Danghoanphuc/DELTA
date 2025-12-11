// apps/customer-frontend/src/features/delivery-checkin/pages/TodayRoutePage.tsx
/**
 * Today's Route Page - Shipper's daily delivery list
 * Shows all orders assigned for today with route optimization
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Navigation,
  Filter,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useAssignedOrders } from "../hooks/useAssignedOrders";
import type { AssignedOrder } from "../types";
import { ShipperOrderThreadDialog } from "../components/ShipperOrderThreadDialog";

export function TodayRoutePage() {
  const navigate = useNavigate();
  const { orders, isLoading, refetch } = useAssignedOrders();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [chatOrder, setChatOrder] = useState<AssignedOrder | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") return !order.isCheckedIn;
    if (filter === "completed") return order.isCheckedIn;
    return true;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.isCheckedIn).length,
    pending: orders.filter((o) => !o.isCheckedIn).length,
  };

  const handleOrderClick = (order: AssignedOrder) => {
    if (order.isCheckedIn) {
      // View check-in detail
      navigate(`/shipper/checkins/${order.checkinId}`);
    } else {
      // Go to check-in page with pre-selected order
      navigate("/shipper/checkin", { state: { selectedOrder: order } });
    }
  };

  const handleOpenMap = () => {
    // TODO: Open map view with route
    console.log("Open map view");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/shipper")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Lộ trình hôm nay</h1>
            <p className="text-sm text-gray-500">
              {stats.completed}/{stats.total} đơn đã giao
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-3 bg-gray-50 border-t grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">Tổng đơn</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-xs text-gray-500">Đã giao</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-xs text-gray-500">Chờ giao</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 flex gap-2 border-t overflow-x-auto">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tất cả ({stats.total})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Chờ giao ({stats.pending})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Đã giao ({stats.completed})
          </Button>
        </div>
      </header>

      {/* Map View Button */}
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={handleOpenMap}>
          <Navigation className="w-4 h-4 mr-2" />
          Xem bản đồ lộ trình
        </Button>
      </div>

      {/* Orders List */}
      <div className="px-4 pb-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {filter === "all"
                ? "Không có đơn hàng nào"
                : filter === "pending"
                ? "Không có đơn chờ giao"
                : "Chưa có đơn nào được giao"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <OrderCard
              key={order._id}
              order={order}
              index={index}
              onClick={() => handleOrderClick(order)}
              onChatClick={(e) => {
                e.stopPropagation();
                setChatOrder(order);
              }}
            />
          ))
        )}
      </div>

      {/* Chat Dialog */}
      {chatOrder && (
        <ShipperOrderThreadDialog
          orderId={chatOrder._id}
          orderNumber={chatOrder.orderNumber}
          open={!!chatOrder}
          onOpenChange={(open) => !open && setChatOrder(null)}
        />
      )}
    </div>
  );
}

// Order Card Component
interface OrderCardProps {
  order: AssignedOrder;
  index: number;
  onClick: () => void;
  onChatClick: (e: React.MouseEvent) => void;
}

function OrderCard({ order, index, onClick, onChatClick }: OrderCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-start gap-3">
        {/* Route Number */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            order.isCheckedIn
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          <span className="text-sm font-bold">{index + 1}</span>
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              #{order.orderNumber}
            </span>
            {order.isCheckedIn ? (
              <Badge variant="success" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Đã giao
              </Badge>
            ) : (
              <Badge variant="warning" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Chờ giao
              </Badge>
            )}
          </div>

          {/* Recipient */}
          <p className="text-sm text-gray-600 mb-2">
            {order.recipientName} • {order.recipientPhone}
          </p>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{order.address}</span>
          </div>

          {/* Distance (if available) */}
          {order.distance && (
            <div className="mt-2 text-xs text-gray-400">
              <Navigation className="w-3 h-3 inline mr-1" />
              {order.distance < 1000
                ? `${Math.round(order.distance)}m`
                : `${(order.distance / 1000).toFixed(1)}km`}
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Chat Icon */}
          <button
            onClick={onChatClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Chat về đơn hàng"
          >
            <MessageCircle className="w-5 h-5 text-orange-600" />
          </button>

          {/* Status Icon */}
          {order.isCheckedIn ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Package className="w-6 h-6 text-orange-600" />
          )}
        </div>
      </div>
    </button>
  );
}
