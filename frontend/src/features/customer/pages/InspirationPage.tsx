import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
export const InspirationPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <MobileNav />
    <div className="lg:ml-20 pt-16 lg:pt-0 p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Cảm hứng</h1>
      <p className="text-sm md:text-base text-gray-600">
        Khám phá kho mẫu và tìm nguồn cảm hứng của riêng mình
      </p>
      {/* Content */}
    </div>
  </div>
);
