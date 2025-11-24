// apps/customer-frontend/src/features/customer/pages/SignUpPage.tsx
// ✅ Refactored: Sử dụng AuthLayout và AuthFlowContainer (giống auth/pages/SignUpPage.tsx)
// Note: File này có thể được xóa nếu App.tsx đã import từ auth/pages/SignUpPage.tsx

import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthFlowContainer } from "@/features/auth/containers/AuthFlowContainer";

export default function SignUpPage() {
  return (
    <AuthLayout mode="customer">
      <AuthFlowContainer mode="signUp" />
    </AuthLayout>
  );
}
