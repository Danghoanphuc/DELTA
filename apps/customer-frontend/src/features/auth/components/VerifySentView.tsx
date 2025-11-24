// apps/customer-frontend/src/features/auth/components/VerifySentView.tsx
// ✅ Presentational Component: Hiển thị thông báo đã gửi email xác thực

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

interface VerifySentViewProps {
  email: string;
}

export function VerifySentView({ email }: VerifySentViewProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center text-gray-700 space-y-4">
      <p>
        Chúng tôi đã gửi một email xác thực đến{" "}
        <strong className="text-gray-900">{email}</strong>.
      </p>
      <p className="text-sm">
        Vui lòng kiểm tra hộp thư (cả mục Spam) và nhấn vào link để kích hoạt.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => navigate("/check-email", { state: { email } })}
      >
        Tôi đã xác thực
      </Button>
    </div>
  );
}

