// src/features/landing/components/sections/LPCta.tsx (CẬP NHẬT)

import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function LPCta() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* ... (nền sọc giữ nguyên) ... */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQyIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQyKSIvPjwvc3ZnPg==')] opacity-30"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative fade-in-up">
        <h2 className="mb-6 text-white">
          Sẵn sàng biến ý tưởng thành hiện thực?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Tham gia cùng hàng nghìn doanh nghiệp đã tin tưởng Printz.vn cho nhu
          cầu in ấn của họ
        </p>

        {/* 1. Thêm class 'animate-pulse-slow' */}
        <Button
          asChild
          className="bg-white text-purple-600 hover:bg-blue-50 px-12 py-6 rounded-full text-lg 
                           animate-pulse-slow"
        >
          <Link to="/app">
            Đăng ký ngay - Miễn phí
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>

        <p className="text-sm text-blue-100 mt-4">
          Không cần thẻ tín dụng • Hủy bất cứ lúc nào
        </p>
      </div>
    </section>
  );
}
