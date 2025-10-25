import { Sidebar } from "@/components/Sidebar";

export const CustomerDesignsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <div className="ml-20 p-8">
      <h1 className="text-2xl font-bold">Thiết kế của tôi</h1>
      <p>Nơi lưu trữ các thiết kế bạn đã tạo hoặc tải lên.</p>
      {/* Nội dung trang thiết kế sẽ ở đây */}
    </div>
  </div>
);
