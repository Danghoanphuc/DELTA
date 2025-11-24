// apps/customer-frontend/src/features/auth/pages/PrinterSignUpPage.tsx
// ✅ Refactored: Sử dụng AuthLayout và AuthFlowContainer với mode='printer'

import { AuthLayout } from "../components/AuthLayout";
import { AuthFlowContainer } from "../containers/AuthFlowContainer";

export default function PrinterSignUpPage() {
  return (
    <AuthLayout mode="printer">
      <AuthFlowContainer mode="signUp" />
    </AuthLayout>
  );
}
