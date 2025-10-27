// backend/src/routes/authOAuthRoute.js (✅ FIXED VERSION)

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

// === HELPER FUNCTIONS ===

/**
 * Create session and send tokens to client via postMessage
 */
const createSessionAndSendTokens = async (req, res, user) => {
  try {
    if (!user || !user._id) {
      console.error("❌ Invalid user in OAuth callback");
      return res.redirect(`${CLIENT_URL}/signin?error=auth_failed`);
    }

    console.log("✅ User from Google OAuth:", user.email, "Role:", user.role);

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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
      path: "/",
    });

    console.log("✅ Refresh token cookie set");

    // 4. Populate printerProfile if user is printer
    let populatedUser = user;
    if (user.role === "printer" && user.printerProfile) {
      populatedUser = await user.populate("printerProfile");
    }

    // 5. Prepare user data for frontend
    const userData = {
      _id: populatedUser._id,
      email: populatedUser.email,
      displayName: populatedUser.displayName,
      role: populatedUser.role,
      avatarUrl: populatedUser.avatarUrl,
      isVerified: populatedUser.isVerified,
      printerProfile: populatedUser.printerProfile || null,
    };

    // 6. Send HTML with postMessage script
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f0f4f8; 
            }
            .container { 
              background: white; 
              padding: 2rem; 
              border-radius: 0.5rem; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
              text-align: center; 
            }
            h1 { 
              color: #1f2937; 
              margin: 0 0 0.5rem 0; 
              font-size: 1.5rem; 
            }
            p { 
              color: #6b7280; 
              margin: 0; 
              font-size: 0.9rem;
            }
            .spinner { 
              border: 4px solid #e5e7eb; 
              border-top: 4px solid #3b82f6; 
              border-radius: 50%; 
              width: 24px; 
              height: 24px; 
              animation: spin 1s linear infinite; 
              margin: 1rem auto; 
            }
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h1>Đăng nhập thành công!</h1>
            <p>Đang chuyển hướng...</p>
          </div>
          <script>
            console.log("🔄 [Popup] Sending data to parent window...");
            
            try {
              if (window.opener) {
                // Gửi message về parent window
                window.opener.postMessage(
                  {
                    type: "GOOGLE_AUTH_SUCCESS",
                    accessToken: "${accessToken}",
                    user: ${JSON.stringify(userData)}
                  },
                  "${CLIENT_URL}"
                );
                console.log("✅ [Popup] PostMessage sent to ${CLIENT_URL}");
                
                // Đợi 1 giây để đảm bảo message được nhận
                setTimeout(() => {
                  console.log("🔒 [Popup] Closing popup...");
                  window.close();
                }, 1000);
              } else {
                console.error("❌ [Popup] window.opener not found");
                document.body.innerHTML = '<div class="container"><h1>Lỗi</h1><p>Không thể kết nối với cửa sổ chính. Vui lòng đóng tab này và thử lại.</p></div>';
              }
            } catch (error) {
              console.error("❌ [Popup] Error:", error);
              document.body.innerHTML = '<div class="container"><h1>Lỗi</h1><p>Đã xảy ra lỗi. Vui lòng đóng tab này và thử lại.</p></div>';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error creating session/sending tokens:", error);
    res.redirect(`${CLIENT_URL}/signin?error=server_error`);
  }
};

// === ROUTES ===

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google?role=customer (hoặc role=printer)
// @access  Public
router.get("/google", (req, res, next) => {
  // Lấy role từ query parameter
  const role = req.query.role === "printer" ? "printer" : "customer";
  console.log(`🔐 OAuth: Starting authentication for role: ${role}`);

  // Truyền role qua state parameter của OAuth
  // State sẽ được Google trả về trong callback
  const state = `role=${role}`;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: state, // Truyền state vào OAuth flow
  })(req, res, next);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/signin?error=auth_failed`,
  }),
  async (req, res) => {
    console.log("✅ Google OAuth callback successful");
    console.log("👤 User:", req.user?.email, "Role:", req.user?.role);

    // Gọi hàm helper để tạo session và gửi tokens
    await createSessionAndSendTokens(req, res, req.user);
  }
);

export default router;
