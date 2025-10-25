import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import Session from "../models/session.js";
// 1. Thêm import hàm gửi email (Giả sử đường dẫn này đúng)
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
// --- CONTROLLER ĐĂNG KÝ (SIGN UP) --- (HÀM ĐÃ SỬA)
// =============================================
export const signUp = async (req, res) => {
  console.log("--- Hàm signUp: Đã nhận được yêu cầu!");
  try {
    const { username, password, email, displayName } = req.body;
    console.log("--- Dữ liệu nhận được:", req.body);

    if (!username || !password || !email || !displayName) {
      console.log("--- BÁO CÁO: Dữ liệu đầu vào KHÔNG HỢP LỆ!");
      return res.status(400).json({
        message: "Không thể thiếu username, password, email, và displayName",
      });
    }

    // (Kiểm tra duplicate giữ nguyên)
    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      console.log("--- BÁO CÁO: Email đã tồn tại.");
      return res.status(409).json({ message: "Email này đã được sử dụng" });
    }
    const duplicateUsername = await User.findOne({ username });
    if (duplicateUsername) {
      console.log("--- BÁO CÁO: Username đã tồn tại.");
      return res.status(409).json({ message: "Username đã tồn tại" });
    }

    console.log("--- Bước 3: Bắt đầu băm mật khẩu và tạo token...");

    // 1. TẠO MỌI THỨ TRƯỚC
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 3600000); // 1 giờ

    console.log("--- Bước 4: Bắt đầu tạo user mới (Full data)...");

    // 2. TẠO USER 1 LẦN DUY NHẤT VỚI TẤT CẢ DỮ LIỆU
    const newUser = await User.create({
      username,
      hashedPassword,
      email,
      displayName,
      verificationToken, // <--- LƯU NGAY LẬP TỨC
      verificationTokenExpiresAt, // <--- LƯU NGAY LẬP TỨC
    });

    console.log("--- Bước 5: Đã tạo user và lưu token thành công!");

    // 3. Gọi hàm gửi email
    console.log("--- Bước 6: Đang gửi email xác thực...");
    // Gửi token (lấy từ biến, không phải từ newUser)
    await sendVerificationEmail(newUser.email, verificationToken);

    // 4. Trả về thành công
    console.log("--- Bước 7: Đã gửi email, trả về 201.");
    return res.sendStatus(201); // 201 Created
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER XÁC THỰC EMAIL ---
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
      console.log("--- BÁO CÁO: Token không hợp lệ hoặc đã hết hạn.");
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    console.log("--- THÀNH CÔNG: User đã xác thực email!");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Lỗi khi gọi verifyEmail", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =============================================
// --- CONTROLLER ĐĂNG NHẬP (SIGN IN) ---
// =============================================
export const signIn = async (req, res) => {
  console.log("--- Anh Đầu bếp signIn: Đã nhận được phiếu order!");
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Thiếu user name hoặc password." });
    }

    console.log("--- Bước 1: Đang tìm user trong kho...");
    const user = await User.findOne({ username }).select("+hashedPassword");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu chưa chính xác" });
    }

    // --- 7. Thêm kiểm tra: User đã xác thực email chưa? ---
    if (!user.isVerified) {
      console.log("--- BÁO CÁO: User cố đăng nhập nhưng chưa xác thực email.");
      return res
        .status(403)
        .json({ message: "Bạn cần xác thực email trước khi đăng nhập." });
    }

    console.log("--- Bước 2: Đã tìm thấy user, đang so sánh mật khẩu...");
    const passWordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passWordCorrect) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu chưa chính xác" });
    }

    console.log("--- Bước 3: Mật khẩu chính xác. Đang tạo tokens...");
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
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
  console.log("🍪 Cookies nhận được:", req.cookies); // ✅ Thêm log
  console.log("📋 Headers:", req.headers); // ✅ Thêm log
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
