// apps/customer-frontend/src/features/auth/pages/PrinterSignInPage.tsx
// ✅ Refactored: Sử dụng AuthLayout và AuthFlowContainer với mode='printer'

import { AuthLayout } from "../components/AuthLayout";
import { AuthFlowContainer } from "../containers/AuthFlowContainer";

export default function PrinterSignInPage() {
  return (
    <AuthLayout mode="printer">
      <AuthFlowContainer mode="signIn" />
    </AuthLayout>
  );
}
