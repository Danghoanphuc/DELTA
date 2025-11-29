// src/features/customer/components/settings/AddressSettingsTab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { SavedAddressesSection } from "./SavedAddressesSection";

export function AddressSettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sổ địa chỉ</CardTitle>
        <CardDescription>
          Quản lý các địa chỉ giao hàng của bạn để thanh toán nhanh hơn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SavedAddressesSection />
      </CardContent>
    </Card>
  );
}
