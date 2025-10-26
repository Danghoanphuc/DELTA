// frontend/src/components/printer/EditProductModal.tsx (NEW FILE)

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrinterProduct, ProductPrice } from "@/types/product";
import { toast } from "sonner";
import api from "@/lib/axios";

interface EditProductModalProps {
  product: PrinterProduct;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    description: product.description || "",
    specifications: {
      material: product.specifications?.material || "",
      size: product.specifications?.size || "",
      color: product.specifications?.color || "",
    },
    pricing: product.pricing || [{ minQuantity: 100, pricePerUnit: 1000 }],
    isActive: product.isActive,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description || "",
        specifications: {
          material: product.specifications?.material || "",
          size: product.specifications?.size || "",
          color: product.specifications?.color || "",
        },
        pricing: product.pricing || [{ minQuantity: 100, pricePerUnit: 1000 }],
        isActive: product.isActive,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.put(`/products/${product._id}`, formData);
      toast.success("✅ Cập nhật sản phẩm thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Update Product Error:", err);
      toast.error(err.response?.data?.message || "Không thể cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePricingChange = (
    index: number,
    field: keyof ProductPrice,
    value: number
  ) => {
    const updatedPricing = [...formData.pricing];
    updatedPricing[index] = { ...updatedPricing[index], [field]: value };
    setFormData({ ...formData, pricing: updatedPricing });
  };

  const addPricingTier = () => {
    setFormData({
      ...formData,
      pricing: [...formData.pricing, { minQuantity: 0, pricePerUnit: 0 }],
    });
  };

  const removePricingTier = (index: number) => {
    if (formData.pricing.length <= 1) {
      toast.error("Phải có ít nhất 1 bậc giá");
      return;
    }
    const updatedPricing = formData.pricing.filter((_, i) => i !== index);
    setFormData({ ...formData, pricing: updatedPricing });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Danh mục *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business-card">Danh thiếp</SelectItem>
                <SelectItem value="flyer">Tờ rơi</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="brochure">Brochure</SelectItem>
                <SelectItem value="t-shirt">Áo thun</SelectItem>
                <SelectItem value="mug">Cốc</SelectItem>
                <SelectItem value="sticker">Sticker</SelectItem>
                <SelectItem value="packaging">Bao bì</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="material">Chất liệu</Label>
              <Input
                id="material"
                value={formData.specifications.material}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specifications: {
                      ...formData.specifications,
                      material: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="size">Kích thước</Label>
              <Input
                id="size"
                value={formData.specifications.size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specifications: {
                      ...formData.specifications,
                      size: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="color">In ấn</Label>
              <Input
                id="color"
                value={formData.specifications.color}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specifications: {
                      ...formData.specifications,
                      color: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <Label className="mb-2 block">Bảng giá theo số lượng</Label>
            <div className="space-y-3">
              {formData.pricing.map((price, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <Label className="text-xs">Số lượng (từ)</Label>
                    <Input
                      type="number"
                      value={price.minQuantity}
                      onChange={(e) =>
                        handlePricingChange(
                          index,
                          "minQuantity",
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Đơn giá (VND)</Label>
                    <Input
                      type="number"
                      value={price.pricePerUnit}
                      onChange={(e) =>
                        handlePricingChange(
                          index,
                          "pricePerUnit",
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePricingTier(index)}
                    disabled={formData.pricing.length <= 1}
                    className="text-red-600"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPricingTier}
              className="mt-3"
            >
              + Thêm bậc giá
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Đang bán (hiển thị sản phẩm)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
