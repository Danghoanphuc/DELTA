// frontend/src/pages/customer/ProductDetailPage.tsx (ĐÃ SỬA)

import React, { useState, useEffect } from "react"; // <-- Thêm React
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, User, Star, MapPin } from "lucide-react";
import { PrinterProduct } from "@/types/product";
import { PrinterProfile } from "@/types/printerProfile";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";
// KHẮC PHỤC: Thêm import Label và Input
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Define a combined type for the fetched data
interface ProductWithPrinter extends PrinterProduct {
  printerInfo?: PrinterProfile;
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [customization, setCustomization] = useState({
    notes: "",
    fileUrl: "", // Tạm thời để trống, sẽ xử lý upload file sau
  });
  const { addToCart, isInCart } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      // ... (logic fetch giữ nguyên) ...
      if (!productId) return;
      setLoading(true);
      try {
        const res = await api.get(`/products/${productId}`);

        // SỬA Ở ĐÂY
        if (!res.data?.data?.product) {
          throw new Error("Product data not found");
        }
        // VÀ SỬA Ở ĐÂY
        const fetchedProduct = res.data.data.product as ProductWithPrinter;

        setProduct(fetchedProduct);
        if (fetchedProduct.pricing && fetchedProduct.pricing.length > 0) {
          setSelectedQuantity(fetchedProduct.pricing[0].minQuantity || 1);
        }
      } catch (err: any) {
        console.error("❌ Error fetching product:", err);
        toast.error("Không thể tải thông tin sản phẩm");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  const formatPrice = (price: number) => {
    // ... (logic format giữ nguyên) ...
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    // ... (logic chọn bậc giá giữ nguyên) ...
    if (!product?.pricing) return;
    let bestTierIndex = 0;
    for (let i = 0; i < product.pricing.length; i++) {
      if (selectedQuantity >= product.pricing[i].minQuantity) {
        if (
          product.pricing[i].minQuantity >=
          product.pricing[bestTierIndex].minQuantity
        ) {
          bestTierIndex = i;
        }
      }
    }
    setSelectedPriceIndex(bestTierIndex);
  }, [selectedQuantity, product?.pricing]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    if (isInCart(product._id)) {
      toast.info("Sản phẩm đã có trong giỏ hàng.");
      return;
    }
    setIsAddingToCart(true);
    try {
      // KHẮC PHỤC: Gửi kèm customization vào giỏ hàng
      await addToCart({
        productId: product._id,
        quantity: selectedQuantity,
        selectedPriceIndex: selectedPriceIndex,
        customization: customization, // <-- THÊM DÒNG NÀY
      });
      toast.success("Đã thêm vào giỏ hàng!"); // Thêm toast cho rõ ràng
    } catch (err) {
      toast.error("Thêm vào giỏ hàng thất bại"); // Thêm toast lỗi
    } finally {
      setIsAddingToCart(false);
    }
  };

  const currentPricePerUnit =
    product?.pricing[selectedPriceIndex]?.pricePerUnit ?? 0;
  const inCart = product ? isInCart(product._id) : false;

