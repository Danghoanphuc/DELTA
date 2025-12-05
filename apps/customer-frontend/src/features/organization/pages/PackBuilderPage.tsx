// src/features/organization/pages/PackBuilderPage.tsx
// ✅ Pack Builder - Tạo/Chỉnh sửa Swag Pack với Product Catalog

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Search,
  Save,
  ArrowLeft,
  Loader2,
  Gift,
  Image,
  Settings,
  Eye,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { toast } from "@/shared/utils/toast";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import api from "@/shared/lib/axios";

interface Product {
  _id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  basePrice: number;
  category?: string;
}

interface PackItem {
  product: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  customization?: {
    logoPlacement?: string;
    personalized?: boolean;
  };
  sizeOptions?: {
    enabled: boolean;
    allowRecipientChoice: boolean;
  };
}

interface SwagPack {
  _id?: string;
  name: string;
  description: string;
  type: string;
  items: PackItem[];
  packaging: {
    boxType: string;
    includeCard: boolean;
    cardMessage: string;
  };
  branding: {
    includeLogo: boolean;
    includeThankYouCard: boolean;
    thankYouMessage: string;
  };
  pricing?: {
    itemsTotal: number;
    packagingFee: number;
    brandingFee: number;
    kittingFee: number;
    subtotal: number;
    unitPrice: number;
  };
}

const PACK_TYPES = [
  { value: "welcome_kit", label: "Welcome Kit" },
  { value: "event_swag", label: "Event Swag" },
  { value: "client_gift", label: "Client Gift" },
  { value: "holiday_gift", label: "Holiday Gift" },
  { value: "custom", label: "Custom" },
];

const BOX_TYPES = [
  { value: "standard", label: "Hộp tiêu chuẩn", price: 15000 },
  { value: "premium", label: "Hộp cao cấp", price: 35000 },
  { value: "eco", label: "Hộp thân thiện môi trường", price: 20000 },
];

