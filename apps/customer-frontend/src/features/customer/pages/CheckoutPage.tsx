// apps/customer-frontend/src/features/customer/pages/CheckoutPage.tsx (ĐÃ VÁ)
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/shared/lib/axios"; // ✅ Use configured axios instance with auth interceptor

// Components
import { PaymentForm } from "../components/PaymentForm";
import { CheckoutLoadingOverlay } from "../components/CheckoutLoadingOverlay";
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
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";

// ✅ Sử dụng hook
import { OrderSummaryCard } from "@/features/shop/components/OrderSummaryCard";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCheckout } from "../hooks/useCheckout";
import { CreditCard, Truck } from "lucide-react";
import { AddressForm } from "../components/AddressForm";
import { Loader } from "lucide-react";
import { config } from "@/config/env.config";
import { checkoutService } from "@/services/checkoutService";

// Schema
const checkoutSchema = z.object({
  shippingAddress: z.any(), // will be validated by zod schema elsewhere
  paymentMethod: z.enum(["stripe", "momo", "cod", "payos"]),
  billingSameAs: z.boolean().optional(),
  billingAddress: z.any().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const stripePromise = config.stripePublicKey ? loadStripe(config.stripePublicKey) : null;

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
  
  // State cho loading overlay
  const [loadingState, setLoadingState] = useState<{
    isVisible: boolean;
    message: string;
    submessage?: string;
  }>({
    isVisible: false,
    message: '',
  });

  // Hook checkout
  const { createOrderAndPaymentIntent, processCheckout, isProcessing } = useCheckout();

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
        district: "", // ✅ Updated: district thay vì state
        ward: "", // ✅ Updated: ward thay vì postalCode
        country: "Việt Nam",
      },
      billingSameAs: true,
      paymentMethod: "momo",
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
  const onPaymentMethodChange = async (value: "stripe" | "momo" | "cod" | "payos") => {
    // ✅ Luôn cập nhật form value trước
    form.setValue("paymentMethod", value);
    
    if (value === "stripe") {
      // ✅ Kiểm tra Stripe key trước khi khởi tạo
      if (!config.stripePublicKey) {
        toast.error("Stripe chưa được cấu hình. Vui lòng chọn phương thức thanh toán khác.");
        form.setValue("paymentMethod", "momo");
        return;
      }
      if (!cart || !cart.items.length) {
        toast.error("Vui lòng thêm sản phẩm vào giỏ hàng trước.");
        form.setValue("paymentMethod", "momo"); // Reset
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
        form.setValue("paymentMethod", "momo"); // Reset
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
        district: data.shippingAddress.district?.trim() || "", // ✅ Updated: district field
        city: data.shippingAddress.city?.trim() || "",
        ward: data.shippingAddress.ward?.trim() || "", // ✅ Updated: ward field
        notes: "", // Optional
      };

      // ✅ Debug: Log dữ liệu trước khi gửi
      console.log("[CheckoutPage] Dữ liệu form gốc:", data.shippingAddress);
      console.log("[CheckoutPage] Dữ liệu đã map:", mappedShippingAddress);

      // ✅ Validate dữ liệu trước khi gửi
      if (!mappedShippingAddress.recipientName || !mappedShippingAddress.district || !mappedShippingAddress.ward) {
        console.error("[CheckoutPage] Validation failed:", {
          recipientName: mappedShippingAddress.recipientName,
          district: mappedShippingAddress.district,
          ward: mappedShippingAddress.ward,
          originalData: data.shippingAddress,
        });
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng");
        return;
      }

      if (data.paymentMethod === "momo") {
        // ✅ Backend tự động lấy cart từ user, không cần truyền cartId
        setLoadingState({
          isVisible: true,
          message: 'Đang tạo link thanh toán MoMo...',
          submessage: 'Vui lòng chờ trong giây lát',
        });
        
        const { paymentUrl } = await checkoutService.createMomoUrl({
          shippingAddress: mappedShippingAddress,
        });
        
        console.log("[MoMo] paymentUrl:", paymentUrl, "length=", paymentUrl?.length);
        
        setLoadingState({
          isVisible: true,
          message: 'Đang chuyển đến trang thanh toán...',
          submessage: 'Bạn sẽ được chuyển hướng trong giây lát',
        });
        
        // Mở MoMo ở tab mới
        window.open(paymentUrl, "_blank", "noopener");
        
        // Ẩn loading sau 2 giây
        setTimeout(() => {
          setLoadingState({ isVisible: false, message: '' });
        }, 2000);
        
      } else if (data.paymentMethod === "payos") {
        // --- PAYOS INTEGRATION ---
        try {
          setLoadingState({
            isVisible: true,
            message: 'Đang tạo đơn hàng...',
            submessage: 'Vui lòng chờ trong giây lát',
          });
          
          const response = await api.post('/payos/create-payment', {
            shippingAddress: mappedShippingAddress,
          });
          
          if (response.data && response.data.checkoutUrl) {
            setLoadingState({
              isVisible: true,
              message: 'Đang chuyển đến trang thanh toán...',
              submessage: 'Bạn sẽ được chuyển hướng ngay bây giờ',
            });
            
            // Redirect to PayOS checkout page
            setTimeout(() => {
              window.location.href = response.data.checkoutUrl;
            }, 500);
          } else {
            setLoadingState({ isVisible: false, message: '' });
            toast.error("Không nhận được link thanh toán từ PayOS");
          }
        } catch (err: any) {
          console.error("PayOS Error:", err);
          setLoadingState({ isVisible: false, message: '' });
          toast.error(err.response?.data?.error || "Lỗi khi tạo thanh toán PayOS");
        }
      } else if (data.paymentMethod === "stripe") {
        toast.info(
          "Vui lòng hoàn tất thông tin thẻ thanh toán (Stripe) bên dưới."
        );
      } else {
        // ✅ COD flow - Use new unified processCheckout hook
        setLoadingState({
          isVisible: true,
          message: 'Đang tạo đơn hàng COD...',
          submessage: 'Vui lòng chờ trong giây lát',
        });
        
        await processCheckout({
          shippingAddress: mappedShippingAddress,
          paymentMethod: 'cod',
        });
        
        // processCheckout will handle navigation and cart clearing
        setLoadingState({ isVisible: false, message: '' });
      }
    } catch (error: any) {
      setLoadingState({ isVisible: false, message: '' });
      toast.error("Đặt hàng thất bại", { description: error.message });
    }
  };

  // ✅ SỬA LỖI TS2339: Lấy 'items' và 'totalAmount' từ 'cart' object
  const cartItems = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
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

  const stripeOptions = clientSecret
    ? { clientSecret, appearance: { theme: "stripe" as const } }
    : undefined;

  return (
    <>
      {/* Loading Overlay */}
      <CheckoutLoadingOverlay
        isVisible={loadingState.isVisible}
        message={loadingState.message}
        submessage={loadingState.submessage}
      />
      
      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Thanh toán</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* === CỘT TRÁI: FORM ĐỊA CHỈ VÀ THANH TOÁN (7/12) === */}
        <div className="lg:col-span-7">
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
                    onPaymentMethodChange(val as "stripe" | "momo" | "cod" | "payos");
                  }}
                  className="space-y-4"
                >
                  {/* (Radio VNPay) */}
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onPaymentMethodChange("momo")}
                  >
                    <RadioGroupItem value="momo" id="momo" />
                    <label
                      htmlFor="momo"
                      className="flex-1 cursor-pointer font-normal text-sm"
                    >
                      Thanh toán MoMo (QR/Thẻ nội địa)
                    </label>
                  </div>
                  
                  {/* (Radio PayOS) */}
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onPaymentMethodChange("payos")}
                  >
                    <RadioGroupItem value="payos" id="payos" />
                    <label
                      htmlFor="payos"
                      className="flex-1 cursor-pointer font-normal text-sm"
                    >
                      Thanh toán qua PayOS (QR Code)
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
                  <div className="mt-6 space-y-4">
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
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {paymentMethod === "momo"
                        ? "Thanh toán MoMo"
                        : paymentMethod === "payos"
                        ? "Thanh toán PayOS"
                        : "Hoàn tất đơn hàng (COD)"}
                    </Button>
                    
                    {/* Trust Signals */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Bảo mật SSL</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Hoàn tiền 100% nếu lỗi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Kiểm hàng trước khi nhận</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </FormProvider>
        </div>

        {/* === CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (5/12) - STICKY === */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-4">
            <OrderSummaryCard cart={cart || undefined} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CheckoutPage;
