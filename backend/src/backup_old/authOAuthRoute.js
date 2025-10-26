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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
      path: "/",
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

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sign in successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
            }
            .success {
              color: #10b981;
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #1f2937;
              margin: 0 0 0.5rem 0;
            }
            p {
              color: #6b7280;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Sign in successful!</h1>
            <p>Redirecting...</p>
          </div>
          <script>
            console.log("🔄 Sending data to parent window...");
            
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "GOOGLE_AUTH_SUCCESS",
                  accessToken: "${accessToken}",
                  user: ${JSON.stringify(userData)}
                },
                "${CLIENT_URL}"
              );
              console.log("✅ PostMessage sent");
              
              setTimeout(() => {
                window.close();
              }, 500);
            } else {
              console.error("❌ window.opener not found");
              alert("Error: Could not connect to main window. Please try again.");
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

// Remember OAuth role middleware
const rememberOAuthRole = (req, res, next) => {
  const role = req.query.role === "printer" ? "printer" : "customer";
  req.session.oauthRole = role;
  console.log(`🔐 OAuth: Saving role: ${role}`);
  next();
};

// === ROUTES ===

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get(
  "/google",
  rememberOAuthRole,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

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
    console.log("✅ Google OAuth callback successful, user:", req.user?.email);
    await createSessionAndSendTokens(req, res, req.user);
  }
);

export default router;
