// src/pages/SignInPage.tsx (CẬP NHẬT)
import { AuthFlow } from "@/components/auth/AuthFlow"; // <-- IMPORT MỚI

const SignInPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
      <AuthFlow mode="signIn" role="customer" />
    </div>
  );
};

export default SignInPage;
