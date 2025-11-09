// src/features/shop/components/details/SectionSkeleton.tsx
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Loader2 } from "lucide-react";

export const SectionSkeleton = ({ height = "300px" }) => (
  <Card className="mt-6 shadow-sm" style={{ height }}>
    <CardContent className="p-6 h-full">
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="mt-2 text-sm">Đang tải thêm thông tin...</p>
      </div>
    </CardContent>
  </Card>
);
