// src/pages/RootPage.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import ChatAppPage from "@/features/main/pages/AppPage";
import OrganizationApp from "@/features/organization/pages/OrganizationApp";
import { Loader2 } from "lucide-react";

const RootPage = () => {
  const { user, loading, activeContext, isContextLoading } = useAuthStore();

  if (loading || isContextLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Phân luồng dựa trên context
  if (activeContext === "organization") {
    return <OrganizationApp />;
  }

  // Mặc định (customer)
  return <ChatAppPage />;
};

export default RootPage;