  if (loading) {
    /* ... loading UI ... */ return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }
  if (!product) {
    /* ... not found UI ... */ return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Không tìm thấy sản phẩm.</p>
      </div>
    );
  }

  const primaryImage = product.images?.[0]?.url || "/placeholder-product.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            {" "}
            <ArrowLeft size={18} className="mr-2" /> Quay lại{" "}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Image Section */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details Section */}
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600 mr-2">
                  {" "}
                  {formatPrice(currentPricePerUnit)}{" "}
                </span>
                <span className="text-gray-500">/ sản phẩm</span>
                {product.pricing.length > 1 && (
                  <p className="text-sm text-green-600">
                    {" "}
                    (Áp dụng cho số lượng từ{" "}
                    {product.pricing[selectedPriceIndex].minQuantity}+){" "}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}

              {/* Specifications */}
              <Card className="mb-4 bg-white border-none shadow-sm">
                <CardHeader className="pb-2">
                  {" "}
                  <CardTitle className="text-base">Thông số</CardTitle>{" "}
                </CardHeader>
                <CardContent className="text-sm text-gray-700 grid grid-cols-1 gap-x-4 gap-y-3">
                  {product.specifications?.material && (
                    <div>
                      <strong>Chất liệu:</strong>{" "}
                      {product.specifications.material}
                    </div>
                  )}
                  {product.specifications?.size && (
                    <div>
                      <strong>Kích thước:</strong> {product.specifications.size}
                    </div>
                  )}
                  {product.specifications?.color && (
                    <div>
                      <strong>In ấn:</strong> {product.specifications.color}
                    </div>
                  )}
                  {product.productionTime && (
                    <div>
                      <strong>Thời gian SX:</strong>{" "}
                      {product.productionTime.min}-{product.productionTime.max}{" "}
                      ngày
                    </div>
                  )}
                  <div className="mb-4 space-y-3">
                    {/* Ghi chú tùy chỉnh */}
                    <div>
                      <Label htmlFor="customNotes" className="font-medium">
                        Ghi chú cho nhà in
                      </Label>
                      <Textarea
                        id="customNotes"
                        placeholder="VD: In cho tôi 2 mặt, cán màng mờ..."
                        value={customization.notes}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    {/* Upload file (Phiên bản đơn giản) */}
                    <div>
                      <Label htmlFor="fileUpload" className="font-medium">
                        Tải lên file thiết kế
                      </Label>
                      <Input
                        id="fileUpload"
                        type="file"
                        className="mt-1"
                        // Tạm thời: Bạn sẽ cần một logic xử lý upload file
                        // và gán URL vào customization.fileUrl
                        disabled // Tạm vô hiệu hóa cho đến khi có logic upload
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        (Chức năng upload file sẽ được phát triển sau)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity Selector */}
              <div className="mb-5">
                {/* KHẮC PHỤC: Sử dụng Label đã import */}
                <Label htmlFor="quantity" className="mb-2 block font-medium">
                  Số lượng
                </Label>
                {/* KHẮC PHỤC: Sử dụng Input đã import */}
                <Input
                  id="quantity"
                  type="number"
                  min={product.pricing[0]?.minQuantity || 1}
                  value={selectedQuantity}
                  // KHẮC PHỤC: Thêm kiểu React.ChangeEvent<HTMLInputElement> cho 'e'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedQuantity(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-28"
                />
                {selectedQuantity < (product.pricing[0]?.minQuantity || 1) && (
                  <p className="text-xs text-red-500 mt-1">
                    Số lượng tối thiểu: {product.pricing[0]?.minQuantity || 1}
                  </p>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full mb-6"
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  inCart ||
                  selectedQuantity < (product.pricing[0]?.minQuantity || 1)
                }
              >
                <ShoppingCart size={20} className="mr-2" />
                {isAddingToCart
                  ? "Đang thêm..."
                  : inCart
                  ? "Đã có trong giỏ"
                  : "Thêm vào giỏ hàng"}
              </Button>

              {/* Printer Info */}
              {product.printerInfo && (
                <Card className="bg-white border-none shadow-sm">
                  <CardHeader>
                    {" "}
                    <CardTitle className="text-base flex items-center gap-2">
                      {" "}
                      <User size={18} /> Cung cấp bởi{" "}
                    </CardTitle>{" "}
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">
                      {product.printerInfo.businessName}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
                      {" "}
                      <Star size={16} fill="currentColor" />{" "}
                      <span>
                        {product.printerInfo.rating?.toFixed(1) ?? "Chưa có"} (
                        {product.printerInfo.totalReviews ?? 0} đánh giá)
                      </span>{" "}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      {" "}
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />{" "}
                      <span>
                        {" "}
                        {product.printerInfo.shopAddress?.street},{" "}
                        {product.printerInfo.shopAddress?.district},{" "}
                        {product.printerInfo.shopAddress?.city}{" "}
                      </span>{" "}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
