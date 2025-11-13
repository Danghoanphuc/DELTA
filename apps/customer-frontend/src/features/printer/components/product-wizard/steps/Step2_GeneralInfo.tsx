// src/features/printer/components/product-wizard/steps/Step2_GeneralInfo.tsx
// ✅ ĐÃ SỬA: onValidate() -> onValidate={() => onValidate(3, ...)}

import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Edit3 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void; // ✅ Sửa: Hàm onValidate giờ được truyền từ hook
}

export function Step2_GeneralInfo({
  control,
  isExpanded,
  onExpand,
  onValidate,
}: StepProps) {
  const isDisabled = !isExpanded;

  return (
    <Card
      onClick={onExpand}
      className={isDisabled ? "bg-gray-50" : "cursor-pointer"}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isDisabled ? "text-gray-400" : ""
          }`}
        >
          <Edit3 className={isDisabled ? "text-gray-400" : "text-purple-600"} />
          Bước 2: Thông tin chung
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: In Ly sứ cao cấp 12oz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value} // ✅ SỬA: Dùng value thay vì defaultValue
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục hiển thị" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="business-card">Danh thiếp</SelectItem>
                    <SelectItem value="flyer">Tờ rơi</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="t-shirt">Áo thun</SelectItem>
                    <SelectItem value="mug">Cốc</SelectItem>
                    <SelectItem value="packaging">Bao bì</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ✅ SỬA: Gọi hàm onValidate (đã được bọc logic) */}
          <Button type="button" onClick={onValidate}>
            Tiếp tục (Qua Bước 3)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
