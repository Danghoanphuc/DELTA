// src/modules/auth/auth.controller.js
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  signUp = async (req, res, next) => {
    try {
      await this.authService.signUp(req.body);
      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            null,
            "Đăng ký thành công! Vui lòng kiểm tra email."
          )
        );
    } catch (error) {
      next(error); // Chuyển lỗi cho middleware xử lý
    }
  };

  // ❌ REMOVED: signUpPrinter method - Printer registration is now handled via onboarding flow
  // Use /api/printers/onboarding instead

  verifyEmail = async (req, res, next) => {
    try {
      const { email } = await this.authService.verifyEmail(req.body.token);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ email }, "Xác thực email thành công!"));
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (req, res, next) => {
    try {
      const { email } = await this.authService.resendVerificationEmail(
        req.body.email
      );
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { email },
            "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư."
          )
        );
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { accessToken, refreshToken, user } = await this.authService.signIn(
        req.body
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
        path: "/", // ✅ FIX: Đảm bảo cookie có path rõ ràng
      };

      res.cookie("refreshToken", refreshToken, cookieOptions);
      
      // ✅ DEBUG: Log để kiểm tra cookie có được set không
      console.log("✅ [Auth SignIn] Đã set refresh token cookie với options:", cookieOptions);
      console.log("✅ [Auth SignIn] Request origin:", req.headers.origin);
      console.log("✅ [Auth SignIn] User:", user.email);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { accessToken, user },
            `Chào mừng trở lại, ${user.displayName}!`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      // ✅ FIX: Đọc refresh token từ cookies hoặc headers (fallback)
      let refreshToken = req.cookies?.refreshToken;
      
      // ✅ FIX: Nếu không có trong cookies, thử parse từ headers
      if (!refreshToken && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {});
        refreshToken = cookies.refreshToken;
      }

      // ✅ DEBUG: Log để kiểm tra cookie có được gửi không
      console.log("🔄 [Auth Refresh] Request cookies:", req.cookies);
      console.log("🔄 [Auth Refresh] Request headers:", {
        cookie: req.headers.cookie,
        origin: req.headers.origin,
        referer: req.headers.referer,
      });
      console.log("🔄 [Auth Refresh] Extracted refreshToken:", refreshToken ? "✅ Found" : "❌ Not found");
      
      // ✅ FIX: Validate refresh token trước khi gọi service
      if (!refreshToken) {
        console.error("❌ [Auth Refresh] Không tìm thấy refresh token");
        console.error("   - req.cookies:", req.cookies);
        console.error("   - req.headers.cookie:", req.headers.cookie);
        return res.status(401).json(
          ApiResponse.error("Không có refresh token. Vui lòng đăng nhập lại.", 401)
        );
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refresh(refreshToken);

      // ✅ FIXED: Cập nhật cookie với refresh token mới (token rotation)
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
        path: "/", // ✅ FIX: Đảm bảo cookie có path rõ ràng
      };

      // ✅ FIX: Luôn set cookie mới (kể cả khi không có newRefreshToken, vẫn set lại để refresh expiry)
      if (newRefreshToken) {
        res.cookie("refreshToken", newRefreshToken, cookieOptions);
        console.log("✅ [Auth Refresh] Đã set cookie mới với options:", cookieOptions);
      } else {
        // Nếu không có newRefreshToken (token rotation không tạo mới), vẫn set lại cookie cũ để refresh expiry
        res.cookie("refreshToken", refreshToken, cookieOptions);
        console.log("✅ [Auth Refresh] Đã refresh cookie expiry");
      }

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ accessToken }, "Token đã được làm mới"));
    } catch (error) {
      next(error);
    }
  };

  signOut = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await this.authService.signOut(refreshToken);

      // ✅ FIX: Clear cookie với cùng options như khi set để đảm bảo cookie được xóa đúng
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
      
      res
        .status(API_CODES.NO_CONTENT)
        .json(ApiResponse.success(null, "Đăng xuất thành công"));
    } catch (error) {
      next(error);
    }
  };
}
