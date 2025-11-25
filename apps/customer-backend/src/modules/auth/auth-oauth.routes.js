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
      Logger.info(`[OAuth] Callback triggered for user: ${req.user?.email || 'unknown'}`);
      Logger.info(`[OAuth] Request origin: ${req.get('origin') || 'none'}`);
      Logger.info(`[OAuth] Request referer: ${req.get('referer') || 'none'}`);
      Logger.info(`[OAuth] CLIENT_ORIGINS: ${JSON.stringify(CLIENT_ORIGINS)}`);

      // ✅ FIXED: Validate req.user exists
      if (!req.user) {
        Logger.error("[OAuth] ❌ req.user is null or undefined");
        return res.redirect(`${CLIENT_URL}/signin?error=auth_failed`);
      }

      if (!req.user._id) {
        Logger.error("[OAuth] ❌ req.user._id is missing");
        return res.redirect(`${CLIENT_URL}/signin?error=auth_failed`);
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

      // ✅ FIX: Đơn giản hóa hoàn toàn - bỏ HTML/CSS phức tạp, chỉ giữ script
      // Send minimal HTML response with postMessage script
      res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Đăng nhập thành công</title>
  <meta charset="UTF-8">
</head>
<body>
  <script>
    (function() {
      const payload = ${JSON.stringify(payload)};
      const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
      
      console.log("[OAuth] Callback script started");
      console.log("[OAuth] Target origins:", targetOrigins);
      console.log("[OAuth] Payload:", payload);
      console.log("[OAuth] Window opener:", window.opener ? "exists" : "null");
      console.log("[OAuth] Window closed:", window.closed);
      
      function sendAndClose() {
        // Kiểm tra opener
        if (!window.opener) {
          console.error("[OAuth] ❌ No opener window found");
          if (targetOrigins.length > 0) {
            console.log("[OAuth] Redirecting to:", targetOrigins[0] + "/?oauth=success");
            window.location.href = targetOrigins[0] + "/?oauth=success";
          }
          return;
        }
        
        if (window.opener.closed) {
          console.error("[OAuth] ❌ Opener window is closed");
          if (targetOrigins.length > 0) {
            console.log("[OAuth] Redirecting to:", targetOrigins[0] + "/?oauth=success");
            window.location.href = targetOrigins[0] + "/?oauth=success";
          }
          return;
        }
        
        // Gửi message ngay lập tức
        console.log("[OAuth] ✅ Sending messages...");
        
        // Gửi đến tất cả target origins
        targetOrigins.forEach(origin => {
          try {
            window.opener.postMessage(payload, origin);
            console.log("[OAuth] ✅ Sent to origin:", origin);
          } catch (e) {
            console.warn("[OAuth] ⚠️ Failed to send to", origin, ":", e.message);
          }
        });
        
        // ✅ CRITICAL: Gửi với wildcard để đảm bảo message được nhận
        try {
          window.opener.postMessage(payload, "*");
          console.log("[OAuth] ✅ Sent with wildcard (*)");
        } catch (e) {
          console.warn("[OAuth] ⚠️ Failed to send with wildcard:", e.message);
        }
        
        // Đóng popup ngay lập tức (delay tối thiểu)
        setTimeout(() => {
          try {
            console.log("[OAuth] Attempting to close popup...");
            window.close();
            
            // Kiểm tra xem đã đóng chưa
            setTimeout(() => {
              if (!window.closed) {
                console.warn("[OAuth] ⚠️ Popup still open, trying again...");
                window.close();
                
                // Nếu vẫn không đóng được sau 1 giây, redirect
                setTimeout(() => {
                  if (!window.closed && targetOrigins.length > 0) {
                    console.warn("[OAuth] ⚠️ Cannot close popup, redirecting...");
                    window.location.href = targetOrigins[0] + "/?oauth=success";
                  }
                }, 1000);
              } else {
                console.log("[OAuth] ✅ Popup closed successfully");
              }
            }, 100);
          } catch (err) {
            console.error("[OAuth] ❌ Error closing popup:", err);
            // Fallback: redirect
            if (targetOrigins.length > 0) {
              window.location.href = targetOrigins[0] + "/?oauth=success";
            }
          }
        }, 50); // ✅ FIX: Delay tối thiểu 50ms
      }
      
      // Chạy ngay khi script load (không đợi DOM)
      sendAndClose();
      
      // ✅ FIX: Fallback timeout - nếu sau 2 giây vẫn chưa đóng, redirect
      setTimeout(() => {
        if (!window.closed) {
          console.warn("[OAuth] ⚠️ Timeout: Popup still open after 2s, redirecting...");
          if (targetOrigins.length > 0) {
            window.location.href = targetOrigins[0] + "/?oauth=success";
          }
        }
      }, 2000);
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
        message: process.env.NODE_ENV === "production" 
          ? "Có lỗi xảy ra, vui lòng thử lại sau."
          : error.message || "Lỗi xác thực",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      };

      res.status(500).send(`
<!DOCTYPE html>
<html>
<head>
  <title>Lỗi đăng nhập</title>
  <meta charset="UTF-8">
</head>
<body>
  <script>
    (function() {
      const payload = ${JSON.stringify(errorPayload)};
      const targetOrigins = ${JSON.stringify(CLIENT_ORIGINS)};
      
      console.error("[OAuth] ❌ Error payload:", payload);
      
      function sendErrorAndClose() {
        if (window.opener && !window.opener.closed) {
          targetOrigins.forEach(origin => {
            try {
              window.opener.postMessage(payload, origin);
            } catch (e) {
              console.warn("[OAuth] Failed to send error to", origin);
            }
          });
          
          try {
            window.opener.postMessage(payload, "*");
          } catch (e) {
            console.warn("[OAuth] Failed to send error with wildcard");
          }
        }
        
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            if (targetOrigins.length > 0) {
              window.location.href = targetOrigins[0] + "/signin?error=server_error";
            }
          }
        }, 100);
      }
      
      sendErrorAndClose();
    })();
  </script>
</body>
</html>
      `);
    }
  }
);

export default router;
