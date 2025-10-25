// backesrc/routes/authRoute.js
import express from "express";
import passport from "passport";
import {
  signUp,
  signIn,
  signOut,
  refresh,
  verifyEmail,
} from "../controllers/authController.js";
const router = express.Router();
// --- NGƯỜI ĐƯA TIN CỦA BỒI BÀN ---
// "Bồi bàn" sẽ la lên trước khi chuyển phiếu cho "Đầu bếp"
router.use("/signup", (req, res, next) => {
  console.log(`📨 [ROUTER] ${req.method} ${req.originalUrl}`);
  next(); // Cho yêu cầu đi tiếp đến "Đầu bếp signUp"
});

// Quy tắc của Bồi bàn
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);

export default router;
