// src/features/printer/pages/PrinterOrderDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { 
  ArrowLeft, Download, ExternalLink, CheckCircle, XCircle, Upload, 
  FileText, MapPin, User, CreditCard, Package, Truck, Clock, Archive
} from "lucide-react";
import { useOrderDetail } from "@/features/shop/hooks/useOrderDetail";
import { OrderStatus } from "@/types/order";
import { getStatusActions, getStatusBadge } from "@/features/printer/utils/orderHelpers";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { ArtworkStatusBadge } from "@/features/printer/components/ArtworkStatusBadge";
import { ProofHistory } from "@/features/printer/components/ProofHistory";
import { UploadProofModal } from "@/features/printer/components/UploadProofModal";
import { cn } from "@/shared/lib/utils";

// Helper Timeline Steps
const ORDER_STEPS = [
  { id: 'pending', label: 'Chờ xác nhận', icon: Clock },
  { id: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle },
  { id: 'printing', label: 'Sản xuất', icon: Package },
  { id: 'shipping', label: 'Giao hàng', icon: Truck },
  { id: 'completed', label: 'Hoàn thành', icon: Archive },
];

export function PrinterOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, loading, formatPrice, formatDate, getStatusConfig } = useOrderDetail();
  
  const [printerNotes, setPrinterNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  useEffect(() => {
    if (order) setPrinterNotes((order as any)?.printerNotes || "");
  }, [order]);

  if (loading || !order) return <div className="min-h-screen flex items-center justify-center"><p>Đang tải...</p></div>;

  const statusConfig = getStatusConfig(order.status);
  const actions = getStatusActions(order.status);
  const artworkStatus = (order as any)?.artworkStatus || "pending_upload";

  // Current step index for timeline
  const currentStepIndex = ORDER_STEPS.findIndex(s => s.id === (order.status === 'designing' ? 'confirmed' : order.status === 'ready' ? 'printing' : order.status));

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/printer/dashboard?tab=orders")} className="bg-white rounded-full h-10 w-10">
                 <ArrowLeft size={20} />
              </Button>
              <div>
                 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Đơn hàng #{order.orderNumber}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                       {statusConfig.label}
                    </span>
                 </h1>
                 <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
           </div>
           <div className="flex gap-2">
              {actions.map((action) => (
                 <Button 
                    key={action.status} 
                    variant={action.variant || "default"} 
                    onClick={() => { /* handle update status */ }}
                    className="shadow-sm"
                 >
                    {action.label}
                 </Button>
              ))}
           </div>
        </div>

        {/* TIMELINE PROGRESS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
           <div className="flex items-center justify-between min-w-[600px]">
              {ORDER_STEPS.map((step, index) => {
                 const isCompleted = index <= currentStepIndex;
                 const isCurrent = index === currentStepIndex;
                 return (
                    <div key={step.id} className="flex flex-col items-center relative flex-1">
                       {/* Connector Line */}
                       {index !== 0 && (
                          <div className={cn(
                             "absolute top-4 right-[50%] w-full h-1",
                             index <= currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                          )} style={{ zIndex: 0 }} />
                       )}
                       
                       <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all",
                          isCompleted ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400",
                          isCurrent && "ring-4 ring-blue-100"
                       )}>
                          <step.icon size={16} />
                       </div>
                       <span className={cn("text-xs font-medium mt-2", isCompleted ? "text-blue-700" : "text-gray-500")}>
                          {step.label}
                       </span>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* LEFT: Customer Info */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm">
                 <CardHeader className="pb-3"><CardTitle className="text-base">Khách hàng</CardTitle></CardHeader>
                 <CardContent className="text-sm space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                          {order.customerName[0]}
                       </div>
                       <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-gray-500">{order.customerEmail}</p>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                       <p className="text-gray-500 mb-1 flex items-center gap-2"><MapPin size={14}/> Giao đến:</p>
                       <p className="font-medium">{order.shippingAddress.recipientName}</p>
                       <p>{order.shippingAddress.phone}</p>
                       <p className="text-gray-600 mt-1">{order.shippingAddress.street}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
                    </div>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                 <CardHeader className="pb-3"><CardTitle className="text-base">Ghi chú nội bộ</CardTitle></CardHeader>
                 <CardContent>
                    <Textarea 
                       value={printerNotes} 
                       onChange={(e) => setPrinterNotes(e.target.value)} 
                       className="bg-yellow-50/50 border-yellow-200 min-h-[100px]"
                       placeholder="Ghi chú chỉ bạn thấy..."
                    />
                    <Button size="sm" className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white">Lưu ghi chú</Button>
                 </CardContent>
              </Card>
           </div>

           {/* CENTER: Order Items & Artwork */}
           <div className="lg:col-span-2 space-y-6">
              {/* Artwork Status */}
              <Card className={cn("border-l-4 shadow-sm", 
                 artworkStatus === 'approved' ? "border-l-green-500" : 
                 artworkStatus === 'rejected' ? "border-l-red-500" : "border-l-yellow-500"
              )}>
                 <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                       <CardTitle className="flex items-center gap-2">
                          <FileText size={20} /> Trạng thái File In
                       </CardTitle>
                       <ArtworkStatusBadge status={artworkStatus} />
                    </div>
                 </CardHeader>
                 <CardContent>
                    {/* Proof History logic here */}
                    {(order as any).proofFiles?.length > 0 ? (
                       <ProofHistory proofs={(order as any).proofFiles} />
                    ) : (
                       <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                          <p className="text-sm text-gray-500">Chưa có file proof nào.</p>
                       </div>
                    )}
                    
                    {artworkStatus !== 'approved' && (
                       <Button onClick={() => setIsProofModalOpen(true)} className="mt-4 w-full" variant="outline">
                          <Upload size={16} className="mr-2"/> Tải lên bản in thử (Proof)
                       </Button>
                    )}
                 </CardContent>
              </Card>

              {/* Items List */}
              <Card className="border-none shadow-sm">
                 <CardHeader><CardTitle>Sản phẩm ({order.items.length})</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    {order.items.map((item, idx) => (
                       <div key={idx} className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                             {/* Item Image placeholder */}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                             <p className="text-sm text-gray-500 mt-1">x{item.quantity} • {formatPrice(item.pricePerUnit)}</p>
                             
                             <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="secondary" className="h-8 text-xs">
                                   <Download size={14} className="mr-1"/> Tải File Gốc
                                </Button>
                                {/* Design ID Link */}
                             </div>
                          </div>
                          <div className="text-right font-bold text-gray-900">
                             {formatPrice(item.subtotal)}
                          </div>
                       </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                       <span className="font-bold text-lg">Tổng cộng</span>
                       <span className="font-bold text-xl text-blue-600">{formatPrice(order.total)}</span>
                    </div>
                 </CardContent>
              </Card>
           </div>

        </div>
      </div>

      {/* Modals */}
      <UploadProofModal 
         isOpen={isProofModalOpen} 
         onClose={() => setIsProofModalOpen(false)} 
         orderId={orderId!} 
         currentVersion={(order as any).proofFiles?.length || 0} 
      />
    </div>
  );
}