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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-white/20 bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 relative">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-3.5 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <LogIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </a>

                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Chào mừng quay lại
                </h1>
                <p className="text-muted-foreground text-balance">
                  Đăng nhập vào tài khoản Printz của bạn
                </p>
              </div>

              {/* username */}
              <div className="space-y-2 group">
                <Label
                  htmlFor="username"
                  className="block group-focus-within:text-indigo-600 transition-colors"
                >
                  Tên đăng nhập
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <Input
                    type="text"
                    id="username"
                    placeholder="Printz"
                    {...register("username")}
                    className="pl-10 bg-white/50 border-gray-200 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="space-y-2 group">
                <Label
                  htmlFor="password"
                  className="block group-focus-within:text-indigo-600 transition-colors"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password")}
                    className="pl-10 pr-10 bg-white/50 border-gray-200 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* nút đăng nhập */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              {/* divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              {/* social login buttons */}
              <div>
                <SocialButton provider="google" />
              </div>

              <div className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors underline underline-offset-2"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </form>

          <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 relative hidden md:flex items-center justify-center overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            <ImageWithFallback
              src="https://images.unsplash.com/photo-1573637867563-0fe4ef4576ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB3ZWxjb21lfGVufDF8fHx8MTc2MTExMjAzMXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Welcome back illustration"
              className="relative z-10 object-cover max-w-[90%] max-h-[90%] rounded-lg shadow-2xl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-balance px-6 text-center text-muted-foreground">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <a
          href="#"
          className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
        >
          Điều khoản dịch vụ
        </a>{" "}
        và{" "}
        <a
          href="#"
          className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
        >
          Chính sách bảo mật
        </a>{" "}
        của chúng tôi.
      </div>
    </div>
  );
}
