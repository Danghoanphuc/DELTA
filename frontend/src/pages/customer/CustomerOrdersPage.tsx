import { Sidebar } from "@/components/Sidebar";

export const CustomerOrdersPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <div className="ml-20 p-8">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      <p>Nơi bạn theo dõi các đơn hàng đã đặt.</p>
      {/* Nội dung trang đơn hàng sẽ ở đây */}
    </div>
  </div>
);
