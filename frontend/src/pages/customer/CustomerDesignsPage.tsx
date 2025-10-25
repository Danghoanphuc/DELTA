import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
export const CustomerDesignsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <MobileNav />
    <div className="lg:ml-20 pt-16 lg:pt-0 p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Kho mẫu của tôi</h1>
      <p className="text-sm md:text-base text-gray-600">
        Lưu trữ ý tưởng và thiết kế của bạn
      </p>
      {/* Content */}
    </div>
  </div>
);
