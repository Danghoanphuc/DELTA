// src/features/redemption/components/ErrorScreen.tsx
// ✅ SOLID: Single Responsibility - Error display only

import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

interface ErrorScreenProps {
  error: string;
  onGoHome: () => void;
}

export function ErrorScreen({ error, onGoHome }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không thể truy cập</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onGoHome} variant="outline">
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
