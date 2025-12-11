// apps/customer-frontend/src/features/delivery-checkin/pages/ShipperRegisterPage.tsx
/**
 * Shipper Registration Page
 * Allows new shippers to register for testing purposes
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Truck,
  Mail,
  Lock,
  User,
  Phone,
  Car,
  Bike,
  Footprints,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { authService } from "@/services/authService";

// Validation schema
const shipperRegisterSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"
      ),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .min(2, "Tên phải có ít nhất 2 ký tự")
      .max(50, "Tên không quá 50 ký tự"),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 số")
      .optional()
      .or(z.literal("")),
    vehicleType: z.enum(["motorbike", "car", "bicycle", "walking"]),
    vehiclePlate: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ShipperRegisterForm = z.infer<typeof shipperRegisterSchema>;

const vehicleOptions = [
  { value: "motorbike", label: "Xe máy", icon: Bike },
  { value: "car", label: "Ô tô", icon: Car },
  { value: "bicycle", label: "Xe đạp", icon: Bike },
  { value: "walking", label: "Đi bộ", icon: Footprints },
];

export function ShipperRegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShipperRegisterForm>({
    resolver: zodResolver(shipperRegisterSchema),
    defaultValues: {
      vehicleType: "motorbike",
    },
  });

  const vehicleType = watch("vehicleType");

  const onSubmit = async (data: ShipperRegisterForm) => {
    setIsLoading(true);
    try {
      await authService.signUpShipper({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || undefined,
        vehicleType: data.vehicleType,
        vehiclePlate: data.vehiclePlate || undefined,
      });

      setIsSuccess(true);
      toast.success("Đăng ký shipper thành công!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Tài khoản shipper của bạn đã được tạo. Bạn có thể đăng nhập ngay bây
            giờ.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/signin")}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Đăng nhập ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/shipper")}
              className="w-full"
            >
              Đi đến Shipper Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/shipper"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký Shipper</h1>
          <p className="text-gray-500 mt-2">
            Tạo tài khoản shipper để bắt đầu giao hàng
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="displayName"
                placeholder="Nguyễn Văn A"
                className={cn("pl-10", errors.displayName && "border-red-500")}
                {...register("displayName")}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-500">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="shipper@example.com"
                className={cn("pl-10", errors.email && "border-red-500")}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Số điện thoại (tùy chọn)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="phoneNumber"
                placeholder="0901234567"
                className={cn("pl-10", errors.phoneNumber && "border-red-500")}
                {...register("phoneNumber")}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label>Phương tiện</Label>
            <Select
              value={vehicleType}
              onValueChange={(value) => setValue("vehicleType", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương tiện" />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Plate */}
          {(vehicleType === "motorbike" || vehicleType === "car") && (
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Biển số xe (tùy chọn)</Label>
              <Input
                id="vehiclePlate"
                placeholder="59-X1 12345"
                {...register("vehiclePlate")}
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "pl-10 pr-10",
                  errors.password && "border-red-500"
                )}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "pl-10 pr-10",
                  errors.confirmPassword && "border-red-500"
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang đăng ký...
              </span>
            ) : (
              "Đăng ký Shipper"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            to="/signin"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ShipperRegisterPage;
