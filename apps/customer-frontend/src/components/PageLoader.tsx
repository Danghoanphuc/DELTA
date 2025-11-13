// apps/customer-frontend/src/components/PageLoader.tsx
// (TỆP MỚI - Tách ra từ App.tsx)

import { Loader2 } from "lucide-react";

export const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

export default PageLoader;
