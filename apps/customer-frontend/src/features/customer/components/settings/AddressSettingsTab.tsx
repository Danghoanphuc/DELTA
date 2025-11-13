// src/features/customer/components/settings/AddressSettingsTab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

export function AddressSettingsTab() {
  // TODO:
  // const { addresses, isLoading, openAddModal, openEditModal } = useAddressBook();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sổ địa chỉ</CardTitle>
        <CardDescription>
          Quản lý các địa chỉ giao hàng của bạn để thanh toán nhanh hơn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: List các địa chỉ ở đây */}
        <p className="text-gray-500 text-sm">
          (Danh sách địa chỉ đã lưu sẽ xuất hiện ở đây...)
        </p>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Thêm địa chỉ mới
        </Button>
      </CardFooter>
    </Card>
  );
}