export function PackBuilderPage({
  packId,
  onBack,
}: {
  packId?: string;
  onBack: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);

  // Pack state
  const [pack, setPack] = useState<SwagPack>({
    name: "",
    description: "",
    type: "custom",
    items: [],
    packaging: {
      boxType: "standard",
      includeCard: false,
      cardMessage: "",
    },
    branding: {
      includeLogo: true,
      includeThankYouCard: false,
      thankYouMessage: "",
    },
  });

  // Fetch existing pack if editing
  useEffect(() => {
    if (packId) {
      const fetchPack = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/swag-packs/${packId}`);
          const existingPack = res.data?.data?.pack;
          if (existingPack) {
            setPack({
              _id: existingPack._id,
              name: existingPack.name || "",
              description: existingPack.description || "",
              type: existingPack.type || "custom",
              items: existingPack.items || [],
              packaging: existingPack.packaging || {
                boxType: "standard",
                includeCard: false,
                cardMessage: "",
              },
              branding: existingPack.branding || {
                includeLogo: true,
                includeThankYouCard: false,
                thankYouMessage: "",
              },
              pricing: existingPack.pricing,
            });
          }
        } catch (error) {
          toast.error("Không thể tải thông tin bộ quà");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPack();
    }
  }, [packId]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (productSearch) params.append("search", productSearch);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data?.data?.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [productSearch]);

  useEffect(() => {
    if (showProductModal) {
      fetchProducts();
    }
  }, [showProductModal, fetchProducts]);

  // Add product to pack
  const addProduct = (product: Product) => {
    const existingIndex = pack.items.findIndex(
      (item) => item.product === product._id
    );

    if (existingIndex >= 0) {
      // Increase quantity
      const newItems = [...pack.items];
      newItems[existingIndex].quantity += 1;
      setPack({ ...pack, items: newItems });
    } else {
      // Add new item
      setPack({
        ...pack,
        items: [
          ...pack.items,
          {
            product: product._id,
            productName: product.name,
            productImage: product.thumbnailUrl,
            quantity: 1,
            unitPrice: product.basePrice,
            customization: { personalized: false },
            sizeOptions: { enabled: false, allowRecipientChoice: false },
          },
        ],
      });
    }
    toast.success(`Đã thêm ${product.name}`);
  };

  // Update item quantity
  const updateItemQuantity = (index: number, delta: number) => {
    const newItems = [...pack.items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setPack({ ...pack, items: newItems });
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = pack.items.filter((_, i) => i !== index);
    setPack({ ...pack, items: newItems });
  };

  // Toggle item options
  const toggleItemOption = (
    index: number,
    option: "personalized" | "sizeEnabled"
  ) => {
    const newItems = [...pack.items];
    if (option === "personalized") {
      newItems[index].customization = {
        ...newItems[index].customization,
        personalized: !newItems[index].customization?.personalized,
      };
    } else {
      newItems[index].sizeOptions = {
        ...newItems[index].sizeOptions,
        enabled: !newItems[index].sizeOptions?.enabled,
        allowRecipientChoice: true,
      };
    }
    setPack({ ...pack, items: newItems });
  };

  // Calculate pricing
  const calculatePricing = () => {
    const itemsTotal = pack.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const packagingFee =
      BOX_TYPES.find((b) => b.value === pack.packaging.boxType)?.price || 15000;
    let brandingFee = 0;
    if (pack.branding.includeLogo) brandingFee += 10000;
    if (pack.branding.includeThankYouCard) brandingFee += 5000;
    const kittingFee = pack.items.length * 5000;
    const subtotal = itemsTotal + packagingFee + brandingFee + kittingFee;

    return {
      itemsTotal,
      packagingFee,
      brandingFee,
      kittingFee,
      subtotal,
      unitPrice: subtotal,
    };
  };

  const pricing = calculatePricing();

  // Save pack
  const handleSave = async () => {
    if (!pack.name) {
      toast.error("Vui lòng nhập tên bộ quà");
      return;
    }
    if (pack.items.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    setIsSaving(true);
    try {
      if (pack._id) {
        await api.put(`/swag-packs/${pack._id}`, {
          name: pack.name,
          description: pack.description,
          type: pack.type,
          items: pack.items,
          packaging: pack.packaging,
          branding: pack.branding,
        });
        toast.success("Đã cập nhật bộ quà!");
      } else {
        await api.post("/swag-packs", {
          name: pack.name,
          description: pack.description,
          type: pack.type,
          items: pack.items,
          packaging: pack.packaging,
          branding: pack.branding,
        });
        toast.success("Đã tạo bộ quà!");
      }
      onBack();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {pack._id ? "Chỉnh sửa bộ quà" : "Tạo bộ quà mới"}
              </h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu bộ quà
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pack Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tên bộ quà *</Label>
                  <Input
                    value={pack.name}
                    onChange={(e) => setPack({ ...pack, name: e.target.value })}
                    placeholder="VD: Welcome Kit 2024"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loại</Label>
                    <Select
                      value={pack.type}
                      onValueChange={(value) =>
                        setPack({ ...pack, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Loại hộp</Label>
                    <Select
                      value={pack.packaging.boxType}
                      onValueChange={(value) =>
                        setPack({
                          ...pack,
                          packaging: { ...pack.packaging, boxType: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BOX_TYPES.map((box) => (
                          <SelectItem key={box.value} value={box.value}>
                            {box.label} (+{formatCurrency(box.price)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea
                    value={pack.description}
                    onChange={(e) =>
                      setPack({ ...pack, description: e.target.value })
                    }
                    placeholder="Mô tả ngắn về bộ quà..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sản phẩm trong bộ ({pack.items.length})</CardTitle>
                <Button onClick={() => setShowProductModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </CardHeader>
              <CardContent>
                {pack.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có sản phẩm nào</p>
                    <Button
                      variant="link"
                      onClick={() => setShowProductModal(true)}
                    >
                      Thêm sản phẩm đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pack.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.unitPrice)}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {item.customization?.personalized && (
                              <Badge variant="secondary" className="text-xs">
                                In tên
                              </Badge>
                            )}
                            {item.sizeOptions?.enabled && (
                              <Badge variant="secondary" className="text-xs">
                                Chọn size
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateItemQuantity(index, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateItemQuantity(index, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant={
                              item.customization?.personalized
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              toggleItemOption(index, "personalized")
                            }
                            title="In tên cá nhân"
                          >
                            A
                          </Button>
                          <Button
                            variant={
                              item.sizeOptions?.enabled ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              toggleItemOption(index, "sizeEnabled")
                            }
                            title="Cho phép chọn size"
                          >
                            S
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branding Options */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Tùy chọn thương hiệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>In logo công ty</Label>
                    <p className="text-sm text-gray-500">
                      In logo lên sản phẩm (+10,000đ)
                    </p>
                  </div>
                  <Switch
                    checked={pack.branding.includeLogo}
                    onCheckedChange={(checked) =>
                      setPack({
                        ...pack,
                        branding: { ...pack.branding, includeLogo: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Thiệp cảm ơn</Label>
                    <p className="text-sm text-gray-500">
                      Kèm thiệp cảm ơn (+5,000đ)
                    </p>
                  </div>
                  <Switch
                    checked={pack.branding.includeThankYouCard}
                    onCheckedChange={(checked) =>
                      setPack({
                        ...pack,
                        branding: {
                          ...pack.branding,
                          includeThankYouCard: checked,
                        },
                      })
                    }
                  />
                </div>
                {pack.branding.includeThankYouCard && (
                  <div>
                    <Label>Nội dung thiệp</Label>
                    <Textarea
                      value={pack.branding.thankYouMessage}
                      onChange={(e) =>
                        setPack({
                          ...pack,
                          branding: {
                            ...pack.branding,
                            thankYouMessage: e.target.value,
                          },
                        })
                      }
                      placeholder="Cảm ơn bạn đã là một phần của team..."
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Pricing */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Xem trước
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center mb-4">
                  {pack.items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {pack.items.slice(0, 4).map((item, i) => (
                        <div
                          key={i}
                          className="w-16 h-16 bg-white rounded-lg shadow flex items-center justify-center overflow-hidden"
                        >
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Gift className="w-16 h-16 text-orange-300" />
                  )}
                </div>
                <h3 className="font-semibold text-center">
                  {pack.name || "Tên bộ quà"}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {pack.items.length} sản phẩm
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Chi phí</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sản phẩm</span>
                  <span>{formatCurrency(pricing.itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hộp đóng gói</span>
                  <span>{formatCurrency(pricing.packagingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thương hiệu</span>
                  <span>{formatCurrency(pricing.brandingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí đóng gói</span>
                  <span>{formatCurrency(pricing.kittingFee)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Giá mỗi bộ</span>
                  <span className="text-orange-600">
                    {formatCurrency(pricing.unitPrice)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm sản phẩm..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {products.map((product) => {
              const isAdded = pack.items.some(
                (item) => item.product === product._id
              );
              return (
                <button
                  key={product._id}
                  onClick={() => addProduct(product)}
                  className={`p-3 border rounded-lg text-left hover:border-orange-300 transition-all ${
                    isAdded ? "border-orange-500 bg-orange-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt=""
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-orange-600">
                        {formatCurrency(product.basePrice)}
                      </p>
                    </div>
                    {isAdded && <Check className="w-5 h-5 text-orange-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PackBuilderPage;
