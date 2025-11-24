// apps/customer-frontend/src/features/auth/pages/SignInPage.tsx
// ✅ Entry point cho Router, sử dụng AuthLayout và AuthFlowContainer

import { AuthLayout } from "../components/AuthLayout";
import { AuthFlowContainer } from "../containers/AuthFlowContainer";

export default function SignInPage() {
  return (
    <AuthLayout mode="customer">
      <AuthFlowContainer mode="signIn" />
    </AuthLayout>
  );
}
