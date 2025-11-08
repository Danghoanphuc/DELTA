// src/modules/auth/auth-oauth.routes.js
// BÀN GIAO: Đã sửa lỗi postMessage an toàn hơn

import express from "express";
import passport from "passport";
import { AuthService } from "./auth.service.js";
import { Logger } from "../../shared/utils/index.js"; // Import Logger

const router = express.Router();
const authService = new AuthService();

// ✅ Đọc CLIENT_URL từ .env (phải là http://localhost:5173 khi dev)
const CLIENT_URL = process.env.CLIENT_URL;
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

if (!CLIENT_URL) {
  Logger.error(
    "FATAL: Biến .env 'CLIENT_URL' bị thiếu. OAuth sẽ không hoạt động."
  );
}

// Google OAuth init (Giữ nguyên)
router.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/signin?error=auth_failed`,
  }),
  async (req, res) => {
    try {
      const result = await authService.createOAuthSession(req.user);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
      });

      // ✅ CẢI TIẾN: Tạo payload an toàn
      const payload = {
        success: true,
        accessToken: result.accessToken,
        user: result.user, // user đã là một JSON object
      };

      // Gửi payload an toàn
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Đăng nhập thành công</title></head>
          <body>
            <script>
              // Biến payload này an toàn vì JSON.stringify sẽ escape tất cả
              const payload = ${JSON.stringify(payload)}; 
              const targetOrigin = "${CLIENT_URL}";
              
              if (window.opener) {
                console.log("Sending payload to:", targetOrigin);
                window.opener.postMessage(payload, targetOrigin);
                console.log("Payload sent. Closing popup.");
                // Đóng ngay lập tức sau khi gửi
                window.close();
              } else {
                console.error("No window.opener found!");
                document.body.innerHTML = "Lỗi: Không tìm thấy cửa sổ gốc. Vui lòng đóng tab này.";
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      Logger.error("❌ Lỗi Google Callback:", error);
      res.redirect(`${CLIENT_URL}/signin?error=server_error`);
    }
  }
);

export default router;
