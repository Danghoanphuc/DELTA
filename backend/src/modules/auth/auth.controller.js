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

  signUpPrinter = async (req, res, next) => {
    try {
      await this.authService.signUpPrinter(req.body);
      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            null,
            "Đăng ký nhà in thành công! Vui lòng kiểm tra email."
          )
        );
    } catch (error) {
      next(error);
    }
  };

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

  signIn = async (req, res, next) => {
    try {
      const { accessToken, refreshToken, user } = await this.authService.signIn(
        req.body
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
      });

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
      const refreshToken = req.cookies?.refreshToken;
      const { accessToken } = await this.authService.refresh(refreshToken);

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

      res.clearCookie("refreshToken");
      res
        .status(API_CODES.NO_CONTENT)
        .json(ApiResponse.success(null, "Đăng xuất thành công"));
    } catch (error) {
      next(error);
    }
  };
}
