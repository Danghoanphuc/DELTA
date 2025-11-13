// apps/admin-frontend/src/pages/DashboardPage.tsx
import { useNavigate, Link } from "react-router-dom"; // <-- THÊM Link
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { signOut } from "@/services/adminAuthService";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/services/dashboardService";
import { DashboardStats } from "@/components/DashboardStats";
import { RevenueChart } from "@/components/RevenueChart";
import { Users, Building } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();

  const { admin } = useAdminAuthStore((state) => ({
    admin: state.admin,
  }));

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p>Đang tải dữ liệu dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg bg-red-100 p-6 text-center text-red-700 shadow">
          <p>Lỗi: {(error as Error).message}</p>
        </div>
      );
    }

    if (dashboardData) {
      return (
        <div className="space-y-6">
          <DashboardStats stats={dashboardData.stats} />
          <RevenueChart data={dashboardData.chartData} />

          {/* === CẬP NHẬT KHỐI NÀY === */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Các tính năng quản trị</h2>
            <div className="mt-4 flex space-x-4">
              <Link
                to="/users"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Users className="mr-2 h-5 w-5" />
                Quản lý User
              </Link>
              <Link
                to="/printer-vetting"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <Building className="mr-2 h-5 w-5" />
                Duyệt Nhà in
              </Link>
            </div>
          </div>
          {/* ======================= */}

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">
              Thông tin Admin (từ Zustand)
            </h2>
            <pre className="mt-4 overflow-auto rounded-md bg-gray-100 p-4 text-sm">
              {JSON.stringify(admin, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              PrintZ Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Chào,{" "}
                <strong className="font-medium">
                  {admin ? admin.displayName : "Admin"}
                </strong>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">{renderContent()}</div>
      </main>
    </div>
  );
};

export default DashboardPage;
