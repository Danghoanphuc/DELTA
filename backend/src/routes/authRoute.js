// backend/src/routes/authRoute.js (ĐÃ SỬA LỖI 404)
import express from "express";
// (Bỏ import passport vì không dùng trực tiếp ở đây)
import {
  signUp,
  signIn, // signIn đã được import
  signOut,
  refresh,
  verifyEmail,
  signUpPrinter,
} from "../controllers/authController.js"; // Đảm bảo import signIn
const router = express.Router();

// Middleware cho /signup (Giữ nguyên)
router.use("/signup", (req, res, next) => {
  console.log(`📨 [ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});

// Định nghĩa các routes
router.post("/signup", signUp); // Đăng ký khách hàng
router.post("/signup-printer", signUpPrinter); // Đăng ký nhà in
router.post("/signin", signIn); // ✅ <-- THÊM LẠI DÒNG NÀY
router.post("/signout", signOut); // Đăng xuất
router.post("/refresh", refresh); // Làm mới token
router.post("/verify-email", verifyEmail); // Xác thực email

export default router;
