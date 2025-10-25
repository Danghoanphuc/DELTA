import express from "express";
import passport from "passport";
import crypto from "crypto";
import Session from "../models/session.js";
import { generateAccessToken } from "../controllers/authController.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

// --- Hàm tạo session và gửi token về frontend ---
const createSessionAndSendTokens = async (req, res, user) => {
  try {
    if (!user || !user._id) {
      console.error("❌ Không có user hợp lệ trong callback.");
      return res.redirect(`${CLIENT_URL}/auth/error`);
    }

    // Tạo access token
    const accessToken = generateAccessToken(user._id);
    // Tạo refresh token ngẫu nhiên
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Lưu session vào DB
    await Session.create({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Gửi cookie chứa refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // ✅ Gửi dữ liệu về popup frontend qua postMessage
    res.send(`
      <html>
        <body>
          <script>
            // Gửi thông tin user + token về tab gốc
            window.opener.postMessage(
              {
                accessToken: "${accessToken}",
                user: ${JSON.stringify(user)},
                success: true
              },
              "${CLIENT_URL}"
            );
            // Đóng popup sau khi gửi
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Lỗi khi tạo session/gửi token:", error);
    res.redirect(`${CLIENT_URL}/auth/error`);
  }
};

// --- Route khởi tạo đăng nhập Google ---
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// --- Route callback sau khi xác thực Google ---
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    console.log("✅ Google Callback thành công, user:", req.user);
    await createSessionAndSendTokens(req, res, req.user);
  }
);

export default router;
