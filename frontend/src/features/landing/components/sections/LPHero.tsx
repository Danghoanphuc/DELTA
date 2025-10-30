// src/features/landing/components/sections/LPHero.tsx (CẬP NHẬT)

import { Button } from "@/shared/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
// 1. Import ImageWithFallback
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

export function LPHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* ... (phần nền sọc giữ nguyên) ... */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZHRoPSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTUxLDIzNCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 2. Thêm class 'fade-in-up' cho khối text */}
          <div
            className="space-y-8 fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              Bạn muốn sáng tạo{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                nội dung
              </span>{" "}
              gì?
            </h1>

            <p>
              Với Printz.vn, bạn có thể thiết kế, tạo nội dung, in ấn và làm mọi
              thứ bạn cần. Kết nối trực tiếp với hàng trăm nhà in uy tín trên
              toàn quốc.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-full">
                Khám phá Kho mẫu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Hỏi AI Zin
                <MessageCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 3. Thêm class 'animate-float' cho khối ảnh */}
          <div className="relative animate-float">
            {/* ... (phần blur nền giữ nguyên) ... */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 blur-3xl"></div>

            {/* 4. Thay thế các khối màu bằng ảnh thật (dùng ImageWithFallback) */}
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {/* Thay thế ảnh 1 */}
                <div className="rounded-2xl p-4 h-40 transform rotate-3 hover:rotate-0 transition-transform shadow-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://cdn.pacdora.com/edits/68cebd9a8efe4e03829ef48952951dcb.jpg" // Ảnh đề xuất:
                    alt="Sản phẩm mới"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {/* Thay thế ảnh 2 */}
                <div className="rounded-2xl p-4 h-56 transform -rotate-2 hover:rotate-0 transition-transform shadow-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://cdn.pacdora.com/edits/a7808fb8804e4857b43a41cf45155046.jpg" // Ảnh đề xuất:
                    alt="Nghiên cứu mới"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                {/* Thay thế ảnh 3 */}
                <div className="rounded-2xl p-4 h-56 transform -rotate-3 hover:rotate-0 transition-transform shadow-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://cdn.pacdora.com/edits/7da8f13ca8ba4892ac66ab62de6f7ffe.jpg" // Ảnh đề xuất:
                    alt="Xuất ý tưởng"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {/* Thay thế ảnh 4 */}
                <div className="rounded-2xl p-4 h-40 transform rotate-2 hover:rotate-0 transition-transform shadow-xl overflow-hidden">
                  <ImageWithFallback
                    src="https://cdn.pacdora.com/edits/dddb4cc59341482286d2766aa59b8474.jpg" // Ảnh đề xuất:
                    alt="Trang tĩnh"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
