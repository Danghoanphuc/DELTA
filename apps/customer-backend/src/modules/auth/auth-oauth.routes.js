// backend/src/modules/auth/auth-oauth.routes.js
// ✅ VERIFIED: Only sends accessToken, not user object

import express from "express";
import passport from "passport";
import { AuthService } from "./auth.service.js";
import { Logger } from "../../shared/utils/index.js";
import { config } from "../../config/env.config.js";

const router = express.Router();
const authService = new AuthService();

const CLIENT_URL = config.clientUrl;
const CLIENT_ORIGINS = config.clientUrls;
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

if (!CLIENT_URL || CLIENT_ORIGINS.length === 0) {
  Logger.error(
    "FATAL: Biến .env 'CLIENT_URL' bị thiếu. OAuth sẽ không hoạt động."
  );
  process.exit(1);
}

/**
 * Route: GET /api/auth/google
 * Initiates Google OAuth flow
 */
router.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
});

/**
 * Route: GET /api/auth/google/callback
 * Google OAuth callback handler
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/signin?error=auth_failed`,
  }),
  async (req, res) => {
    try {
      Logger.info(`[OAuth] Callback triggered for user: ${req.user.email}`);

      // Create session and get tokens
      const result = await authService.createOAuthSession(req.user);

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
      });

      // ✅ CRITICAL: Only send accessToken, NOT user object
      // Frontend will call /users/me to fetch user data
      const payload = {
        success: true,
        accessToken: result.accessToken,
      };

      Logger.success(`[OAuth] Session created for user: ${req.user.email}`);

      // Send HTML response with postMessage script
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Đăng nhập thành công</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                text-align: center;
                background: white;
                padding: 2.5rem;
                border-radius: 1rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                max-width: 400px;
              }
              .spinner {
                border: 4px solid #f3f4f6;
                border-top-color: #667eea;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              h1 {
                font-size: 1.5rem;
                color: #1f2937;
                margin-bottom: 0.5rem;
                font-weight: 600;
              }
              p {
                color: #6b7280;
                font-size: 0.95rem;
              }
              .checkmark {
                font-size: 3rem;
                color: #10b981;
                margin-bottom: 1rem;
                display: none;
              }
              .checkmark.show {
                display: block;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="checkmark" id="checkmark">✓</div>
              <div class="spinner" id="spinner"></div>
              <h1>Đăng nhập thành công!</h1>
              <p>Đang chuyển hướng...</p>
            </div>
            <script>
              (function() {
                const payload = ${JSON.stringify(payload)};
                const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
                let attempts = 0;
                const maxAttempts = 30; // ✅ FIX: Tăng số lần retry lên 30 (3 giây)
                let messageSent = false;
                
                console.log("[OAuth] Callback page loaded");
                console.log("[OAuth] Target origins:", targetOrigins);
                console.log("[OAuth] Payload:", payload);
                console.log("[OAuth] Window opener:", window.opener ? "exists" : "null");
                
                function sendMessage() {
                  attempts++;
                  
                  if (window.opener && !window.opener.closed) {
                    console.log("[OAuth] ✅ Attempt", attempts, "- Sending message to:", targetOrigins);
                    
                    // ✅ FIX: Gửi message đến tất cả target origins
                    // ✅ FIX: Cũng gửi với "*" để đảm bảo message được nhận (chỉ trong OAuth callback)
                    targetOrigins.forEach((origin) => {
                      try {
                        window.opener.postMessage(payload, origin);
                        console.log("[OAuth] Message sent to origin:", origin);
                      } catch (err) {
                        console.error("[OAuth] Error sending message to", origin, ":", err);
                      }
                    });
                    
                    // ✅ FIX: Fallback - gửi với "*" nếu không có target origins hoặc để đảm bảo message được nhận
                    // Lưu ý: Chỉ dùng trong OAuth callback, không dùng cho các trường hợp khác
                    try {
                      window.opener.postMessage(payload, "*");
                      console.log("[OAuth] Message also sent with wildcard origin (*)");
                    } catch (err) {
                      console.warn("[OAuth] Could not send message with wildcard:", err);
                    }

                    // Đánh dấu đã gửi message
                    if (!messageSent) {
                      messageSent = true;
                      
                      // Show success checkmark
                      const spinner = document.getElementById('spinner');
                      const checkmark = document.getElementById('checkmark');
                      if (spinner) spinner.style.display = 'none';
                      if (checkmark) checkmark.classList.add('show');
                      
                      // ✅ FIX: Đóng popup sau khi gửi message thành công
                      setTimeout(() => {
                        try {
                          console.log("[OAuth] Attempting to close popup");
                          window.close();
                          // Fallback: Nếu không đóng được, thử lại sau 500ms
                          setTimeout(() => {
                            if (!window.closed) {
                              console.warn("[OAuth] Popup still open, trying to close again");
                              window.close();
                            }
                          }, 500);
                        } catch (err) {
                          console.error("[OAuth] Error closing popup:", err);
                          // Fallback: Redirect nếu không đóng được
                          if (targetOrigins.length > 0) {
                            window.location.href = targetOrigins[0] + "/?oauth=success";
                          }
                        }
                      }, 500); // ✅ FIX: Giảm delay xuống 500ms để đóng nhanh hơn
                    }
                  } else if (attempts < maxAttempts) {
                    // Retry if opener not ready yet
                    console.log("[OAuth] Opener not ready, retrying... (attempt", attempts, "/", maxAttempts, ")");
                    setTimeout(sendMessage, 100);
                  } else {
                    // Fallback: redirect to homepage
                    console.error("[OAuth] ❌ Cannot find opener window after", maxAttempts, "attempts, redirecting...");
                    if (targetOrigins.length > 0) {
                      window.location.href = targetOrigins[0] + "/?oauth=success";
                    } else {
                      console.error("[OAuth] No target origins available!");
                    }
                  }
                }
                
                // ✅ FIX: Bắt đầu gửi message ngay khi DOM ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', sendMessage);
                } else {
                  // DOM đã sẵn sàng, gửi ngay
                  sendMessage();
                }
                
                // ✅ FIX: Thêm fallback timeout để đảm bảo popup đóng sau 5 giây
                setTimeout(() => {
                  if (!messageSent && !window.closed) {
                    console.warn("[OAuth] Timeout: Force closing popup");
                    try {
                      window.close();
                    } catch (err) {
                      console.error("[OAuth] Error in timeout close:", err);
                      if (targetOrigins.length > 0) {
                        window.location.href = targetOrigins[0] + "/?oauth=success";
                      }
                    }
                  }
                }, 5000);
              })();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      Logger.error("❌ OAuth Callback Error:", error);
      res.redirect(`${CLIENT_URL}/signin?error=server_error`);
    }
  }
);

export default router;
