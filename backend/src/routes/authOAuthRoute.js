// backend/src/routes/authOAuthRoute.js
import express from "express";
import passport from "passport";
import crypto from "crypto";
import Session from "../models/session.js";
import { generateAccessToken } from "../controllers/authController.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

// ✅ HÀM TẠO SESSION VÀ GỬI TOKEN
const createSessionAndSendTokens = async (req, res, user) => {
  try {
    if (!user || !user._id) {
      console.error("❌ Không có user hợp lệ trong callback.");
      return res.redirect(`${CLIENT_URL}/signin?error=auth_failed`);
    }

    console.log("✅ User từ Google:", user.email);

    // 1. Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // 2. Lưu session vào DB
    await Session.create({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    console.log("✅ Đã tạo session cho user:", user._id);

    // 3. Set cookie với cấu hình chặt chẽ
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
      path: "/", // ✅ Đảm bảo cookie áp dụng cho toàn bộ domain
    });

    console.log("✅ Đã set refreshToken cookie");

    // 4. Gửi dữ liệu về popup qua postMessage
    const userData = {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
    };

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Đăng nhập thành công</title>
        </head>
        <body>
          <script>
            console.log("🔄 Đang gửi data về tab gốc...");
            
            // Gửi thông tin về tab gốc
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "GOOGLE_AUTH_SUCCESS",
                  accessToken: "${accessToken}",
                  user: ${JSON.stringify(userData)}
                },
                "${CLIENT_URL}"
              );
              console.log("✅ Đã gửi postMessage");
              
              // Đóng popup sau 500ms
              setTimeout(() => {
                window.close();
              }, 500);
            } else {
              console.error("❌ Không tìm thấy window.opener");
              alert("Lỗi: Không thể kết nối với cửa sổ chính. Vui lòng thử lại.");
            }
          </script>
          <p style="text-align: center; padding: 20px;">
            Đăng nhập thành công! Đang chuyển hướng...
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Lỗi khi tạo session/gửi token:", error);
    res.redirect(`${CLIENT_URL}/signin?error=server_error`);
  }
};

// ✅ Route khởi tạo đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
// ✅ (Middleware MỚI) Ghi nhớ vai trò OAuth
const rememberOAuthRole = (req, res, next) => {
  const role = req.query.role === "printer" ? "printer" : "customer";
  req.session.oauthRole = role; // Lưu vai trò vào session
  console.log(`✅ OAuth: Ghi nhớ vai trò: ${role}`);
  next();
};

// ✅ Route khởi tạo (CẬP NHẬT)
router.get(
  "/google",
  rememberOAuthRole, // <-- Chạy middleware MỚI trước
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
// ✅ Route callback sau khi xác thực Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/signin?error=auth_failed`,
  }),
  async (req, res) => {
    console.log("✅ Google Callback thành công, user:", req.user?.email);
    await createSessionAndSendTokens(req, res, req.user);
  }
);

export default router;
