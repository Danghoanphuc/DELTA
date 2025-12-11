// src/features/organization/pages/SwagOrdersPage.tsx
// ✅ SOLID Refactored - Compose components only

import { useState } from "react";
import { Send, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useSwagOrders } from "../hooks/useSwagOrders";
import { OrderStats, OrderTable, OrderDetailModal } from "../components/orders";
import { OrderThreadDialog } from "../components/OrderThreadDialog";

export function SwagOrdersPage() {
  const {
    orders,
    stats,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    selectedOrder,
    setSelectedOrder,
    isLoadingDetail,
    viewOrderDetail,
    cancelOrder,
    resendEmail,
  } = useSwagOrders();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatOrderId, setChatOrderId] = useState<string>("");
  const [chatOrderNumber, setChatOrderNumber] = useState<string>("");

  const handleViewDetail = async (orderId: string) => {
    setShowDetailModal(true);
    await viewOrderDetail(orderId);
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    await cancelOrder(orderId);
  };

  const handleCreateNew = () => {
    window.location.href = "?tab=send-swag";
  };

  const handleOpenChat = (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    if (order) {
      setChatOrderId(orderId);
      setChatOrderNumber(order.orderNumber);
      setShowChatDialog(true);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">
              Lịch sử đơn hàng
            </h1>
            <p className="text-[#57534E]">Quản lý các đợt gửi quà của bạn</p>
          </div>
          <Button
            className="bg-[#C63321] hover:bg-[#A82A1A] text-[#F7F6F2] shadow-[0_2px_8px_rgba(198,51,33,0.2)]"
            onClick={handleCreateNew}
          >
            <Send className="w-4 h-4 mr-2" />
            Gửi quà mới
          </Button>
        </div>

        {/* Stats */}
        <OrderStats stats={stats} />

        {/* Filters */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] mb-6 bg-[#F7F6F2]">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <Input
                  placeholder="Tìm theo mã đơn hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="pending_info">Chờ thông tin</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đang giao</SelectItem>
                  <SelectItem value="delivered">Đã giao</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
          <CardContent className="p-0">
            <OrderTable
              orders={orders}
              isLoading={isLoading}
              onViewDetail={handleViewDetail}
              onCancel={handleCancel}
              onCreateNew={handleCreateNew}
              onOpenChat={handleOpenChat}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        order={selectedOrder}
        isLoading={isLoadingDetail}
        onResendEmail={resendEmail}
      />

      {/* Chat Dialog */}
      <OrderThreadDialog
        orderId={chatOrderId}
        orderNumber={chatOrderNumber}
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
      />
    </div>
  );
}

export default SwagOrdersPage;
