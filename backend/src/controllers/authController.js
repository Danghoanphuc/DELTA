// backend/src/controllers/authController.js (BẢN SỬA LỖI CUỐI CÙNG)

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import Session from "../models/session.js";
// ✅ ĐẢM BẢO IMPORT PrinterProfile (rất quan trọng)
import { PrinterProfile } from "../models/PrinterProfile.js";
import { sendVerificationEmail } from "../libs/email.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

// --- HÀM TIỆN ÍCH TẠO TOKEN ---
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

// =============================================
// --- CONTROLLER ĐĂNG KÝ (SIGN UP) ---
// (Đã đồng bộ với AuthFlow)
// =============================================
export const signUp = async (req, res) => {
  console.log("--- Hàm signUp: Đã nhận được yêu cầu!");
  try {
    // Frontend (AuthFlow) gửi 4 trường
    const { username, password, email, displayName } = req.body;
    console.log("--- Dữ liệu nhận được:", req.body);

    // (AuthFlow đảm bảo username == email)
    if (!password || !email || !displayName) {
      console.log("--- BÁO CÁO: Dữ liệu đầu vào KHÔNG HỢP LỆ!");
      return res.status(400).json({
        message: "Không thể thiếu password, email, và displayName",
      });
    }

    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      console.log("--- BÁO CÁO: Email đã tồn tại.");
      return res.status(409).json({ message: "Email này đã được sử dụng" });
    }

    console.log("--- Bước 3: Bắt đầu băm mật khẩu và tạo token...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 3600000);

    console.log("--- Bước 4: Bắt đầu tạo user mới...");

    const newUser = await User.create({
      username: email, // Bắt buộc gán username = email
      hashedPassword,
      email,
      displayName,
      verificationToken,
      verificationTokenExpiresAt,
      role: "customer",
    });

    console.log("--- Bước 5: Đã tạo user và lưu token thành công!");
    await sendVerificationEmail(newUser.email, verificationToken);
    return res.sendStatus(201);
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER XÁC THỰC EMAIL ---
// (Đã đồng bộ, trả về email)
// =============================================
export const verifyEmail = async (req, res) => {
  console.log("--- Hàm verifyEmail: Đã nhận được yêu cầu!");
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Thiếu token" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    }).select("+verificationToken +verificationTokenExpiresAt");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    console.log("--- THÀNH CÔNG: User đã xác thực email!");
    return res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Lỗi khi gọi verifyEmail", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER ĐĂNG NHẬP (SIGN IN) ---
// (Đã đồng bộ, CHỈ DÙNG EMAIL)
// =============================================
export const signIn = async (req, res) => {
  console.log("--- Anh Đầu bếp signIn: Đã nhận được phiếu order!");
  // ✅ <--- THÊM DÒNG NÀY ĐỂ DEBUG ---
  console.log("🔍 [signIn] Received req.body:", req.body);
  // ✅ <--- HẾT DÒNG THÊM ---
  try {
    // 1. Frontend (authService) gửi { email, password }
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("--- BÁO CÁO: Thiếu email hoặc password.");
      return res.status(400).json({ message: "Thiếu email hoặc password." });
    }

    console.log(
      `--- Bước 1: Đang tìm user trong kho (bằng email: ${email})...`
    );

    // 2. Tìm user bằng 'email'
    const user = await User.findOne({ email: email }).select("+hashedPassword");

    if (!user) {
      console.log(`--- BÁO CÁO: Không tìm thấy user với email: ${email}`);
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu chưa chính xác" });
    }

    // 3. Kiểm tra xác thực
    if (!user.isVerified) {
      console.log("--- BÁO CÁO: User cố đăng nhập nhưng chưa xác thực email.");
      return res
        .status(403)
        .json({ message: "Bạn cần xác thực email trước khi đăng nhập." });
    }

    console.log("--- Bước 2: Đã tìm thấy user, đang so sánh mật khẩu...");
    const passWordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passWordCorrect) {
      console.log("--- BÁO CÁO: Sai mật khẩu.");
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu chưa chính xác" });
    }

    console.log("--- Bước 3: Mật khẩu chính xác. Đang tạo tokens...");

    // 4. Tạo tokens (giữ nguyên)
    const accessToken = generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    console.log("--- Bước 4: Đã tạo tokens và gửi cookie. Trả về phản hồi.");
    res.status(200).json({
      message: `User ${user.displayName} đã logged In`,
      accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER LÀM MỚI (REFRESH) ---
// =============================================
export const refresh = async (req, res) => {
  console.log("🍪 Cookies nhận được:", req.cookies);
  // (Log headers không cần thiết, có thể xóa)
  // console.log("📋 Headers:", req.headers);
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      console.log("❌ Không tìm thấy refreshToken trong cookies");
      return res.status(401).json({ message: "Không được phép: Thiếu token" });
    }

    const session = await Session.findOne({ refreshToken: refreshToken });
    if (!session) {
      return res.status(403).json({
        message: "Không được phép: Token không hợp lệ hoặc đã bị thu hồi",
      });
    }

    if (new Date() > session.expireAt) {
      await Session.deleteOne({ _id: session._id });
      return res
        .status(403)
        .json({ message: "Hết hạn: Token đã hết hạn, vui lòng đăng nhập lại" });
    }

    const newAccessToken = generateAccessToken(session.userId);
    console.log("✅ Token đã được làm mới thành công!");
    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Lỗi khi refresh token", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER ĐĂNG XUẤT (SIGN OUT) ---
// =============================================
export const signOut = async (req, res) => {
  console.log("--- Hàm signOut: Đã nhận được yêu cầu!");
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
      console.log("[DEBUG] 🧹 Đã đăng xuất và xóa token/session.");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER ĐĂNG KÝ NHÀ IN ---
// (Đã đồng bộ)
// =============================================
export const signUpPrinter = async (req, res) => {
  console.log("--- Hàm signUpPrinter: Đã nhận được yêu cầu!");
  try {
    // Frontend (AuthFlow) gửi 3 trường này
    const { email, password, displayName } = req.body;
    console.log("--- Dữ liệu nhận được:", req.body);

    if (!password || !email || !displayName) {
      return res.status(400).json({
        message:
          "Không thể thiếu email, password, và Tên xưởng in (displayName)",
      });
    }

    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email này đã được sử dụng" });
    }

    console.log("--- Bước 3 (Printer): Băm mật khẩu và tạo token...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 3600000);

    console.log("--- Bước 4 (Printer): Bắt đầu tạo User (role: printer)...");

    const newUser = new User({
      username: email, // Bắt buộc gán username = email
      hashedPassword,
      email,
      displayName,
      role: "printer",
      verificationToken,
      verificationTokenExpiresAt,
    });

    console.log("--- Bước 5 (Printer): Bắt đầu tạo PrinterProfile...");

    const newProfile = new PrinterProfile({
      userId: newUser._id,
      businessName: displayName,
    });

    newUser.printerProfile = newProfile._id;

    await newUser.save();
    await newProfile.save();

    console.log("--- Bước 6 (Printer): Đã tạo User và Profile!");

    await sendVerificationEmail(newUser.email, verificationToken);

    return res.sendStatus(201);
  } catch (error) {
    console.error("Lỗi khi gọi signUpPrinter", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
