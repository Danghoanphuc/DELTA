import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
export const TrendsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <MobileNav />
    <div className="lg:ml-20 pt-16 lg:pt-0 p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Xu hướng</h1>
      <p className="text-sm md:text-base text-gray-600">
        Nơi bạn cập nhật xu hướng thiết kế in ấn và tạo mẫu mới nhất cho mình
      </p>
      {/* Content */}
    </div>
  </div>
);
