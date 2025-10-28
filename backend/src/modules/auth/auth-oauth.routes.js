// src/modules/auth/auth-oauth.routes.js
import express from "express";
import passport from "passport";
import { AuthService } from "./auth.service.js";

const router = express.Router();
const authService = new AuthService();
const CLIENT_URL = process.env.CLIENT_URL;
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

// Google OAuth init
router.get("/google", (req, res, next) => {
  const role = req.query.role === "printer" ? "printer" : "customer";
  const state = `role=${role}`;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: state,
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

      // Send HTML with postMessage
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Đăng nhập thành công</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: "GOOGLE_AUTH_SUCCESS",
                  payload: ${JSON.stringify(result)}
                }, "${CLIENT_URL}");
                setTimeout(() => window.close(), 500);
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      res.redirect(`${CLIENT_URL}/signin?error=server_error`);
    }
  }
);

export default router;
