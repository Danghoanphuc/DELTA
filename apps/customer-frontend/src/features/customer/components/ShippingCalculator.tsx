// src/features/customer/components/ShippingCalculator.tsx
import { useState } from "react";
import { Calculator, MapPin, Truck, Package } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface ShippingCalculatorProps {
  totalAmount: number;
  onShippingChange?: (shippingFee: number) => void;
}

export function ShippingCalculator({
  totalAmount,
  onShippingChange,
}: ShippingCalculatorProps) {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock provinces (in real app, fetch from API)
  const provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"];
  const districts = ["Quận 1", "Quận 2", "Quận 3"];
  const wards = ["Phường 1", "Phường 2", "Phường 3"];
  const shippingMethods = [
    { value: "standard", label: "Giao hàng tiêu chuẩn", fee: 30000 },
    { value: "express", label: "Giao hàng nhanh", fee: 50000 },
    { value: "premium", label: "Giao hàng cao cấp", fee: 80000 },
  ];

  const handleCalculate = async () => {
    if (!province || !district || !ward || !shippingMethod) {
      return;
    }

    setIsCalculating(true);
    // Mock API call
    setTimeout(() => {
      const method = shippingMethods.find((m) => m.value === shippingMethod);
      const fee = method?.fee || 0;
      setShippingFee(fee);
      onShippingChange?.(fee);
      setIsCalculating(false);
    }, 1000);
  };

  const canCalculate = province && district && ward && shippingMethod;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" />
          Tính phí vận chuyển
        </CardTitle>
        <CardDescription>
          Nhập địa chỉ để tính phí vận chuyển chính xác
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Tỉnh/Thành phố
            </label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh/thành" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Quận/Huyện</label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận/huyện" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phường/Xã</label>
            <Select value={ward} onValueChange={setWard}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phường/xã" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Phương thức vận chuyển
          </label>
          <Select value={shippingMethod} onValueChange={setShippingMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phương thức" />
            </SelectTrigger>
            <SelectContent>
              {shippingMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!canCalculate || isCalculating}
          className="w-full"
        >
          {isCalculating ? "Đang tính..." : "Tính phí vận chuyển"}
        </Button>

        {shippingFee !== null && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Phí vận chuyển:</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {shippingFee.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between">
              <span className="font-medium">Tổng đơn hàng:</span>
              <span className="text-lg font-bold">
                {(totalAmount + shippingFee).toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

