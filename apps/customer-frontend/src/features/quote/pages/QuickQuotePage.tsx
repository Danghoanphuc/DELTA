// apps/customer-frontend/src/features/quote/pages/QuickQuotePage.tsx

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Check, Download, Printer, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/utils/toast";

// Mock data sản phẩm
const PRODUCTS = [
  { id: "card", name: "Danh thiếp (Namecard)", unit: "Hộp", basePrice: 50000 },
  { id: "flyer", name: "Tờ rơi A5 (Flyer)", unit: "Tờ", basePrice: 2000 },
  {
    id: "catalogue",
    name: "Catalogue 16 trang",
    unit: "Cuốn",
    basePrice: 25000,
  },
  { id: "standee", name: "Standee Cuốn", unit: "Cái", basePrice: 150000 },
];

export default function QuickQuotePage() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [quantity, setQuantity] = useState(5); // Mặc định 5 hộp
  const [loading, setLoading] = useState(false);

  const product = PRODUCTS.find((p) => p.id === selectedProduct)!;

  // Logic tính giá giả lập
  const calculatePrice = (qty: number, type: "standard" | "fast" | "rush") => {
    let multiplier = 1;
    if (type === "fast") multiplier = 1.3;
    if (type === "rush") multiplier = 1.8;

    // Giảm giá số lượng lớn
    const discount = qty > 10 ? 0.9 : 1;

    return (product.basePrice * qty * multiplier * discount).toLocaleString(
      "vi-VN"
    );
  };

  const handleDownloadPDF = () => {
    setLoading(true);
    // Giả lập gọi API tạo PDF
    setTimeout(() => {
      setLoading(false);
      toast.success("Đã tải xuống báo giá BG-2025-001.pdf");
      // Thực tế: window.open(url_pdf)
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* HEADER: UY TÍN & PHÁP LÝ */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <ShieldCheck size={14} /> Hệ thống báo giá doanh nghiệp
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2">
            Báo giá tự động & Xuất hóa đơn
          </h1>
          <p className="text-stone-500">
            Nhận báo giá chính thức có mộc đỏ (Red Stamp) chỉ trong 30 giây.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* CỘT TRÁI: CẤU HÌNH (INPUT) */}
          <Card className="lg:col-span-1 p-6 border-stone-200 shadow-sm bg-white">
            <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Printer size={18} className="text-stone-400" />
              Thông tin in ấn
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-500 uppercase">
                  Sản phẩm
                </label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="bg-stone-50 border-stone-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-500 uppercase">
                  Số lượng ({product.unit})
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-stone-50 border-stone-200"
                  min={1}
                />
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                  <Check size={16} className="text-green-600" /> Xuất hóa đơn
                  VAT
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Check size={16} className="text-green-600" /> File in tiêu
                  chuẩn
                </div>
              </div>
            </div>
          </Card>

          {/* CỘT PHẢI: KẾT QUẢ (OUTPUT) */}
          <div className="lg:col-span-2 space-y-4">
            {/* BẢNG GIÁ MA TRẬN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Tiêu chuẩn */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-400 transition-all cursor-pointer group">
                <div className="text-xs font-bold text-stone-400 uppercase mb-1">
                  Tiêu chuẩn
                </div>
                <div className="text-2xl font-serif font-bold text-stone-800 mb-1">
                  {calculatePrice(quantity, "standard")}đ
                </div>
                <div className="text-xs text-stone-500 mb-4">
                  3-4 ngày làm việc
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 group-hover:bg-stone-900 group-hover:text-white"
                >
                  Chọn gói này
                </Button>
              </div>

              {/* Option 2: Nhanh (Popular) */}
              <div className="bg-blue-50/50 border-2 border-blue-600 rounded-xl p-5 relative shadow-md transform scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Khuyên dùng
                </div>
                <div className="text-xs font-bold text-blue-800 uppercase mb-1">
                  In Nhanh
                </div>
                <div className="text-2xl font-serif font-bold text-blue-900 mb-1">
                  {calculatePrice(quantity, "fast")}đ
                </div>
                <div className="text-xs text-blue-700/80 mb-4">
                  24h - 48h làm việc
                </div>
                <Button className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700">
                  Chọn gói này
                </Button>
              </div>

              {/* Option 3: Hỏa tốc */}
              <div className="bg-white border border-orange-200 rounded-xl p-5 hover:border-orange-400 transition-all cursor-pointer group">
                <div className="text-xs font-bold text-orange-600 uppercase mb-1 flex items-center gap-1">
                  <Zap size={12} fill="currentColor" /> Hỏa tốc
                </div>
                <div className="text-2xl font-serif font-bold text-stone-800 mb-1">
                  {calculatePrice(quantity, "rush")}đ
                </div>
                <div className="text-xs text-stone-500 mb-4">
                  Lấy ngay trong ngày
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Chọn gói này
                </Button>
              </div>
            </div>

            {/* ACTION CENTER */}
            <Card className="p-6 bg-[#1c1917] text-white border-none shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-serif text-lg font-medium mb-1">
                  Cần file trình Sếp?
                </h4>
                <p className="text-stone-400 text-sm">
                  Tải báo giá PDF có dấu đỏ ngay lập tức.
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-white text-black hover:bg-stone-200 font-bold"
                >
                  {loading ? (
                    "Đang tạo..."
                  ) : (
                    <>
                      <Download size={16} className="mr-2" /> Tải PDF
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Trust Footer */}
            <div className="flex justify-center gap-6 text-stone-400 text-xs pt-4">
              <span>★ ISO 9001:2015</span>
              <span>★ Hóa đơn điện tử BKAV</span>
              <span>★ Bảo mật SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
