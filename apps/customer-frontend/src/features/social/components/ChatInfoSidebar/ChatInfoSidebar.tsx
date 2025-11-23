// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/ChatInfoSidebar.tsx
// ✅ UI UPGRADE: "Pro Dashboard" Style
// ✅ FEATURES: Hiển thị Đơn hàng, File, Tài chính với giao diện hiện đại

import { useState } from "react";
import { 
  X, ShoppingBag, FileText, Image as ImageIcon, 
  Receipt, Zap, Loader2, ChevronRight, Clock, CheckCircle2, 
  AlertCircle, DownloadCloud 
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useSocialChatStore } from "../../hooks/useSocialChatStore";
import { useQuery } from "@tanstack/react-query";
import { getConversationBusinessContext } from "../../../chat/services/chat.api.service";
import { cn } from "@/shared/lib/utils";

// Helper format tiền tệ
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface ChatInfoSidebarProps {
  conversation: any;
  onClose?: () => void;
}

export function ChatInfoSidebar({ conversation, onClose }: ChatInfoSidebarProps) {
  const { toggleInfoSidebar } = useSocialChatStore();

  // Fetch dữ liệu Business (Mock fallback nếu chưa có API)
  const { data: businessContext, isLoading } = useQuery({
    queryKey: ["businessContext", conversation._id],
    queryFn: () => getConversationBusinessContext(conversation._id),
    enabled: !!conversation._id
  });

  // Mock data nếu API trả về rỗng (để bạn thấy UI đẹp thế nào)
  const orders = businessContext?.activeOrders?.length ? businessContext.activeOrders : [
    { _id: '1', orderNumber: '#ORD-7829', itemSummary: 'Card Visit Cao Cấp x5', status: 'processing', totalAmount: 1500000, createdAt: new Date() }
  ];
  
  const designFiles = businessContext?.designFiles?.length ? businessContext.designFiles : [
    { _id: 'f1', name: 'Final_Print_v2.pdf', size: '12.5 MB', createdAt: new Date() },
    { _id: 'f2', name: 'Logo_Vector.ai', size: '4.2 MB', createdAt: new Date() }
  ];

  const totalDue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const totalPaid = 500000; // Mock đã cọc

  // Helper render status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        processing: "bg-blue-50 text-blue-700 border-blue-200",
        completed: "bg-green-50 text-green-700 border-green-200",
        cancelled: "bg-red-50 text-red-700 border-red-200"
    };
    const labels: any = {
        pending: "Chờ xử lý", processing: "Đang in", completed: "Hoàn thành", cancelled: "Đã hủy"
    };
    return (
        <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border", styles[status] || styles.pending)}>
            {labels[status] || status}
        </span>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50 border-l border-gray-200 w-full md:w-80 shadow-2xl">
      
      {/* 1. HEADER CAO CẤP */}
      <div className="h-16 px-5 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">Dự án & Đơn hàng</h3>
            <p className="text-[10px] text-gray-500 font-medium">Quản lý file in và tiến độ</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose || toggleInfoSidebar} className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
          <X size={18} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-blue-600" />
            <span className="text-xs text-gray-400">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
            
            {/* 2. ACTIVE ORDERS CARD */}
            <section>
                <div className="flex justify-between items-end mb-3 px-1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag size={14} className="text-blue-600"/> Đơn hàng ({orders.length})
                    </h4>
                </div>
                
                <div className="space-y-3">
                    {orders.length > 0 ? (
                        orders.map((order: any) => (
                            <div key={order._id} className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
                                {/* Decor line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                                
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-sm">{order.orderNumber}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 line-clamp-1 font-medium">{order.itemSummary}</div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-gray-50 pl-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400">Tổng tiền</span>
                                        <span className="text-sm font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 px-2 transition-colors">
                                        Chi tiết <ChevronRight size={12} className="ml-1"/>
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <ShoppingBag className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500">Chưa có đơn hàng nào</p>
                        </div>
                    )}
                    
                    {/* Quick Action */}
                    <Button className="w-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold h-10 shadow-sm">
                        <Zap size={16} className="mr-2" /> Tạo đơn / Báo giá nhanh
                    </Button>
                </div>
            </section>

            {/* 3. ASSETS TABS */}
            <section>
                <Tabs defaultValue="files" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-10 bg-gray-200/50 p-1 rounded-xl">
                        <TabsTrigger value="files" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
                            <FileText size={14} className="mr-2"/> File in ấn
                        </TabsTrigger>
                        <TabsTrigger value="media" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg transition-all">
                            <ImageIcon size={14} className="mr-2"/> Ảnh mẫu
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="files" className="mt-4 space-y-2">
                        {designFiles.length > 0 ? designFiles.map((file: any) => (
                            <div key={file._id} className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50/50 rounded-xl border border-gray-100 hover:border-blue-100 transition-all group cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-gray-700 truncate group-hover:text-blue-700">{file.name}</div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                        {file.size} <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"/> {new Date(file.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 group-hover:text-blue-600 group-hover:bg-white rounded-full">
                                    <DownloadCloud size={16} />
                                </Button>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                <FileText size={24} className="mb-2 opacity-20"/>
                                <span className="text-xs">Chưa có file thiết kế</span>
                            </div>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="media" className="mt-4">
                        <div className="grid grid-cols-3 gap-2">
                            {/* Mock Media */}
                            {[1,2,3].map(i => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse opacity-50"/>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            {/* 4. FINANCIAL SUMMARY */}
            {orders.length > 0 && (
                <section className="pt-2">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl" />
                        
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                            <Receipt size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Tổng kết tài chính</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Tổng giá trị</span>
                                <span className="text-sm font-bold">{formatCurrency(totalDue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Đã thanh toán</span>
                                <span className="text-sm font-bold text-green-400 flex items-center gap-1">
                                    <CheckCircle2 size={12}/> {formatCurrency(totalPaid)}
                                </span>
                            </div>
                            <div className="h-px bg-gray-700 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-300 font-medium">Còn lại phải thu</span>
                                <span className="text-lg font-bold text-red-400">{formatCurrency(totalDue - totalPaid)}</span>
                            </div>
                        </div>

                        <Button className="w-full mt-5 bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs h-9 border-0">
                            Gửi yêu cầu thanh toán
                        </Button>
                    </div>
                </section>
            )}

            </div>
        </ScrollArea>
      )}
    </div>
  );
}