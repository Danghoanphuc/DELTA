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
  async (req, res, next) => {
    try {
      Logger.info(
        `[OAuth] Callback triggered for user: ${req.user?.email || "unknown"}`
      );
      Logger.info(`[OAuth] Request origin: ${req.get("origin") || "none"}`);
      Logger.info(`[OAuth] Request referer: ${req.get("referer") || "none"}`);
      Logger.info(`[OAuth] CLIENT_ORIGINS: ${JSON.stringify(CLIENT_ORIGINS)}`);

      // ✅ FIXED: Validate req.user exists
      if (!req.user) {
        Logger.error("[OAuth] ❌ req.user is null or undefined");
        const errorPayload = {
          success: false,
          message: "Xác thực thất bại",
        };
        return res.send(`
<!DOCTYPE html>
<html>
<head><title>Lỗi đăng nhập</title><meta charset="UTF-8"></head>
<body>
  <script>
    const payload = ${JSON.stringify(errorPayload)};
    const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
    if (window.opener && !window.opener.closed) {
      targetOrigins.forEach(origin => {
        try { window.opener.postMessage(payload, origin); } catch(e) {}
      });
      try { window.opener.postMessage(payload, "*"); } catch(e) {}
    }
    setTimeout(() => { try { window.close(); } catch(e) { window.location.href = "${CLIENT_URL}/signin?error=auth_failed"; } }, 100);
  </script>
</body>
</html>
        `);
      }

      if (!req.user._id) {
        Logger.error("[OAuth] ❌ req.user._id is missing");
        const errorPayload = {
          success: false,
          message: "Dữ liệu người dùng không hợp lệ",
        };
        return res.send(`
<!DOCTYPE html>
<html>
<head><title>Lỗi đăng nhập</title><meta charset="UTF-8"></head>
<body>
  <script>
    const payload = ${JSON.stringify(errorPayload)};
    const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
    if (window.opener && !window.opener.closed) {
      targetOrigins.forEach(origin => {
        try { window.opener.postMessage(payload, origin); } catch(e) {}
      });
      try { window.opener.postMessage(payload, "*"); } catch(e) {}
    }
    setTimeout(() => { try { window.close(); } catch(e) { window.location.href = "${CLIENT_URL}/signin?error=auth_failed"; } }, 100);
  </script>
</body>
</html>
        `);
      }

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

      // ✅ FIX: Simplified HTML with better error handling
      res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Đăng nhập thành công</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
    p { margin: 0; opacity: 0.9; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Đăng nhập thành công!</h1>
    <p>Đang chuyển hướng...</p>
  </div>
  <script>
    (function() {
      const payload = ${JSON.stringify(payload)};
      const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
      
      console.log("[OAuth] ✅ Callback script started");
      console.log("[OAuth] Target origins:", targetOrigins);
      console.log("[OAuth] Payload:", payload);
      console.log("[OAuth] Window opener exists:", !!window.opener);
      
      function sendAndClose() {
        // Kiểm tra opener
        if (!window.opener || window.opener.closed) {
          console.warn("[OAuth] ⚠️ No opener window, redirecting...");
          if (targetOrigins.length > 0) {
            // Store token in sessionStorage for fallback
            try {
              sessionStorage.setItem('oauth_token', payload.accessToken);
            } catch(e) {}
            window.location.href = targetOrigins[0] + "/?oauth=success";
          }
          return;
        }
        
        // Gửi message đến tất cả origins
        console.log("[OAuth] 📤 Sending messages...");
        let sent = false;
        
        targetOrigins.forEach(origin => {
          try {
            window.opener.postMessage(payload, origin);
            console.log("[OAuth] ✅ Sent to:", origin);
            sent = true;
          } catch (e) {
            console.warn("[OAuth] ⚠️ Failed to send to", origin, ":", e.message);
          }
        });
        
        // Gửi với wildcard để đảm bảo
        try {
          window.opener.postMessage(payload, "*");
          console.log("[OAuth] ✅ Sent with wildcard");
          sent = true;
        } catch (e) {
          console.warn("[OAuth] ⚠️ Failed wildcard:", e.message);
        }
        
        if (!sent) {
          console.error("[OAuth] ❌ Failed to send any messages");
        }
        
        // Đóng popup sau delay ngắn
        setTimeout(() => {
          console.log("[OAuth] 🚪 Closing popup...");
          try {
            window.close();
            // Fallback nếu không đóng được
            setTimeout(() => {
              if (!window.closed && targetOrigins.length > 0) {
                console.warn("[OAuth] ⚠️ Cannot close, redirecting...");
                window.location.href = targetOrigins[0] + "/?oauth=success";
              }
            }, 500);
          } catch (err) {
            console.error("[OAuth] ❌ Error closing:", err);
            if (targetOrigins.length > 0) {
              window.location.href = targetOrigins[0] + "/?oauth=success";
            }
          }
        }, 200); // Tăng delay lên 200ms để đảm bảo message được gửi
      }
      
      // Chạy khi DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sendAndClose);
      } else {
        sendAndClose();
      }
      
      // Fallback timeout
      setTimeout(() => {
        if (!window.closed && targetOrigins.length > 0) {
          console.warn("[OAuth] ⏱️ Timeout, redirecting...");
          window.location.href = targetOrigins[0] + "/?oauth=success";
        }
      }, 3000);
    })();
  </script>
</body>
</html>
      `);
    } catch (error) {
      Logger.error("❌ OAuth Callback Error:", error);
      Logger.error("❌ OAuth Error Stack:", error.stack);
      Logger.error("❌ OAuth Error Details:", {
        message: error.message,
        name: error.name,
        code: error.code,
      });

      // ✅ FIXED: Nếu response đã được gửi, không redirect nữa
      if (res.headersSent) {
        Logger.warn("[OAuth] Response already sent, cannot redirect");
        return;
      }

      // ✅ FIXED: Trả về HTML với error message thay vì redirect
      // Vì đây là popup window, redirect có thể không hoạt động tốt
      const errorPayload = {
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Có lỗi xảy ra, vui lòng thử lại sau."
            : error.message || "Lỗi xác thực",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };

      res.status(500).send(`
<!DOCTYPE html>
<html>
<head>
  <title>Lỗi đăng nhập</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
    p { margin: 0; opacity: 0.9; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>Đăng nhập thất bại</h1>
    <p>${errorPayload.message}</p>
  </div>
  <script>
    (function() {
      const payload = ${JSON.stringify(errorPayload)};
      const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
      
      console.error("[OAuth] ❌ Error:", payload);
      
      function sendErrorAndClose() {
        if (window.opener && !window.opener.closed) {
          console.log("[OAuth] 📤 Sending error to opener...");
          targetOrigins.forEach(origin => {
            try {
              window.opener.postMessage(payload, origin);
              console.log("[OAuth] ✅ Sent error to:", origin);
            } catch (e) {
              console.warn("[OAuth] ⚠️ Failed to send error to", origin);
            }
          });
          
          try {
            window.opener.postMessage(payload, "*");
            console.log("[OAuth] ✅ Sent error with wildcard");
          } catch (e) {
            console.warn("[OAuth] ⚠️ Failed wildcard");
          }
        }
        
        setTimeout(() => {
          try {
            window.close();
            setTimeout(() => {
              if (!window.closed && targetOrigins.length > 0) {
                window.location.href = targetOrigins[0] + "/signin?error=server_error";
              }
            }, 500);
          } catch (e) {
            if (targetOrigins.length > 0) {
              window.location.href = targetOrigins[0] + "/signin?error=server_error";
            }
          }
        }, 200);
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sendErrorAndClose);
      } else {
        sendErrorAndClose();
      }
      
      setTimeout(() => {
        if (!window.closed && targetOrigins.length > 0) {
          window.location.href = targetOrigins[0] + "/signin?error=server_error";
        }
      }, 3000);
    })();
  </script>
</body>
</html>
      `);
    }
  }
);

export default router;
