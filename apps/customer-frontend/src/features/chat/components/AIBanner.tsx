// features/chat/components/AIBanner.tsx (CẬP NHẬT)
import { Card, CardContent } from "@/shared/components/ui/card";
import { Sparkles } from "lucide-react";

export const AIBanner = () => {
  return (
    // ✅ SỬA CHIỀU CAO: lg:h-80 -> lg:h-64
    <Card className="h-60 sm:h-72 lg:h-40 overflow-hidden">
      <CardContent className="p-0 h-full w-full">
        <div className="relative h-full w-full bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_35%),radial-gradient(circle_at_70%_80%,white,transparent_35%)]" />
          <div className="relative z-10 h-full w-full text-white flex items-center justify-center">
            <div className="text-center px-6">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest opacity-90">
                <Sparkles size={14} />
                <span>Trợ lý thiết kế AI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Lên Mẫu Trong 60 Giây
              </h2>
              <p className="opacity-95 mt-2 text-sm">
                Nhập ý tưởng – AI dựng layout, xuất file in chuẩn màu.
              </p>
              <a
                href="/design-editor"
                className="inline-block mt-4 bg-white text-fuchsia-700 font-semibold px-4 py-2 rounded-md"
              >
                Bắt đầu thiết kế với AI
              </a>
              <div className="mt-2 text-xs opacity-85">
                Miễn phí bản nháp • Preview 3D tức thì
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};