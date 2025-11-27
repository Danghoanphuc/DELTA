// src/features/customer/pages/CustomerOrdersPage.tsx
import { useState, useEffect } from "react";
import { Package, Search, Eye, ImageOff } from "lucide-react"; // Thêm ImageOff
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Order, OrderStatus } from "@/types/order";
import api from "@/shared/lib/axios";
import { toast } from "@/shared/utils/toast";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/my-orders");
      setOrders(res.data?.orders || res.data?.data?.orders || []);
    } catch (err: any) {
      console.error("❌ Error fetching orders:", err);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (cancellingId) return;
    setCancellingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success("Đã hủy đơn hàng thành công");
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (err: any) {
      toast.error("Hủy thất bại.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN");

  // ✅ Helper lấy ảnh đại diện cho đơn hàng
  const getOrderThumbnail = (order: Order) => {
    if (!order.items || order.items.length === 0) return null;
    const firstItem: any = order.items[0];
    
    // Logic tìm ảnh (tương tự OrderItemsCard)
    return (
      firstItem.imageUrl ||
      firstItem.productSnapshot?.images?.[0]?.url ||
      firstItem.thumbnailUrl ||
      firstItem.product?.images?.[0]?.url ||
      firstItem.image ||
      null
    );
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700 border-blue-200" },
      confirmed: { label: "Đã xác nhận", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
      printing: { label: "Đang in", className: "bg-purple-100 text-purple-700 border-purple-200" },
      shipping: { label: "Đang giao", className: "bg-orange-100 text-orange-700 border-orange-200" },
      completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700 border-green-200" },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 border-red-200" },
      refunded: { label: "Đã hoàn tiền", className: "bg-gray-100 text-gray-700 border-gray-200" },
    };
    const s = config[status] || { label: status, className: "bg-gray-100 text-gray-600" };
    return <Badge variant="outline" className={cn("font-medium border", s.className)}>{s.label}</Badge>;
  };

  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesTerm = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        order.items?.some(i => i.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesTerm;
  });

  return (
    <div className="pt-6 px-4 md:px-8 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi tiến độ đơn hàng</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Tìm mã đơn, sản phẩm..." 
            className="pl-10 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)} className="w-full">
        <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur pb-2 pt-2 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
          <TabsList className="h-11 bg-white p-1 border shadow-sm w-max min-w-full md:min-w-0 justify-start rounded-xl">
            {["all", "pending", "printing", "shipping", "completed", "cancelled"].map((st) => (
              <TabsTrigger 
                key={st} 
                value={st} 
                className="rounded-lg px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-semibold transition-all"
              >
                {st === "all" ? "Tất cả" : 
                 st === "pending" ? "Chờ xác nhận" :
                 st === "printing" ? "Đang in" :
                 st === "shipping" ? "Đang giao" :
                 st === "completed" ? "Hoàn thành" : "Đã hủy"}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="mt-4 space-y-4">
          {loading ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
               <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"/>
               Đang tải dữ liệu...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
               <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
               <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào ở trạng thái này.</p>
               <Button asChild><Link to="/shop">Dạo cửa hàng ngay</Link></Button>
            </div>
          ) : (
            filteredOrders.map((order) => {
               const thumbnail = getOrderThumbnail(order);
               return (
                <Card key={order._id} className="group overflow-hidden hover:shadow-md transition-all duration-300 border-gray-200">
                  <CardContent className="p-0">
                    {/* Header: Mã đơn & Trạng thái */}
                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                       <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-gray-600">#{order.orderNumber}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs text-gray-500">{formatDate(order.createdAt as any)}</span>
                       </div>
                       {/* @ts-ignore */}
                       {getStatusBadge(order.status)}
                    </div>

                    {/* Body: Ảnh & Tên SP */}
                    <div className="p-4 flex flex-col md:flex-row gap-4 md:items-center">
                       {/* Thumbnail Image */}
                       <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                          {thumbnail ? (
                             <img src={thumbnail} alt="Order thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageOff size={24} />
                             </div>
                          )}
                       </div>

                       {/* Info */}
                       <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-base">
                             {order.items?.[0]?.productName || "Sản phẩm in ấn"}
                             {(order.items?.length || 0) > 1 && <span className="text-gray-500 font-normal ml-1"> (+{(order.items?.length || 0) - 1} sản phẩm khác)</span>}
                          </h4>
                          <p className="text-sm text-gray-500 mb-1">
                             Đơn vị in: {order.printerId?.businessName || "Printz Partner"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 md:hidden">
                             <span className="text-sm font-medium text-gray-900">Tổng: {formatPrice(order.total || order.subtotal || 0)}</span>
                          </div>
                       </div>

                       {/* Desktop Price & Actions */}
                       <div className="flex md:flex-col items-center md:items-end justify-between gap-4 mt-2 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                          <div className="hidden md:block text-right mb-2">
                             <p className="text-xs text-gray-500 mb-0.5">Tổng tiền</p>
                             <p className="text-lg font-bold text-blue-600">{formatPrice(order.total || order.subtotal || 0)}</p>
                          </div>

                          <div className="flex gap-2 w-full md:w-auto">
                             {order.status === "pending" && (
                                <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-red-600 hover:bg-red-50 flex-1 md:flex-none"
                                   onClick={() => handleCancelOrder(order._id)}
                                   disabled={cancellingId === order._id}
                                >
                                   {cancellingId === order._id ? "Đang hủy..." : "Hủy đơn"}
                                </Button>
                             )}
                             <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none border-gray-300 hover:border-blue-500 hover:text-blue-600">
                                <Link to={`/orders/${order._id}`}>Xem chi tiết</Link>
                             </Button>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
               );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};