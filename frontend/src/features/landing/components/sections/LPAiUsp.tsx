// src/features/landing/components/sections/LPAiUsp.tsx (CẬP NHẬT)

import { Button } from "@/shared/components/ui/button";
import { Sparkles, CheckCircle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. IMPORT useNavigate
import { Card, CardContent } from "@/shared/components/ui/card";
import zinAvatar from "@/assets/img/zin-avatar.png";

export function LPAiUsp() {
  const navigate = useNavigate(); // 2. KHỞI TẠO navigate

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* ... (nền chấm bi giữ nguyên) ... */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in-up" style={{ animationDelay: "100ms" }}>
            {/* ... (phần text mô tả giữ nguyên) ... */}
            <h2 className="mb-6 text-white">
              Gặp gỡ Zin - Chuyên gia In ấn AI
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="text-white mb-1">
                    Tư vấn thiết kế thông minh
                  </h5>
                  <p className="text-blue-100">
                    Zin giúp bạn chọn màu sắc, font chữ và bố cục phù hợp nhất
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="text-white mb-1">Tạo thiết kế tự động</h5>
                  <p className="text-blue-100">
                    Chỉ cần mô tả ý tưởng, AI sẽ tạo mẫu thiết kế cho bạn
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="text-white mb-1">Tối ưu chi phí in ấn</h5>
                  <p className="text-blue-100">
                    So sánh giá từ nhiều nhà in và gợi ý phương án tốt nhất
                  </p>
                </div>
              </div>
            </div>

            {/* 3. THÊM onClick cho nút này */}
            <Button
              onClick={() => navigate("/app")}
              className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-6 rounded-full animate-pulse-slow"
            >
              Trò chuyện với Zin
              <MessageCircle className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div
            className="relative fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center animate-pulse-slow">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={zinAvatar}
                      alt="Zin AI Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h5 className="text-white">AI Zin</h5>
                  <p className="text-sm text-blue-100">Đang hoạt động</p>
                </div>
              </div>

              {/* 4. THAY THẾ CHAT DEMO CŨ BẰNG CHAT DEMO MỚI (GIỐNG ẢNH BẠN GỬI) */}
              <div className="space-y-4 ">
                {/* Tin nhắn của User */}

                {/* Right - Visual */}
                <div className="relative">
                  <Card className="border-non shadow-2xl">
                    {/* ĐÃ THAY ĐỔI DÒNG NÀY:
                  - Đổi 'bg-white' thành 'bg-white/80' (nền trắng, 80% độ mờ)
                  - Thêm 'backdrop-blur-md' (hiệu ứng kính mờ)
                  - Thêm 'rounded-2xl' (bo góc cho nền)
                */}
                    <CardContent className="p-8 ">
                      {/* Mock Chat Interface */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                            <img
                              src={zinAvatar}
                              alt="Zin AI Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 bg-purple-50 rounded-2xl rounded-tl-none p-4">
                            <p className="text-sm text-gray-800">
                              Chào bạn! Mình là Zin. Bạn muốn in loại sản phẩm
                              nào hôm nay? 😊
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            👤
                          </div>
                          <div className="flex-1 bg-blue-600 text-white rounded-2xl rounded-tr-none p-4">
                            <p className="text-sm">
                              Tôi cần in 100 danh thiếp cho công ty mới
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                            <img
                              src={zinAvatar}
                              alt="Zin AI Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 bg-purple-50 rounded-2xl rounded-tl-none p-4">
                            <p className="text-sm text-gray-800">
                              Tuyệt vời! Bạn đã có thiết kế chưa hay cần mình
                              gợi ý một số mẫu đẹp? ✨
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
