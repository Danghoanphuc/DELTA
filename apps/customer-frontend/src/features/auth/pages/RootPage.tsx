// src/pages/RootPage.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import ChatAppPage from "@/features/chat/pages/AppPage";
import PrinterApp from "@/features/printer/pages/PrinterApp";
import { Loader2 } from "lucide-react"; // ✅ THÊM

const RootPage = () => {
  // ✅ LẤY BỐI CẢNH (CONTEXT)
  const { user, loading, activeContext, isContextLoading } = useAuthStore();

  if (loading || isContextLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ✅ PHÂN LUỒNG DỰA TRÊN BỐI CẢNH (CONTEXT)
  if (activeContext === "printer") {
    return <PrinterApp />; // Trỏ đến PrinterApp
  }

  // Mặc định (activeContext === "customer")
  return <ChatAppPage />;
};

export default RootPage;
