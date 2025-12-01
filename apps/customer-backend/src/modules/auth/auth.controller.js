// src/modules/auth/auth.controller.js
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { OAuth2Client } from "google-auth-library";
import { config } from "../../config/env.config.js";
import { User } from "../../shared/models/user.model.js";
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";
import { generateUniqueUsername } from "../../shared/utils/username.util.js";
import crypto from "crypto";

const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export class AuthController {
  constructor() {
    this.authService = new AuthService();
    // Khởi tạo Google Client
    // Lưu ý: Đảm bảo biến GOOGLE_CLIENT_ID đã có trong .env và config
    this.googleClient = new OAuth2Client(
      config.oauth?.google?.clientId || process.env.GOOGLE_CLIENT_ID
    );
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
        path: "/",
      };

      res.cookie("refreshToken", refreshToken, cookieOptions);

      console.log("✅ [Auth SignIn] User signed in:", user.email);

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

  /**
   * ✅ NEW: Xác thực Google Authorization Code (OAuth2 flow)
   * Đây là cách hiện đại nhất, không cần popup hay redirect URI
   */
  verifyGoogleCode = async (req, res, next) => {
    try {
      const { code, role = "customer" } = req.body;

      if (!code) {
        return res
          .status(400)
          .json(ApiResponse.error("Thiếu authorization code"));
      }

      console.log(`🔐 [Auth Google Code] Exchanging code for tokens...`);
      console.log(`🔐 [Auth Google Code] Code:`, code.substring(0, 20) + "...");

      // 1. Exchange authorization code for tokens
      // ✅ FIX: Need redirect_uri as 'postmessage' for popup flow
      const { tokens } = await this.googleClient.getToken({
        code: code,
        redirect_uri: "postmessage",
      });

      console.log(`🔐 [Auth Google Code] Tokens received successfully`);
      this.googleClient.setCredentials(tokens);

      // 2. Get user info from Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience:
          config.oauth?.google?.clientId || process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) throw new Error("Token không hợp lệ");

      const { email, name, picture, sub: googleId } = payload;
      console.log(`🔐 [Auth Google Code] User: ${email}`);

      // 3. Find or create user (same logic as verifyGoogleToken)
      let user = await User.findOne({
        $or: [{ email }, { googleId }],
      });
      let isNewUser = false;

      if (!user) {
        console.log(`➕ [Auth Google Code] Creating new user: ${email}`);
        const username = await generateUniqueUsername(email);

        user = new User({
          email,
          username,
          displayName: name || email.split("@")[0],
          avatarUrl: picture || "",
          googleId: googleId,
          role: role,
          isVerified: true,
          authMethod: "google",
          isActive: true,
          lastLoginAt: new Date(),
        });

        const newProfile = new CustomerProfile({
          userId: user._id,
          savedAddresses: [],
        });
        await newProfile.save();

        user.customerProfileId = newProfile._id;
        await user.save();
        isNewUser = true;
      } else {
        // Update existing user
        let updated = false;

        if (!user.googleId) {
          user.googleId = googleId;
          updated = true;
        }

        if (!user.avatarUrl && picture) {
          user.avatarUrl = picture;
          updated = true;
        }

        if (!user.displayName && name) {
          user.displayName = name;
          updated = true;
        }

        user.lastLoginAt = new Date();
        updated = true;

        if (updated) {
          await user.save();
        }

        // Ensure CustomerProfile exists
        if (!user.customerProfileId) {
          const existingProfile = await CustomerProfile.findOne({
            userId: user._id,
          });
          if (existingProfile) {
            user.customerProfileId = existingProfile._id;
            await user.save();
          } else {
            const newProfile = new CustomerProfile({
              userId: user._id,
              savedAddresses: [],
            });
            await newProfile.save();
            user.customerProfileId = newProfile._id;
            await user.save();
          }
        }
      }

      // 4. Create session & tokens
      const accessToken = this.authService.generateAccessToken(user._id);
      const refreshToken = crypto.randomBytes(64).toString("hex");

      await this.authService.authRepository.createSession({
        userId: user._id,
        refreshToken,
        expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      });

      // 5. Set cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
        path: "/",
      };

      res.cookie("refreshToken", refreshToken, cookieOptions);

      // 6. Return response
      const userWithProfile =
        await this.authService.authRepository.findUserById(user._id);

      console.log(`✅ [Auth Google Code] Success for user: ${email}`);

      res
        .status(200)
        .json(
          ApiResponse.success(
            { accessToken, user: userWithProfile },
            isNewUser
              ? "Đăng ký thành công bằng Google!"
              : "Đăng nhập Google thành công!"
          )
        );
    } catch (error) {
      console.error("❌ [Auth Google Code] Error:", error);
      next(error);
    }
  };

  /**
   * ✅ OLD: Xác thực Google ID Token (Client-side retrieval)
   * Giữ lại để backward compatibility
   */
  verifyGoogleToken = async (req, res, next) => {
    try {
      const { credential, role = "customer" } = req.body;

      if (!credential) {
        return res
          .status(400)
          .json(ApiResponse.error("Thiếu Google Token (credential)"));
      }

      // 1. Verify token với Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience:
          config.oauth?.google?.clientId || process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) throw new Error("Token không hợp lệ");

      const { email, name, picture, sub: googleId } = payload;
      console.log(`🔐 [Auth Google] Verifying user: ${email}`);

      // 2. Tìm hoặc Tạo User (Logic tương tự passport-setup.js nhưng clean hơn)
      // ✅ FIX: Tìm cả bằng email và googleId để tránh duplicate
      let user = await User.findOne({
        $or: [{ email }, { googleId }],
      });
      let isNewUser = false;

      if (!user) {
        // --- Tạo User mới ---
        console.log(`➕ [Auth Google] Creating new user: ${email}`);

        // ✅ FIX: Generate unique username
        const username = await generateUniqueUsername(email);

        // Tạo User
        user = new User({
          email,
          username,
          displayName: name || email.split("@")[0],
          avatarUrl: picture || "",
          googleId: googleId,
          role: role,
          isVerified: true,
          authMethod: "google",
          isActive: true,
          lastLoginAt: new Date(),
        });

        // Tạo Profile tương ứng
        // ✅ FIX: Luôn tạo CustomerProfile (role printer sẽ được xử lý sau khi onboarding)
        const newProfile = new CustomerProfile({
          userId: user._id,
          savedAddresses: [],
        });
        await newProfile.save();

        // Link profile to user
        if (user.schema.path("customerProfileId")) {
          user.customerProfileId = newProfile._id;
        } else {
          user.customerProfile = newProfile._id;
        }

        await user.save();
        isNewUser = true;
      } else {
        // --- Update User cũ ---
        let updated = false;

        // ✅ FIX: Link Google account nếu chưa có
        if (!user.googleId) {
          console.log(
            `🔗 [Auth Google] Linking Google account to existing user: ${email}`
          );
          user.googleId = googleId;
          updated = true;
        }

        // ✅ FIX: Update authMethod nếu cần
        if (user.authMethod === "local" || !user.authMethod) {
          // Cho phép user đăng nhập bằng cả local và Google
          if (!user.authMethod) {
            user.authMethod = "google";
            updated = true;
          }
        }

        // Update avatar nếu chưa có
        if (!user.avatarUrl && picture) {
          user.avatarUrl = picture;
          updated = true;
        }

        // Update displayName nếu chưa có
        if (!user.displayName && name) {
          user.displayName = name;
          updated = true;
        }

        // Update last login
        user.lastLoginAt = new Date();
        updated = true;

        if (updated) {
          await user.save();
        }

        // ✅ FIX: Đảm bảo user có CustomerProfile
        if (!user.customerProfileId) {
          console.log(
            `📝 [Auth Google] User ${email} missing CustomerProfile, creating...`
          );
          const existingProfile = await CustomerProfile.findOne({
            userId: user._id,
          });

          if (existingProfile) {
            user.customerProfileId = existingProfile._id;
            await user.save();
            console.log(
              `✅ [Auth Google] Linked existing CustomerProfile for ${email}`
            );
          } else {
            const newProfile = new CustomerProfile({
              userId: user._id,
              savedAddresses: [],
            });
            await newProfile.save();
            user.customerProfileId = newProfile._id;
            await user.save();
            console.log(
              `✅ [Auth Google] Created CustomerProfile for ${email}`
            );
          }
        }
      }

      // 3. Tạo Session & Tokens
      // (Tái sử dụng các hàm tiện ích của AuthService để đảm bảo nhất quán)

      // Tạo Access Token
      const accessToken = this.authService.generateAccessToken(user._id);

      // Tạo Refresh Token
      const refreshToken = crypto.randomBytes(64).toString("hex");

      // Lưu Session vào DB (Truy cập trực tiếp Repository thông qua Service)
      // Lưu ý: Đây là cách truy cập nhanh, ideal là viết method createSession trong Service
      await this.authService.authRepository.createSession({
        userId: user._id,
        refreshToken,
        expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      });

      // 4. Set Cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
        path: "/",
      };

      res.cookie("refreshToken", refreshToken, cookieOptions);

      // 5. Trả về kết quả
      // Lấy full profile để trả về FE
      const userWithProfile =
        await this.authService.authRepository.findUserById(user._id);

      console.log(`✅ [Auth Google] Success for user: ${email}`);

      res
        .status(200)
        .json(
          ApiResponse.success(
            { accessToken, user: userWithProfile },
            isNewUser
              ? "Đăng ký thành công bằng Google!"
              : "Đăng nhập Google thành công!"
          )
        );
    } catch (error) {
      console.error("❌ [Auth Google] Verification Error:", error);
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      let refreshToken = req.cookies?.refreshToken;

      if (!refreshToken && req.headers.cookie) {
        const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {});
        refreshToken = cookies.refreshToken;
      }

      if (!refreshToken) {
        return res
          .status(401)
          .json(
            ApiResponse.error(
              "Không có refresh token. Vui lòng đăng nhập lại.",
              401
            )
          );
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refresh(refreshToken);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
        path: "/",
      };

      if (newRefreshToken) {
        res.cookie("refreshToken", newRefreshToken, cookieOptions);
      } else {
        res.cookie("refreshToken", refreshToken, cookieOptions);
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
