// backend/src/routes/authOAuthRoute.js

import express from "express";
import passport from "passport";
import crypto from "crypto";
import Session from "../models/session.js";
import { generateAccessToken } from "../controllers/authController.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Lấy CLIENT_URL từ biến môi trường, đảm bảo nó đúng với URL frontend của bạn
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

// === HELPER FUNCTIONS ===

/**
 * Create session and send tokens to client via postMessage
 */
const createSessionAndSendTokens = async (req, res, user) => {
  try {
    if (!user || !user._id) {
      console.error("❌ Invalid user in OAuth callback");
      // Redirect về trang frontend với thông báo lỗi
      return res.redirect(`${CLIENT_URL}/signin?error=auth_failed`);
    }

    console.log("✅ User from Google OAuth:", user.email);

    // 1. Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // 2. Save session to database
    await Session.create({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    console.log("✅ Session created for user:", user._id);

    // 3. Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Quan trọng cho cross-site cookies
      maxAge: REFRESH_TOKEN_TTL,
      path: "/", // Đảm bảo cookie có sẵn trên toàn bộ domain
    });

    console.log("✅ Refresh token cookie set");

    // 4. Send data to popup via postMessage
    const userData = {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
    };

    // Gửi HTML chứa script postMessage về cho popup
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
           <style>
             /* (Style giữ nguyên như cũ) */
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f4f8; }
            .container { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.5rem; }
            p { color: #6b7280; margin: 0; font-size: 0.9rem;}
            .spinner { border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 1rem auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
           <div class="container">
             <div class="spinner"></div>
             <h1>Authentication successful!</h1>
             <p>Please wait while we redirect you...</p>
           </div>
          <script>
            console.log("🔄 [Popup] Sending data to parent window...");
            // Gửi dữ liệu về cửa sổ chính (opener)
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "GOOGLE_AUTH_SUCCESS", // Loại message
                  accessToken: "${accessToken}", // Access token
                  user: ${JSON.stringify(userData)} // Dữ liệu user
                },
                "${CLIENT_URL}" // Chỉ gửi đến origin của frontend
              );
              console.log("✅ [Popup] PostMessage sent to ${CLIENT_URL}");

              // ---> XÓA DÒNG NÀY ĐỂ TRÁNH LỖI COOP <---
              // setTimeout(() => {
              //   window.close();
              // }, 500); // Đóng popup sau khi gửi
              // ---> KẾT THÚC XÓA <---

            } else {
              // Xử lý lỗi nếu không tìm thấy cửa sổ cha
              console.error("❌ [Popup] window.opener not found. Cannot send message.");
              document.body.innerHTML = '<div class="container"><h1>Error</h1><p>Could not communicate with the main window. Please close this window and try again.</p></div>';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error creating session/sending tokens:", error);
    // Redirect về trang frontend với thông báo lỗi
    res.redirect(`${CLIENT_URL}/signin?error=server_error`);
  }
};

// Middleware để lưu lại role người dùng chọn khi bắt đầu OAuth
const rememberOAuthRole = (req, res, next) => {
  const role = req.query.role === "printer" ? "printer" : "customer";
  // Lưu vào session của Express
  req.session.oauthRole = role;
  console.log(`🔐 OAuth: Remembering role: ${role}`);
  next();
};

// === ROUTES ===

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get(
  "/google",
  rememberOAuthRole, // Chạy middleware này trước
  passport.authenticate("google", {
    scope: ["profile", "email"], // Yêu cầu quyền truy cập profile và email
    session: false, // Không dùng session của Passport sau khi xác thực
  })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false, // Không tạo session Passport
    failureRedirect: `${CLIENT_URL}/signin?error=auth_failed`, // Redirect về frontend nếu lỗi
  }),
  // Middleware chạy sau khi authenticate thành công
  async (req, res) => {
    // req.user chứa thông tin user từ hàm findOrCreateUser
    console.log("✅ Google OAuth callback successful, user:", req.user?.email);
    // Gọi hàm helper để tạo session, set cookie và gửi postMessage
    await createSessionAndSendTokens(req, res, req.user);
  }
);

export default router;
