// src/features/organization/components/store/AddProductModal.tsx
// ✅ SOLID: Single Responsibility - Add product modal only

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { StoreProductData } from "@/features/company-store/services/company-store.service";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: StoreProductData) => Promise<unknown>;
}

const INITIAL_PRODUCT: Partial<StoreProductData> = {
  displayName: "",
  price: 0,
  isActive: true,
  displayImage: "",
};

export function AddProductModal({
  open,
  onOpenChange,
  onAdd,
}: AddProductModalProps) {
  const [product, setProduct] =
    useState<Partial<StoreProductData>>(INITIAL_PRODUCT);

  const handleAdd = async () => {
    if (!product.displayName || !product.price) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await onAdd(product as StoreProductData);
      onOpenChange(false);
      setProduct(INITIAL_PRODUCT);
    } catch (err: any) {
      toast.error(err.message || "Không thể thêm sản phẩm");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tên sản phẩm *</Label>
            <Input
              value={product.displayName}
              onChange={(e) =>
                setProduct({ ...product, displayName: e.target.value })
              }
              placeholder="VD: Áo thun công ty"
            />
          </div>
          <div>
            <Label>Giá (VND) *</Label>
            <Input
              type="number"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>Hình ảnh URL</Label>
            <Input
              value={product.displayImage || ""}
              onChange={(e) =>
                setProduct({ ...product, displayImage: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleAdd}>Thêm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
