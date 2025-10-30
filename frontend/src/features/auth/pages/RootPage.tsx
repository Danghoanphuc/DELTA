// src/pages/RootPage.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import ChatAppPage from "@/features/chat/pages/ChatAppPage";
import PrinterApp from "@/features/printer/pages/PrinterApp"; // 👈 Sửa import

const RootPage = () => {
  const { user, loading } = useAuthStore();

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang của bạn...
      </div>
    );
  }

  // Phân luồng dựa trên vai trò
  if (user.role === "printer") {
    return <PrinterApp />; // 👈 Trỏ đến PrinterApp
  }

  // Mặc định (hoặc user.role === "customer")
  return <ChatAppPage />;
};

export default RootPage;
