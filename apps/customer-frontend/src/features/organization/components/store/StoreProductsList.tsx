// src/features/organization/components/store/StoreProductsList.tsx
// ✅ SOLID: Single Responsibility - Products list only

import { Plus, GripVertical, Image, Trash2, Package } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent } from "@/shared/components/ui/card";

interface Product {
  id?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  displayImage?: string;
  image?: string;
  price: number | null;
  isActive?: boolean;
  inStock?: boolean;
}

interface StoreProductsListProps {
  products: Product[];
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
}

export function StoreProductsList({
  products,
  onAddProduct,
  onRemoveProduct,
}: StoreProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Sản phẩm trong store</h3>
          <Button onClick={onAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có sản phẩm nào</p>
            <Button variant="outline" className="mt-4" onClick={onAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm đầu tiên
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Sản phẩm trong store ({products.length})
        </h3>
        <Button onClick={onAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id || product._id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                {product.displayImage || product.image ? (
                  <img
                    src={product.displayImage || product.image}
                    alt={product.displayName || product.name || "Product"}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <Image className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">
                    {product.displayName || product.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {product.price?.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={product.isActive ?? product.inStock ?? true}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onRemoveProduct(product.id || product._id || "")
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
