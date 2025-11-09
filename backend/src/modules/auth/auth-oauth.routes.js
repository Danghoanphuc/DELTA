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
        user: result.user,
      };

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Đăng nhập thành công</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .container {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .spinner {
                border: 3px solid #e5e7eb;
                border-top-color: #3b82f6;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <p>Đang xử lý đăng nhập...</p>
            </div>
            <script>
              (function() {
                const payload = ${JSON.stringify(payload)};
                const targetOrigin = "${CLIENT_URL}";
                let attempts = 0;
                const maxAttempts = 10;
                
                function sendMessage() {
                  attempts++;
                  
                  if (window.opener && !window.opener.closed) {
                    console.log("Attempt", attempts, "- Sending to:", targetOrigin);
                    window.opener.postMessage(payload, targetOrigin);
                    
                    // Đợi một chút để message được xử lý
                    setTimeout(() => {
                      window.close();
                    }, 500);
                  } else if (attempts < maxAttempts) {
                    // Thử lại sau 100ms
                    setTimeout(sendMessage, 100);
                  } else {
                    // Fallback: redirect trực tiếp
                    console.error("Cannot find opener window, redirecting...");
                    window.location.href = targetOrigin + "/?oauth=success";
                  }
                }
                
                // Bắt đầu gửi message
                sendMessage();
              })();
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
