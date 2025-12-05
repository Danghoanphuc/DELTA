// src/features/company-store/pages/CompanyStorePage.tsx
// ✅ Public Company Store Page (SwagUp-style)

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Store,
  ShoppingBag,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Lock,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  companyStoreService,
  CompanyStore,
  StoreProduct,
} from "../services/company-store.service";

interface CartItem {
  product: StoreProduct;
  quantity: number;
  selectedSize?: string;
}

export default function CompanyStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<CompanyStore | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Password protection
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      loadStore();
    }
  }, [slug]);

  const loadStore = async (pwd?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyStoreService.getPublicStore(slug!, pwd);
      setStore(data);
      setNeedsPassword(false);
    } catch (err: any) {
      if (
        err.message?.includes("quyền truy cập") ||
        err.response?.status === 403
      ) {
        setNeedsPassword(true);
        if (pwd) {
          setPasswordError("Mật khẩu không đúng");
        }
      } else {
        setError(err.message || "Không thể tải store");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }
    setPasswordError("");
    loadStore(password);
  };

  const filteredProducts = store?.products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // Category filter would need product-category mapping
    return matchesSearch;
  });

  const addToCart = () => {
    if (!selectedProduct) return;

    const existingIndex = cart.findIndex(
      (item) =>
        item.product.id === selectedProduct.id &&
        item.selectedSize === selectedSize
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product: selectedProduct,
          quantity,
          selectedSize: selectedSize || undefined,
        },
      ]);
    }

    setSelectedProduct(null);
    setSelectedSize("");
    setQuantity(1);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = newQty;
    setCart(newCart);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Đang tải store...</p>
        </div>
      </div>
    );
  }

  // Password protection screen
  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Store được bảo vệ</h2>
            <p className="text-gray-600 mb-6">
              Vui lòng nhập mật khẩu để truy cập store này
            </p>
            <div className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              <Button onClick={handlePasswordSubmit} className="w-full">
                Truy cập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không thể truy cập</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: store.branding.fontFamily }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: store.branding.headerBgColor || "#ffffff",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {store.branding.logoUrl ? (
                <img
                  src={store.branding.logoUrl}
                  alt={store.name}
                  className="h-10 object-contain"
                />
              ) : (
                <Store
                  className="w-8 h-8"
                  style={{ color: store.branding.primaryColor }}
                />
              )}
              <div>
                <h1 className="font-bold text-lg">{store.name}</h1>
                {store.tagline && (
                  <p className="text-sm text-gray-500">{store.tagline}</p>
                )}
              </div>
            </div>

            {/* Cart Button */}
            <Button
              variant="outline"
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                  style={{ backgroundColor: store.branding.primaryColor }}
                >
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {store.branding.heroImageUrl && (
        <div
          className="h-48 md:h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${store.branding.heroImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              {store.branding.heroTitle && (
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {store.branding.heroTitle}
                </h2>
              )}
              {store.branding.heroSubtitle && (
                <p className="text-lg opacity-90">
                  {store.branding.heroSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10"
            />
          </div>

          {store.categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </Button>
              {store.categories.map((cat) => (
                <Button
                  key={cat.slug}
                  variant={
                    selectedCategory === cat.slug ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts?.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedProduct(product);
                setSelectedSize(product.availableSizes?.[0] || "");
                setQuantity(1);
              }}
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Hết hàng</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-2 mb-2">
                  {product.name}
                </h3>
                {store.settings.showPrices && product.price !== null && (
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold"
                      style={{ color: store.branding.primaryColor }}
                    >
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.compareAtPrice.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy sản phẩm</p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                )}

                {selectedProduct.description && (
                  <p className="text-gray-600">{selectedProduct.description}</p>
                )}

                {store.settings.showPrices &&
                  selectedProduct.price !== null && (
                    <div className="text-2xl font-bold">
                      {selectedProduct.price.toLocaleString("vi-VN")}đ
                    </div>
                  )}

                {/* Size Selection */}
                {selectedProduct.allowSizeSelection &&
                  selectedProduct.availableSizes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Chọn size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.availableSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              selectedSize === size
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Số lượng
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedProduct.maxPerOrder, quantity + 1)
                        )
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {selectedProduct.maxPerOrder && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tối đa {selectedProduct.maxPerOrder} sản phẩm/đơn
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  style={{ backgroundColor: store.branding.primaryColor }}
                  onClick={addToCart}
                  disabled={!selectedProduct.inStock}
                >
                  {selectedProduct.inStock ? "Thêm vào giỏ" : "Hết hàng"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Drawer */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Giỏ hàng ({cartItemCount})
            </DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    {item.selectedSize && (
                      <p className="text-xs text-gray-500">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(idx, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded border flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(idx, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded border flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-red-500 text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  {store.settings.showPrices && item.product.price && (
                    <div className="text-sm font-medium">
                      {(item.product.price * item.quantity).toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </div>
                  )}
                </div>
              ))}

              {store.settings.showPrices && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{cartTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                style={{ backgroundColor: store.branding.primaryColor }}
              >
                Đặt hàng
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Powered by{" "}
            <a
              href="https://printz.vn"
              className="text-primary hover:underline"
            >
              Printz
            </a>
          </p>
          {store.organization.name && (
            <p className="mt-1">© {store.organization.name}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
