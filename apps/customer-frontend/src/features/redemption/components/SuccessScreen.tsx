// src/features/redemption/components/SuccessScreen.tsx
// ✅ SOLID: Single Responsibility - Success display only

import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { RedemptionLink } from "../hooks/useRedemption";

interface SuccessScreenProps {
  link: RedemptionLink;
}

export function SuccessScreen({ link }: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${link.branding.primaryColor}20` }}
          >
            <CheckCircle
              className="w-10 h-10"
              style={{ color: link.branding.primaryColor }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {link.branding.thankYouTitle}
          </h2>
          <p className="text-gray-600 mb-6">
            {link.branding.thankYouMessage ||
              "Thông tin của bạn đã được ghi nhận. Quà sẽ được gửi đến bạn sớm nhất!"}
          </p>
          {link.organization.name && (
            <p className="text-sm text-gray-500">Từ {link.organization.name}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
