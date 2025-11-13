// src/features/landing/components/sections/LPProcess.tsx (CẬP NHẬT)

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ArrowRight, Sparkles, ShoppingBag, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LPProcess() {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="mb-4">Quy trình Đặt hàng Đơn giản trong 3 Bước</h2>
          <p className="text-slate-600">
            Từ ý tưởng đến thành phẩm chỉ trong vài phút
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 1. Thêm class 'hover-lift' và 'fade-in-up' cho card 1 */}
          <div
            className="relative fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            {/* ... (phần số 01 giữ nguyên) ... */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white z-10">
              01
            </div>
            <Card className="pt-10 p-8 text-center border-2 border-transparent hover:border-blue-200 hover-lift">
              {/* ... (nội dung card giữ nguyên) ... */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="mb-3">Chọn mẫu thiết kế</h4>
              <p className="text-slate-600">
                Duyệt qua hàng ngàn mẫu hoặc tạo thiết kế riêng với AI Zin
              </p>
            </Card>
          </div>

          {/* 2. Thêm class 'hover-lift' và 'fade-in-up' cho card 2 */}
          <div
            className="relative fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            {/* ... (phần số 02 giữ nguyên) ... */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white z-10">
              02
            </div>
            <Card className="pt-10 p-8 text-center border-2 border-transparent hover:border-purple-200 hover-lift">
              {/* ... (nội dung card giữ nguyên) ... */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-purple-600" />
              </div>
              <h4 className="mb-3">Kết nối với nhà in</h4>
              <p className="text-slate-600">
                Hệ thống tự động ghép nối với nhà in phù hợp nhất
              </p>
            </Card>
          </div>

          {/* 3. Thêm class 'hover-lift' và 'fade-in-up' cho card 3 */}
          <div
            className="relative fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            {/* ... (phần số 03 giữ nguyên) ... */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white z-10">
              03
            </div>
            <Card className="pt-10 p-8 text-center border-2 border-transparent hover:border-pink-200 hover-lift">
              {/* ... (nội dung card giữ nguyên) ... */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-pink-600" />
              </div>
              <h4 className="mb-3">Nhận hàng tận nơi</h4>
              <p className="text-slate-600">
                Giao hàng nhanh chóng và đảm bảo chất lượng
              </p>
            </Card>
          </div>
        </div>

        <div
          className="text-center mt-12 fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <Button
            onClick={() => navigate("/process")}
            variant="outline"
            className="px-8 py-6 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            Tìm hiểu Chi tiết
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
