// frontend/src/features/printer/add-product-flow/Step1_CategorySelect.tsx

import {
  Card,
  CardContent,
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
import { Package } from "lucide-react";

interface Step1Props {
  categories: Array<{ value: string; label: string }>;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export function Step1_CategorySelect({
  categories,
  selectedCategory,
  onCategoryChange,
}: Step1Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="text-blue-600" />
          Bước 1: Chọn Phôi (Sản phẩm gốc)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-2">
          Mỗi danh mục có sẵn phôi 3D mẫu. Bạn cũng có thể tải phôi riêng ở bước
          sau.
        </p>
      </CardContent>
    </Card>
  );
}
