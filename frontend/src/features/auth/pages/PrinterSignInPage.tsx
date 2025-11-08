// src/pages/PrinterSignInPage.tsx (BẢN FULL)

import { AuthFlow } from "@/features/auth/components/AuthFlow";

const PrinterSignInPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
      {/*
        Chúng ta dùng AuthFlow ở chế độ "signIn".
        Vai trò sẽ được xác định tự động hoặc trong các bước tiếp theo.
      */}
      <AuthFlow mode="signIn" />
    </div>
  );
};

export default PrinterSignInPage;
