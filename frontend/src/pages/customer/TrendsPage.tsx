import { Sidebar } from "@/components/Sidebar";

export const TrendsPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <div className="ml-20 p-8">
      <h1 className="text-2xl font-bold">Xu hướng</h1>
      <p>Cập nhật những xu hướng mới nhất trong ngành in ấn.</p>
      {/* Nội dung trang Xu hướng sẽ ở đây */}
    </div>
  </div>
);
