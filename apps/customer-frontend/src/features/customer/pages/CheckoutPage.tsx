// apps/customer-frontend/src/features/customer/pages/CheckoutPage.tsx
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { customerProfileService } from "@/services/customerProfileService";

// Components
import { PaymentForm } from "../components/PaymentForm";
import { CheckoutLoadingOverlay } from "../components/CheckoutLoadingOverlay";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

import { OrderSummaryCard } from "@/features/shop/components/OrderSummaryCard";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCheckout } from "../hooks/useCheckout";
import { SmartAddressSelector } from "../components/AddressForm/SmartAddressSelector";
import { config } from "@/config/env.config";
import { checkoutService } from "@/services/checkoutService";

// Icons
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  Loader,
  Check,
  Zap,
  Truck,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// --- Schema Validation ---
const checkoutSchema = z.object({
  shippingAddress: z.any(),
  paymentMethod: z.enum(["stripe", "momo", "cod", "payos"]),
  billingSameAs: z.boolean().optional(),
  billingAddress: z.any().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Load Stripe
const stripePromise = config.stripePublicKey
  ? loadStripe(config.stripePublicKey)
  : null;

const CheckoutPage = () => {
  // --- Global State ---
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const isCheckoutValidating = useCartStore(
    (state) => state.isCheckoutValidating
  );
  const validateCheckout = useCartStore((state) => state.validateCheckout);

  // --- Local State ---
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [masterOrderId, setMasterOrderId] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // Loading Overlay State
  const [loadingState, setLoadingState] = useState<{
    isVisible: boolean;
    message: string;
    submessage?: string;
  }>({
    isVisible: false,
    message: "",
  });

  const { createOrderAndPaymentIntent, processCheckout, isProcessing } =
    useCheckout();

  // --- Form Setup ---
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      shippingAddress: {
        fullName: user?.displayName || "",
        phone: user?.phone || "",
        street: "",
        city: "",
        district: "",
        ward: "",
        country: "Việt Nam",
      },
      billingSameAs: true,
      paymentMethod: "momo",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // --- Load địa chỉ mặc định khi mount ---
  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const defaultAddress = await customerProfileService.getDefaultAddress();
        if (defaultAddress) {
          // Auto-fill form với địa chỉ mặc định
          form.setValue("shippingAddress", {
            fullName: defaultAddress.recipientName,
            phone: defaultAddress.phone,
            street: defaultAddress.street,
            ward: defaultAddress.ward,
            district: defaultAddress.district,
            city: defaultAddress.city,
            country: "Việt Nam",
          });
          toast.success("Đã tự động điền địa chỉ mặc định", {
            description: "Bạn có thể chỉnh sửa nếu cần",
          });
        }
      } catch (error) {
        // Không có địa chỉ mặc định hoặc lỗi - không làm gì
        console.log("No default address found or error loading:", error);
      }
    };

    loadDefaultAddress();
  }, [form]);

  // --- Handlers ---
  const onPaymentMethodChange = async (
    value: "stripe" | "momo" | "cod" | "payos"
  ) => {
    form.setValue("paymentMethod", value);

    if (value === "stripe") {
      if (!config.stripePublicKey) {
        toast.error("Stripe chưa được cấu hình.");
        form.setValue("paymentMethod", "momo");
        return;
      }
      if (!cart || !cart.items.length) {
        toast.error("Giỏ hàng trống.");
        form.setValue("paymentMethod", "momo");
        return;
      }
      setIsStripeLoading(true);
      try {
        const { clientSecret, masterOrderId } =
          await createOrderAndPaymentIntent(cart._id);
        setClientSecret(clientSecret);
        setMasterOrderId(masterOrderId);
      } catch (error: any) {
        toast.error("Lỗi khởi tạo Stripe", { description: error.message });
        form.setValue("paymentMethod", "momo");
      } finally {
        setIsStripeLoading(false);
      }
    } else {
      setClientSecret(null);
      setMasterOrderId(null);
    }
  };

  const onAddressSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
    const isValid = await validateCheckout();
    if (!isValid) {
      toast.error("Giỏ hàng không hợp lệ hoặc thay đổi giá.");
      return;
    }

    try {
      const mappedShippingAddress = {
        recipientName: data.shippingAddress.fullName?.trim() || "",
        phone: data.shippingAddress.phone?.trim() || "",
        street: data.shippingAddress.street?.trim() || "",
        district: data.shippingAddress.district?.trim() || "",
        city: data.shippingAddress.city?.trim() || "",
        ward: data.shippingAddress.ward?.trim() || "",
        coordinates: data.shippingAddress.coordinates,
        notes: "",
      };

      if (
        !mappedShippingAddress.recipientName ||
        !mappedShippingAddress.district ||
        !mappedShippingAddress.ward
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
        return;
      }

      if (data.paymentMethod === "momo") {
        setLoadingState({
          isVisible: true,
          message: "Kết nối ví MoMo...",
          submessage: "Đang tạo cổng thanh toán an toàn",
        });
        const { paymentUrl } = await checkoutService.createMomoUrl({
          shippingAddress: mappedShippingAddress,
        });
        window.location.href = paymentUrl;
      } else if (data.paymentMethod === "payos") {
        setLoadingState({
          isVisible: true,
          message: "Khởi tạo VietQR...",
          submessage: "Chuẩn bị mã QR chuyển khoản",
        });
        const response = await api.post("/payos/create-payment", {
          shippingAddress: mappedShippingAddress,
        });
        if (response.data?.checkoutUrl) {
          setTimeout(() => {
            window.location.href = response.data.checkoutUrl;
          }, 500);
        } else {
          throw new Error("Không nhận được link thanh toán PayOS");
        }
      } else if (data.paymentMethod === "stripe") {
        toast.info("Vui lòng nhập thông tin thẻ ở khung bên dưới.");
      } else {
        setLoadingState({
          isVisible: true,
          message: "Xác nhận đơn hàng...",
          submessage: "Đang gửi thông tin đến Printz",
        });
        await processCheckout({
          shippingAddress: mappedShippingAddress,
          paymentMethod: "cod",
        });
        setLoadingState({ isVisible: false, message: "" });
      }
    } catch (error: any) {
      setLoadingState({ isVisible: false, message: "" });
      toast.error("Đặt hàng thất bại", { description: error.message });
    }
  };

  const cartItems = cart?.items || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium animate-pulse">
            Đang tải trang thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Giỏ hàng trống trơn
          </h2>
          <p className="text-gray-500 mb-8">
            Hãy chọn vài mẫu thiết kế đẹp mắt trước khi thanh toán nhé.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/shop">Quay lại cửa hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stripeOptions = clientSecret
    ? { clientSecret, appearance: { theme: "stripe" as const } }
    : undefined;

  return (
    <>
      <CheckoutLoadingOverlay
        isVisible={loadingState.isVisible}
        message={loadingState.message}
        submessage={loadingState.submessage}
      />

      {/* --- MAIN WRAPPER: NỀN XÁM NHẸ --- */}
      <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
        {/* --- HEADER BAR (Sticky) --- */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60 mb-8">
          <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại giỏ hàng
            </Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Lock size={14} className="text-green-600" />
              Thanh toán an toàn
            </div>
          </div>
        </div>

        {/* --- LAYOUT 12 CỘT THẦN THÁNH --- */}
        {/* max-w-6xl + mx-auto tạo ra 2 khoảng trống 2 bên (Focused Layout) */}
        <div className="container mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* === CỘT TRÁI: FORM (Chiếm 8/12) === */}
            <div className="lg:col-span-8 space-y-6">
              <FormProvider {...form}>
                <form
                  id="checkout-address-form"
                  onSubmit={form.handleSubmit(onAddressSubmit)}
                >
                  {/* BLOCK 1: THÔNG TIN GIAO HÀNG */}
                  <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-md">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        1. Địa chỉ nhận hàng
                      </h2>
                    </div>

                    {/* Smart Address Selector */}
                    <SmartAddressSelector
                      onSelectAddress={(address) => {
                        form.setValue("shippingAddress", {
                          fullName: address.recipientName,
                          phone: address.phone,
                          street: address.street,
                          ward: address.ward,
                          district: address.district,
                          city: address.city,
                          country: "Việt Nam",
                        });
                        toast.success("Đã chọn địa chỉ", {
                          description: address.recipientName,
                        });
                      }}
                      currentAddress={{
                        fullName: form.watch("shippingAddress.fullName"),
                        phone: form.watch("shippingAddress.phone"),
                        street: form.watch("shippingAddress.street"),
                        city: form.watch("shippingAddress.city"),
                      }}
                    />

                    {!showPaymentMethods && (
                      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          onClick={() =>
                            form
                              .trigger()
                              .then((valid) =>
                                valid
                                  ? setShowPaymentMethods(true)
                                  : toast.error(
                                      "Vui lòng hoàn tất thông tin giao hàng"
                                    )
                              )
                          }
                          className="w-full md:w-auto text-base h-11 px-8 rounded-full shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all font-semibold"
                        >
                          Xác nhận địa chỉ
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* BLOCK 2: PHƯƠNG THỨC THANH TOÁN (Animation Reveal) */}
                  {showPaymentMethods && (
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-forwards">
                      <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 via-teal-500 to-emerald-500"></div>

                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                            <Zap className="w-6 h-6 fill-current" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              2. Phương thức thanh toán
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">
                              Chọn cách thanh toán tiện lợi nhất
                            </p>
                          </div>
                        </div>

                        {/* GRID PAYMENT OPTIONS (2 Columns) */}
                        <RadioGroup
                          value={paymentMethod}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {[
                            {
                              id: "momo",
                              label: "Ví MoMo",
                              icon: QrCode,
                              desc: "Siêu tốc",
                              color: "text-pink-600",
                              bg: "bg-pink-50",
                              border:
                                "peer-checked:border-pink-500 peer-checked:ring-pink-500/20",
                            },
                            {
                              id: "payos",
                              label: "VietQR",
                              icon: QrCode,
                              desc: "Chuyển khoản 24/7",
                              color: "text-blue-600",
                              bg: "bg-blue-50",
                              border:
                                "peer-checked:border-blue-500 peer-checked:ring-blue-500/20",
                            },
                            {
                              id: "stripe",
                              label: "Thẻ Quốc tế",
                              icon: CreditCard,
                              desc: "Visa / Master",
                              color: "text-indigo-600",
                              bg: "bg-indigo-50",
                              border:
                                "peer-checked:border-indigo-500 peer-checked:ring-indigo-500/20",
                            },
                            {
                              id: "cod",
                              label: "COD",
                              icon: Banknote,
                              desc: "Tiền mặt khi nhận",
                              color: "text-green-600",
                              bg: "bg-green-50",
                              border:
                                "peer-checked:border-green-500 peer-checked:ring-green-500/20",
                            },
                          ].map((pm) => (
                            <div key={pm.id} className="relative group">
                              <RadioGroupItem
                                value={pm.id}
                                id={pm.id}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={pm.id}
                                onClick={() =>
                                  !isStripeLoading &&
                                  onPaymentMethodChange(pm.id as any)
                                }
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 cursor-pointer transition-all duration-200 select-none",
                                  "hover:bg-gray-50/80 hover:border-gray-300",
                                  "peer-checked:bg-white peer-checked:shadow-md peer-checked:scale-[1.01] peer-checked:ring-4 ring-offset-0",
                                  pm.border
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                                    pm.bg,
                                    pm.color
                                  )}
                                >
                                  <pm.icon size={22} />
                                </div>
                                <div className="flex-1">
                                  <span className="font-bold text-gray-900 block text-base leading-tight">
                                    {pm.label}
                                  </span>
                                  <span className="text-xs text-gray-500 font-medium mt-1 block">
                                    {pm.desc}
                                  </span>
                                </div>
                                {paymentMethod === pm.id && (
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-white animate-in zoom-in shadow-sm",
                                      pm.color.replace("text-", "bg-")
                                    )}
                                  >
                                    <Check size={12} strokeWidth={4} />
                                  </div>
                                )}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>

                        {/* STRIPE FORM AREA */}
                        {paymentMethod === "stripe" &&
                          clientSecret &&
                          stripeOptions &&
                          stripePromise && (
                            <div className="mt-6 p-6 border border-indigo-100 rounded-2xl bg-indigo-50/30 animate-in fade-in zoom-in-95 duration-300">
                              <Elements
                                options={stripeOptions}
                                stripe={stripePromise}
                              >
                                <PaymentForm
                                  masterOrderId={masterOrderId!}
                                  clientUrl={window.location.origin}
                                />
                              </Elements>
                            </div>
                          )}

                        {/* SUBMIT BUTTON AREA */}
                        {paymentMethod !== "stripe" && (
                          <div className="mt-8 pt-6 border-t border-gray-100">
                            <Button
                              type="button"
                              onClick={() =>
                                form.handleSubmit(onAddressSubmit)()
                              }
                              disabled={isProcessing || isCheckoutValidating}
                              className={cn(
                                "w-full text-lg h-14 font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 relative overflow-hidden",
                                paymentMethod === "cod"
                                  ? "bg-gray-900 hover:bg-black text-white shadow-gray-900/20"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:to-indigo-700 text-white shadow-blue-600/30"
                              )}
                              size="lg"
                            >
                              {isProcessing && (
                                <Loader className="mr-2 h-5 w-5 animate-spin" />
                              )}
                              {paymentMethod === "momo"
                                ? "Thanh toán với MoMo"
                                : paymentMethod === "payos"
                                ? "Lấy mã QR thanh toán"
                                : "Hoàn tất đặt hàng"}
                            </Button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                              <ShieldCheck size={14} />
                              Thông tin thanh toán được mã hóa SSL an toàn tuyệt
                              đối.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </FormProvider>
            </div>

            {/* === CỘT PHẢI: SUMMARY (Chiếm 4/12) - Sticky === */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary Card */}
                <div className="relative">
                  <OrderSummaryCard cart={cart || undefined} />
                  {/* Shadow decoration underneath */}
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-gray-200 to-transparent rounded-[24px] blur opacity-30 -z-10"></div>
                </div>

                {/* Trust Badge / Support Box */}
                <div className="rounded-2xl bg-blue-50/50 p-5 border border-blue-100/50 flex gap-4 items-start backdrop-blur-sm">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600 mt-1 border border-blue-50">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-blue-900 mb-1">
                      Cam kết giao hàng
                    </p>
                    <p className="text-xs text-blue-700/70 leading-relaxed font-medium">
                      Chúng tôi cam kết hoàn tiền 100% nếu sản phẩm lỗi. Giao
                      hàng đúng hẹn toàn quốc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
