// frontend/src/features/printer/add-product-flow/Step2_BasicInfoForm.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { FileText } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { AddProductFormData } from "@/types/product";

interface Step2Props {
  register: UseFormRegister<AddProductFormData>;
  errors: FieldErrors<AddProductFormData>;
}

export function Step2_BasicInfoForm({ register, errors }: Step2Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="text-blue-600" />
          Bước 2: Thông tin sản phẩm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tên */}
        <div>
          <Label htmlFor="name">Tên sản phẩm *</Label>
          <Input
            id="name"
            {...register("name", { required: true })}
            placeholder="VD: Card visit cao cấp"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">Tên là bắt buộc</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Mô tả sản phẩm..."
            rows={3}
          />
        </div>

        {/* Giá */}
        <div>
          <Label htmlFor="pricePerUnit">Giá (VNĐ/đơn vị) *</Label>
          <Input
            id="pricePerUnit"
            type="number"
            {...register("pricePerUnit", { required: true, min: 100 })}
            placeholder="10000"
          />
          {errors.pricePerUnit && (
            <p className="text-xs text-red-500 mt-1">Giá phải ≥ 100</p>
          )}
        </div>

        {/* Thời gian sản xuất */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="productionTimeMin">Thời gian SX (min) *</Label>
            <Input
              id="productionTimeMin"
              type="number"
              {...register("productionTimeMin", { required: true })}
              defaultValue={3}
            />
          </div>
          <div>
            <Label htmlFor="productionTimeMax">Thời gian SX (max) *</Label>
            <Input
              id="productionTimeMax"
              type="number"
              {...register("productionTimeMax", { required: true })}
              defaultValue={7}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
