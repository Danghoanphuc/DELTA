// src/modules/auth/auth-oauth.routes.js
// BÀN GIAO: Đã sửa lỗi JSON.stringify (treo popup)

import express from "express";
import passport from "passport";
import { AuthService } from "./auth.service.js";
import { Logger } from "../../shared/utils/index.js"; // Import Logger

const router = express.Router();
const authService = new AuthService();

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

      // ✅ GIẢI PHÁP: Chuyển Mongoose object thành POJO (Plain Object)
      // Dùng .toObject() để đảm bảo an toàn cho JSON.stringify
      const safeUser =
        result.user && typeof result.user.toObject === "function"
          ? result.user.toObject()
          : result.user;

      const payload = {
        success: true,
        accessToken: result.accessToken,
        user: safeUser, // <-- Sử dụng đối tượng đã được làm sạch
      };

      // Chuyển đổi payload thành chuỗi JSON an toàn
      // Chúng ta sẽ escape nó để ngăn lỗi XSS và lỗi cú pháp
      const jsonPayload = JSON.stringify(payload)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/&/g, "\\&")
        .replace(/</g, "\\<")
        .replace(/>/g, "\\>")
        .replace(/\//g, "\\/");

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
                // ✅ GIẢI PHÁP: Parse chuỗi JSON đã được escape an toàn
                const payload = JSON.parse("${jsonPayload}"); 
                const targetOrigin = "${CLIENT_URL}";
                let attempts = 0;
                const maxAttempts = 10;
                
                function sendMessage() {
                  attempts++;
                  
                  if (window.opener && !window.opener.closed) {
                    console.log("Attempt", attempts, "- Sending to:", targetOrigin);
                    window.opener.postMessage(payload, targetOrigin);
                    
                    setTimeout(() => {
                      window.close();
                    }, 500);
                  } else if (attempts < maxAttempts) {
                    setTimeout(sendMessage, 100);
                  } else {
                    console.error("Cannot find opener window, redirecting...");
                    window.location.href = targetOrigin + "/?oauth=success";
                  }
                }
                
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
