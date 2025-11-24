// apps/customer-frontend/src/features/auth/pages/SignUpPage.tsx
// ✅ Entry point cho Router, sử dụng AuthLayout và AuthFlowContainer

import { AuthLayout } from "../components/AuthLayout";
import { AuthFlowContainer } from "../containers/AuthFlowContainer";

export default function SignUpPage() {
  return (
    <AuthLayout mode="customer">
      <AuthFlowContainer mode="signUp" />
    </AuthLayout>
  );
}

