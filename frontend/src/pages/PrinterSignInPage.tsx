// src/pages/PrinterSignInPage.tsx (BẢN FULL)

import { AuthFlow } from "@/components/auth/AuthFlow";

const PrinterSignInPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
      {/*
        Chúng ta dùng AuthFlow ở chế độ "signIn"
        và vai trò "printer" để nút Google (nếu dùng)
        biết cách gán vai trò.
      */}
      <AuthFlow mode="signIn" role="printer" />
    </div>
  );
};

export default PrinterSignInPage;
