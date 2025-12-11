// apps/admin-frontend/src/pages/DeliveryManagementPage.tsx
// ✅ Unified Delivery Management Page - Orders + Check-ins

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin } from "lucide-react";
import { SwagOrdersTab } from "@/components/delivery-management/SwagOrdersTab";
import { DeliveryCheckinsTab } from "@/components/delivery-management/DeliveryCheckinsTab";

export default function DeliveryManagementPage() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý giao hàng</h1>
        <p className="text-gray-500 mt-1">
          Theo dõi đơn hàng và check-in giao hàng tập trung
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Đơn hàng Swag
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Check-ins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <SwagOrdersTab />
        </TabsContent>

        <TabsContent value="checkins" className="mt-6">
          <DeliveryCheckinsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
