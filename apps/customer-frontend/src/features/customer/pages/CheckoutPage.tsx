// apps/customer-frontend/src/features/customer/pages/CheckoutPage.tsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/shared/lib/axios";

// Components
import { PaymentForm } from "../components/PaymentForm";
import { CheckoutLoadingOverlay } from "../components/CheckoutLoadingOverlay";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Thêm
} from "@/shared/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label"; // Thêm
import { cn } from "@/shared/lib/utils"; // Thêm

import { OrderSummaryCard } from "@/features/shop/components/OrderSummaryCard";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCheckout } from "../hooks/useCheckout";
import { CreditCard, Truck, QrCode, Banknote, ShieldCheck } from "lucide-react"; // Thêm icon
import { AddressForm } from "../components/AddressForm";
import { Loader } from "lucide-react";
import { config } from "@/config/env.config";
import { checkoutService } from "@/services/checkoutService";

// Schema (Giữ nguyên)
const checkoutSchema = z.object({
  shippingAddress: z.any(),
  paymentMethod: z.enum(["stripe", "momo", "cod", "payos"]),
  billingSameAs: z.boolean().optional(),
  billingAddress: z.any().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
const stripePromise = config.stripePublicKey ? loadStripe(config.stripePublicKey) : null;

const CheckoutPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const isCheckoutValidating = useCartStore((state) => state.isCheckoutValidating);
  const validateCheckout = useCartStore((state) => state.validateCheckout);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [masterOrderId, setMasterOrderId] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  
  const [loadingState, setLoadingState] = useState<{
    isVisible: boolean;
    message: string;
    submessage?: string;
  }>({
    isVisible: false,
    message: '',
  });

  const { createOrderAndPaymentIntent, processCheckout, isProcessing } = useCheckout();

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
  const isFormValid = form.formState.isValid;
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  
  useEffect(() => {
    if (isFormValid && !showPaymentMethods) {
      setShowPaymentMethods(true);
    }
    // Chỉ chạy khi isFormValid thay đổi từ false -> true, không phụ thuộc vào showPaymentMethods
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormValid]);

  const onPaymentMethodChange = async (value: "stripe" | "momo" | "cod" | "payos") => {
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
        const { clientSecret, masterOrderId } = await createOrderAndPaymentIntent(cart._id);
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
      toast.error("Giỏ hàng không hợp lệ.");
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
        notes: "",
      };

      if (!mappedShippingAddress.recipientName || !mappedShippingAddress.district || !mappedShippingAddress.ward) {
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
        return;
      }

      if (data.paymentMethod === "momo") {
        setLoadingState({ isVisible: true, message: 'Đang tạo link MoMo...', submessage: 'Vui lòng chờ giây lát' });
        const { paymentUrl } = await checkoutService.createMomoUrl({ shippingAddress: mappedShippingAddress });
        window.open(paymentUrl, "_blank", "noopener");
        setTimeout(() => setLoadingState({ isVisible: false, message: '' }), 2000);
      } else if (data.paymentMethod === "payos") {
        setLoadingState({ isVisible: true, message: 'Đang tạo QR PayOS...', submessage: 'Đang chuyển hướng...' });
        const response = await api.post('/payos/create-payment', { shippingAddress: mappedShippingAddress });
        if (response.data?.checkoutUrl) {
           setTimeout(() => { window.location.href = response.data.checkoutUrl; }, 500);
        } else {
           throw new Error("Không nhận được link thanh toán");
        }
      } else if (data.paymentMethod === "stripe") {
        toast.info("Vui lòng nhập thẻ bên dưới.");
      } else {
        setLoadingState({ isVisible: true, message: 'Đang tạo đơn COD...', submessage: 'Vui lòng chờ...' });
        await processCheckout({ shippingAddress: mappedShippingAddress, paymentMethod: 'cod' });
        setLoadingState({ isVisible: false, message: '' });
      }
    } catch (error: any) {
      setLoadingState({ isVisible: false, message: '' });
      toast.error("Đặt hàng thất bại", { description: error.message });
    }
  };

  const cartItems = cart?.items || [];
  
  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <Truck className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="mt-2 text-gray-600">Hãy thêm sản phẩm trước khi thanh toán.</p>
      </div>
    );
  }

  const stripeOptions = clientSecret ? { clientSecret, appearance: { theme: "stripe" as const } } : undefined;

  // --- UI Helper: Payment Option Card ---
  const PaymentOption = ({ value, icon: Icon, label, subLabel }: any) => {
    const isSelected = paymentMethod === value;
    return (
      <Label
        htmlFor={value}
        onClick={() => !isStripeLoading && onPaymentMethodChange(value)}
        className={cn(
          "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50",
          isSelected 
            ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600 ring-offset-0" 
            : "border-gray-200"
        )}
      >
        <RadioGroupItem value={value} id={value} className="mt-1" />
        <div className="flex-1">
          <span className="font-semibold text-base cursor-pointer text-gray-900 block">
            {label}
          </span>
          <p className="text-sm text-gray-500 mt-1 font-normal">{subLabel}</p>
        </div>
        <Icon className={cn("w-6 h-6", isSelected ? "text-blue-600" : "text-gray-400")} />
      </Label>
    );
  };

  return (
    <>
      <CheckoutLoadingOverlay
        isVisible={loadingState.isVisible}
        message={loadingState.message}
        submessage={loadingState.submessage}
      />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">Thanh toán</h1>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* CỘT TRÁI: Form (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            <FormProvider {...form}>
              <form id="checkout-address-form" onSubmit={form.handleSubmit(onAddressSubmit)}>
                <AddressForm />
                
                {!showPaymentMethods && (
                  <Button
                    type="button"
                    onClick={() => form.trigger().then(valid => valid ? setShowPaymentMethods(true) : toast.error("Kiểm tra lại địa chỉ"))}
                    className="w-full mt-6 text-lg h-12"
                    size="lg"
                  >
                    Tiếp tục đến thanh toán
                  </Button>
                )}
              </form>

              {showPaymentMethods && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="mt-8 shadow-md border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        Phương thức thanh toán
                      </CardTitle>
                      <CardDescription>Tất cả giao dịch đều được bảo mật và mã hóa.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <RadioGroup value={paymentMethod} className="space-y-3">
                        <PaymentOption 
                          value="momo" 
                          icon={QrCode} 
                          label="Ví MoMo" 
                          subLabel="Quét mã QR hoặc thanh toán qua ứng dụng MoMo" 
                        />
                        <PaymentOption 
                          value="payos" 
                          icon={QrCode} 
                          label="Ngân hàng (VietQR)" 
                          subLabel="Chuyển khoản quét mã QR tự động qua PayOS" 
                        />
                        <PaymentOption 
                          value="stripe" 
                          icon={CreditCard} 
                          label="Thẻ Quốc tế" 
                          subLabel="Visa, Mastercard, JCB via Stripe" 
                        />
                        <PaymentOption 
                          value="cod" 
                          icon={Banknote} 
                          label="Thanh toán khi nhận hàng (COD)" 
                          subLabel="Thanh toán tiền mặt cho shipper" 
                        />
                      </RadioGroup>

                      {/* STRIPE FORM */}
                      {paymentMethod === "stripe" && clientSecret && stripeOptions && stripePromise && (
                         <div className="mt-6 p-4 border rounded-xl bg-gray-50/50 animate-in zoom-in-95 duration-300">
                            <Elements options={stripeOptions} stripe={stripePromise}>
                              <PaymentForm masterOrderId={masterOrderId!} clientUrl={window.location.origin} />
                            </Elements>
                         </div>
                      )}

                      {/* SUBMIT BUTTON (Non-Stripe) */}
                      {paymentMethod !== "stripe" && (
                        <div className="mt-8">
                          <Button
                            type="button"
                            onClick={() => form.handleSubmit(onAddressSubmit)()}
                            disabled={isProcessing || isCheckoutValidating}
                            className="w-full text-lg h-14 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all"
                            size="lg"
                          >
                            {isProcessing && <Loader className="mr-2 h-5 w-5 animate-spin" />}
                            {paymentMethod === "momo" ? "Thanh toán bằng MoMo" 
                             : paymentMethod === "payos" ? "Thanh toán bằng VietQR" 
                             : "Đặt hàng ngay (COD)"}
                          </Button>
                          
                          {/* Trust Badges */}
                          <div className="mt-6 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                             {/* (Placeholder icons for trust badges) */}
                             <div className="flex items-center gap-1 text-xs text-gray-500">
                                <ShieldCheck size={14} /> Bảo mật SSL
                             </div>
                             <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Truck size={14} /> Free ship đơn {">"} 500k
                             </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </FormProvider>
          </div>

          {/* CỘT PHẢI: Summary (5/12) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 space-y-6">
               <OrderSummaryCard cart={cart || undefined} />
               
               {/* Help Box */}
               <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-sm text-blue-800 flex gap-3">
                  <div className="bg-white p-2 rounded-full h-fit shadow-sm text-blue-600">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Giao hàng nhanh</p>
                    <p className="opacity-80">Chúng tôi cam kết giao hàng đúng hẹn. Nếu trễ, bạn sẽ được đền bù voucher 50k.</p>
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