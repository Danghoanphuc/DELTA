import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, User, LogIn } from "lucide-react";
import { useState } from "react";
import { SocialButton } from "@/components/ui/SocialButton";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

const signInSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    const { username, password } = data;
    await signIn(username, password);
    navigate("/");
  };

  return (
    <div className={cn("flex flex-col gap-4 md:gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-white/20 bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Section */}
          <form className="p-4 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-3 rounded-full shadow-lg">
                      <LogIn className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                </a>
                <h1 className="text-xl md:text-2xl font-bold">
                  Chào mừng quay lại
                </h1>
                <p className="text-sm text-muted-foreground">
                  Đăng nhập vào tài khoản Printz
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="username"
                    placeholder="Printz"
                    {...register("username")}
                    className="pl-10 h-10 md:h-11"
                  />
                </div>
                {errors.username && (
                  <p className="text-destructive text-xs md:text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password")}
                    className="pl-10 pr-10 h-10 md:h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs md:text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-sm md:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2">Hoặc</span>
                </div>
              </div>

              {/* Social Login */}
              <SocialButton provider="google" />

              {/* Sign Up Link */}
              <div className="text-center text-xs md:text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 font-medium underline"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </form>

          {/* Image Section - Hidden on mobile */}
          <div className="hidden md:flex bg-gradient-to-br from-blue-50/50 to-purple-50/50 items-center justify-center p-8">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1573637867563-0fe4ef4576ae?w=1080"
              alt="Welcome"
              className="max-w-full rounded-lg shadow-2xl"
            />
          </div>
        </CardContent>
      </Card>
      {/* Terms */}
      <div className="text-xs text-center text-muted-foreground px-4">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <a
          href="https://doc-hosting.flycricket.io/printz-terms-of-use/88941a55-1b5f-403b-a022-add683072860/terms"
          className="text-indigo-600 underline"
        >
          Điều khoản
        </a>
      </div>
    </div>
  );
}
