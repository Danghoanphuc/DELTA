// apps/customer-frontend/src/features/customer/pages/CheckoutPage.tsx (ĐÃ VÁ)
import React, { useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
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

// Stripe Promise
const stripePromise = loadStripe(config.stripePublicKey);

const CheckoutPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const navigate = useNavigate();

  // ✅ SỬA LỖI TS2339: Lấy 'cart' object
  const { cart, isLoading, isCheckoutValidating, validateCheckout } =
    useCartStore((state) => ({
      cart: state.cart,
      isLoading: state.isLoading,
      isCheckoutValidating: state.isCheckoutValidating,
      validateCheckout: state.validateCheckout,
    }));

  // State cho Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [masterOrderId, setMasterOrderId] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // Hook checkout
  const { createOrderAndPaymentIntent, isProcessing } = useCheckout();

  // Form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
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

  // Xử lý khi đổi phương thức thanh toán
  const onPaymentMethodChange = async (value: "stripe" | "vnpay" | "cod") => {
    if (value === "stripe") {
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
      if (data.paymentMethod === "vnpay") {
        const { paymentUrl } = await vnpayCreatePayment(
          cart!._id,
          data.shippingAddress
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
              {paymentMethod !== "stripe" && (
                <Button
                  type="submit"
                  disabled={isProcessing || isCheckoutValidating}
                  className="w-full text-lg"
                >
                  {isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {paymentMethod === "vnpay"
                    ? "Tiến hành thanh toán VNPay"
                    : "Hoàn tất đơn hàng (COD)"}
                </Button>
              )}
            </form>
          </FormProvider>

          {form.formState.isValid && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) =>
                    onPaymentMethodChange(val as "stripe" | "vnpay" | "cod")
                  }
                  className="space-y-4"
                >
                  {/* (Radio VNPay & COD) */}
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="vnpay" id="vnpay" />
                    </FormControl>
                    <FormLabel
                      htmlFor="vnpay"
                      className="flex w-full cursor-pointer items-center justify-between font-normal"
                    >
                      <span>Thanh toán qua VNPay (ATM/Visa/Master)</span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="cod" id="cod" />
                    </FormControl>
                    <FormLabel
                      htmlFor="cod"
                      className="flex w-full cursor-pointer items-center justify-between font-normal"
                    >
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </FormLabel>
                  </FormItem>
                  {/* (Radio Stripe) */}
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="stripe"
                        id="stripe"
                        disabled={isStripeLoading}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="stripe"
                      className="flex w-full cursor-pointer items-center justify-between font-normal"
                    >
                      <span className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <span>Thanh toán bằng Thẻ Quốc tế (Visa, Master)</span>
                      </span>
                      {isStripeLoading && (
                        <span className="text-sm text-muted-foreground">
                          Đang tải form...
                        </span>
                      )}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>

                {/* --- Step 3: Hiển thị Form Stripe --- */}
                {clientSecret && stripeOptions && (
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
              </CardContent>
            </Card>
          )}
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
