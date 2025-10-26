// frontend/src/pages/customer/CheckoutPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Package } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: user?.displayName || "",
    phone: user?.phone || "",
    street: "",
    ward: "",
    district: "",
    city: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );
  const [customerNotes, setCustomerNotes] = useState("");

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống!");
      navigate("/shop");
    }
  }, [cart, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shippingFee = 30000; // Tạm thời cố định
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!shippingAddress.recipientName || !shippingAddress.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin người nhận");
      return;
    }

    if (
      !shippingAddress.street ||
      !shippingAddress.district ||
      !shippingAddress.city
    ) {
      toast.error("Vui lòng điền đầy đủ địa chỉ giao hàng");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cart!.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.selectedPrice?.pricePerUnit || 0,
          customization: item.customization,
        })),
        shippingAddress,
        paymentMethod,
        customerNotes,
      };

      const res = await api.post("/orders/create", orderData);

      toast.success("Đặt hàng thành công! 🎉");

      // Clear cart
      await clearCart();

      // Redirect to order detail
      navigate(`/orders/${res.data.order._id}`);
    } catch (err: any) {
      console.error("❌ Checkout Error:", err);
      const msg =
        err.response?.data?.message || "Không thể đặt hàng, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/shop")}
              className="mb-4"
            >
              <ArrowLeft size={18} className="mr-2" />
              Quay lại mua sắm
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Thanh toán
            </h1>
            <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin size={20} className="text-blue-600" />
                      Địa chỉ giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipientName">Người nhận *</Label>
                        <Input
                          id="recipientName"
                          value={shippingAddress.recipientName}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              recipientName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              phone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="street">Địa chỉ *</Label>
                      <Input
                        id="street"
                        placeholder="Số nhà, tên đường"
                        value={shippingAddress.street}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            street: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ward">Phường/Xã</Label>
                        <Input
                          id="ward"
                          value={shippingAddress.ward}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              ward: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          value={shippingAddress.district}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              district: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              city: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Ghi chú địa chỉ</Label>
                      <Textarea
                        id="notes"
                        placeholder="VD: Gần chợ, cạnh trường học..."
                        value={shippingAddress.notes}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      Phương thức thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v: any) => setPaymentMethod(v)}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          Thanh toán khi nhận hàng (COD)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label
                          htmlFor="transfer"
                          className="flex-1 cursor-pointer"
                        >
                          Chuyển khoản ngân hàng
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Customer Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package size={20} className="text-blue-600" />
                      Ghi chú đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Ghi chú cho nhà in (VD: In gấp, yêu cầu đặc biệt...)"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Đơn hàng của bạn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.items.map((item) => (
                        <div key={item._id} className="flex gap-3 text-sm">
                          <img
                            src={
                              item.product?.images?.[0]?.url ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium line-clamp-2">
                              {item.product?.name}
                            </p>
                            <p className="text-gray-500">
                              {item.quantity} x{" "}
                              {formatPrice(
                                item.selectedPrice?.pricePerUnit || 0
                              )}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Phí vận chuyển:</span>
                        <span>{formatPrice(shippingFee)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của
                      PrintZ
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
