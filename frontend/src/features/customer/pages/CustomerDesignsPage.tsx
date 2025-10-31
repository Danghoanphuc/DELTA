// src/features/customer/pages/CustomerDesignsPage.tsx
import { Sidebar } from "@/components/Sidebar"; //
import { MobileNav } from "@/components/MobileNav"; //
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { useMyDesigns } from "../hooks/useMyDesigns";
import { DesignCard } from "../components/DesignCard";
import { DesignEmptyState } from "../components/DesignEmptyState";
import { Skeleton } from "@/shared/components/ui/skeleton"; // (Giả sử bạn có component này)
import { Card, CardContent } from "@/shared/components/ui/card";

// Skeleton component cho loading
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="w-full aspect-square" />
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const CustomerDesignsPage = () => {
  const { designs, loading } = useMyDesigns();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      <div className="lg:ml-20 pt-16 lg:pt-0 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">
              Kho thiết kế của tôi
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Lưu trữ ý tưởng và các thiết kế bạn đã tùy chỉnh.
            </p>
          </div>
          <Button asChild>
            <Link to="/templates">
              <Plus size={18} className="mr-2" />
              Tạo thiết kế mới
            </Link>
          </Button>
        </div>

        {/* Content Grid */}
        <div>
          {loading ? (
            <LoadingSkeleton />
          ) : designs.length === 0 ? (
            <DesignEmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {designs.map((design) => (
                <DesignCard key={design._id} design={design} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
