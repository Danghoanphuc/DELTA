// apps/customer-frontend/src/features/customer/pages/CheckoutPage.tsx (ĐÃ VÁ)
import React, { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Components
import { PaymentForm } from "../components/PaymentForm";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
// Form components không cần thiết cho RadioGroup vì đã thay bằng div/label
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/shared/components/ui/form";
// import { Input } from "@/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";

// ✅ SỬA LỖI TS2613: Đổi từ default import sang named import
import { OrderSummaryCard } from "@/features/shop/components/OrderSummaryCard";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCheckout } from "../hooks/useCheckout";
import { CreditCard, Truck } from "lucide-react";
import { AddressForm } from "../components/AddressForm";
import { addressSchema } from "../components/addressSchema";
import { Loader2 } from "lucide-react";
import { config } from "@/config/env.config";
import { vnpayCreatePayment } from "@/services/vnpayService";

// Schema
const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["stripe", "vnpay", "cod"]),
  billingSameAsShipping: z.boolean(),
  billingAddress: addressSchema.optional(),
});
type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ✅ SỬA LỖI: Chỉ load Stripe khi có publishable key hợp lệ
const stripePromise = config.stripePublicKey
  ? loadStripe(config.stripePublicKey)
  : null;

const CheckoutPage = () => {
  // ✅ SỬA LỖI INFINITE LOOP: Tách selectors để tránh tạo object mới mỗi lần render
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // ✅ SỬA LỖI INFINITE LOOP: Tách selectors riêng biệt
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const isCheckoutValidating = useCartStore((state) => state.isCheckoutValidating);
  const validateCheckout = useCartStore((state) => state.validateCheckout);

  // State cho Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [masterOrderId, setMasterOrderId] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // Hook checkout
  const { createOrderAndPaymentIntent, isProcessing } = useCheckout();

  // Form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange", // Validate real-time để tự động hiển thị phần phương thức thanh toán
    defaultValues: {
      shippingAddress: {
        fullName: user?.displayName || "",
        phone: user?.phone || "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Việt Nam",
      },
      billingSameAsShipping: true,
      paymentMethod: "stripe",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const isFormValid = form.formState.isValid;
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  
  // Tự động hiển thị phần phương thức thanh toán khi form valid
  useEffect(() => {
    if (isFormValid && !showPaymentMethods) {
      setShowPaymentMethods(true);
    }
  }, [isFormValid, showPaymentMethods]);

  // Xử lý khi đổi phương thức thanh toán
  const onPaymentMethodChange = async (value: "stripe" | "vnpay" | "cod") => {
    // ✅ Luôn cập nhật form value trước
    form.setValue("paymentMethod", value);
    
    if (value === "stripe") {
      // ✅ Kiểm tra Stripe key trước khi khởi tạo
      if (!config.stripePublicKey) {
        toast.error("Stripe chưa được cấu hình. Vui lòng chọn phương thức thanh toán khác.");
        form.setValue("paymentMethod", "vnpay");
        return;
      }
      if (!cart || cart.items.length === 0) {
        toast.error("Vui lòng thêm sản phẩm vào giỏ hàng trước.");
        form.setValue("paymentMethod", "vnpay"); // Reset
        return;
      }
      setIsStripeLoading(true);
      try {
        const { clientSecret, masterOrderId } =
          await createOrderAndPaymentIntent(cart._id);
        setClientSecret(clientSecret);
        setMasterOrderId(masterOrderId);
      } catch (error: any) {
        toast.error("Không thể khởi tạo thanh toán Stripe", {
          description: error.message,
        });
        form.setValue("paymentMethod", "vnpay"); // Reset
      } finally {
        setIsStripeLoading(false);
      }
    } else {
      // ✅ Xóa Stripe state khi chọn phương thức khác
      setClientSecret(null);
      setMasterOrderId(null);
    }
  };

  // Xử lý submit
  const onAddressSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
    const isValid = await validateCheckout();
    if (!isValid) {
      toast.error(
        "Giỏ hàng không hợp lệ. Vui lòng kiểm tra lại giỏ hàng của bạn."
      );
      return;
    }

    try {
      // ✅ Map dữ liệu từ form sang format backend expect
      const mappedShippingAddress = {
        recipientName: data.shippingAddress.fullName?.trim() || "", // fullName -> recipientName
        phone: data.shippingAddress.phone?.trim() || "",
        street: data.shippingAddress.street?.trim() || "",
        district: data.shippingAddress.state?.trim() || "", // state -> district
        city: data.shippingAddress.city?.trim() || "",
        ward: data.shippingAddress.postalCode?.trim() || "", // Optional
        notes: "", // Optional
      };

      // ✅ Debug: Log dữ liệu trước khi gửi
      console.log("[CheckoutPage] Dữ liệu form gốc:", data.shippingAddress);
      console.log("[CheckoutPage] Dữ liệu đã map:", mappedShippingAddress);

      // ✅ Validate dữ liệu trước khi gửi
      if (!mappedShippingAddress.recipientName || !mappedShippingAddress.district) {
        console.error("[CheckoutPage] Validation failed:", {
          recipientName: mappedShippingAddress.recipientName,
          district: mappedShippingAddress.district,
          originalData: data.shippingAddress,
        });
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng (Họ tên và Quận/Huyện)");
        return;
      }

      if (data.paymentMethod === "vnpay") {
        // ✅ Backend tự động lấy cart từ user, không cần truyền cartId
        const { paymentUrl } = await vnpayCreatePayment(
          cart!._id, // Giữ lại để tương thích với interface, nhưng backend không dùng
          mappedShippingAddress
        );
        toast.info("Đang điều hướng đến cổng thanh toán VNPay...");
        window.location.href = paymentUrl;
      } else if (data.paymentMethod === "stripe") {
        toast.info(
          "Vui lòng hoàn tất thông tin thẻ thanh toán (Stripe) bên dưới."
        );
      } else {
        toast.success("Đã đặt hàng COD (Chức năng đang phát triển)");
      }
    } catch (error: any) {
      toast.error("Đặt hàng thất bại", { description: error.message });
    }
  };

  // ✅ SỬA LỖI TS2339: Lấy 'items' và 'totalAmount' từ 'cart' object
  const cartItems = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <Truck className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="mt-2 text-gray-600">
          Hãy thêm sản phẩm vào giỏ trước khi thanh toán.
        </p>
      </div>
    );
  }

  const stripeOptions: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance: { theme: "stripe" } }
    : undefined;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Thanh toán</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* === CỘT TRÁI: FORM ĐỊA CHỈ VÀ THANH TOÁN === */}
        <div className="lg:col-span-2">
          <FormProvider {...form}>
            <form
              id="checkout-address-form"
              onSubmit={form.handleSubmit(onAddressSubmit)}
              className="space-y-6"
            >
              <AddressForm />
              
              {/* Nút tiếp tục để hiển thị phương thức thanh toán */}
              {!showPaymentMethods && (
                <Button
                  type="button"
                  onClick={() => {
                    form.trigger().then((isValid) => {
                      if (isValid) {
                        setShowPaymentMethods(true);
                      } else {
                        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng");
                      }
                    });
                  }}
                  className="w-full text-lg"
                  size="lg"
                >
                  Tiếp tục đến phương thức thanh toán
                </Button>
              )}
            </form>

            {/* ✅ SỬA LỖI: Di chuyển Card vào trong FormProvider để FormItem/FormControl có thể truy cập form context */}
            {/* Luôn hiển thị phần chọn phương thức thanh toán khi đã điền đủ thông tin */}
            {showPaymentMethods && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => {
                    onPaymentMethodChange(val as "stripe" | "vnpay" | "cod");
                  }}
                  className="space-y-4"
                >
                  {/* (Radio VNPay) */}
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onPaymentMethodChange("vnpay")}
                  >
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <label
                      htmlFor="vnpay"
                      className="flex-1 cursor-pointer font-normal text-sm"
                    >
                      Thanh toán qua VNPay (ATM/Visa/Master)
                    </label>
                  </div>
                  
                  {/* (Radio COD) */}
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onPaymentMethodChange("cod")}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <label
                      htmlFor="cod"
                      className="flex-1 cursor-pointer font-normal text-sm"
                    >
                      Thanh toán khi nhận hàng (COD)
                    </label>
                  </div>
                  
                  {/* (Radio Stripe) */}
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (!isStripeLoading) {
                        onPaymentMethodChange("stripe");
                      }
                    }}
                  >
                    <RadioGroupItem
                      value="stripe"
                      id="stripe"
                      disabled={isStripeLoading}
                    />
                    <label
                      htmlFor="stripe"
                      className="flex-1 cursor-pointer font-normal text-sm flex items-center gap-3"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Thanh toán bằng Thẻ Quốc tế (Visa, Master)</span>
                      {isStripeLoading && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          Đang tải form...
                        </span>
                      )}
                    </label>
                  </div>
                </RadioGroup>

                {/* --- Step 3: Hiển thị Form Stripe --- */}
                {clientSecret && stripeOptions && stripePromise && (
                  <div className="mt-6">
                    <Elements options={stripeOptions} stripe={stripePromise}>
                      {/* ✅ SỬA LỖI TS2741: Thêm prop 'clientUrl' */}
                      <PaymentForm
                        masterOrderId={masterOrderId!}
                        clientUrl={window.location.origin}
                      />
                    </Elements>
                  </div>
                )}

                {/* Nút submit cho VNPay và COD */}
                {paymentMethod !== "stripe" && (
                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={() => {
                        form.handleSubmit(onAddressSubmit)();
                      }}
                      disabled={isProcessing || isCheckoutValidating}
                      className="w-full text-lg"
                      size="lg"
                    >
                      {isProcessing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {paymentMethod === "vnpay"
                        ? "Tiến hành thanh toán VNPay"
                        : "Hoàn tất đơn hàng (COD)"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </FormProvider>
        </div>

        {/* === CỘT PHẢI: TÓM TẮT ĐƠN HÀNG === */}
        <div className="lg:col-span-1">
          <OrderSummaryCard cart={cart || undefined} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
