// src/modules/auth/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRepository } from "./auth.repository.js";
import { User } from "../../shared/models/user.model.js";
// ✅ BƯỚC 1: IMPORT MODEL MỚI
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";
// ❌ BƯỚC 2: XÓA IMPORT PRINTERPROFILE
// import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { sendVerificationEmail } from "../../infrastructure/email/email.service.js";
import {
  ValidationException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "../../shared/exceptions/index.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  generateAccessToken(userId) {
    return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  // ✅ BƯỚC 3: HỢP NHẤT HÀM SIGNUP
  async signUp(body) {
    const { email, password, displayName } = body;
    if (!password || !email || !displayName) {
      throw new ValidationException(
        "Thiếu thông tin email, mật khẩu hoặc tên hiển thị"
      );
    }

    const duplicateEmail = await this.authRepository.findUserByEmail(email);
    if (duplicateEmail) {
      throw new ConflictException("Email đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Bắt đầu một transaction (nếu có thể)
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
      // 1. Tạo User
      const newUser = new User({
        // username: (đã xóa)
        hashedPassword,
        email,
        displayName,
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 giờ
        // role: (đã xóa)
        printerProfileId: null, // Mặc định là null
      });

      // 2. Tạo CustomerProfile
      const newProfile = new CustomerProfile({
        userId: newUser._id,
        savedAddresses: [],
      });

      // 3. Liên kết User với CustomerProfile
      newUser.customerProfileId = newProfile._id;

      // 4. Lưu cả hai
      await newUser.save(/*{ session }*/);
      await newProfile.save(/*{ session }*/);

      // await session.commitTransaction();

      // 5. Gửi email
      await sendVerificationEmail(newUser.email, verificationToken);
      return newUser;
    } catch (error) {
      // await session.abortTransaction();
      throw error; // Ném lỗi để controller bắt
    } finally {
      // session.endSession();
    }
  }

  // ❌ BƯỚC 4: XÓA BỎ HÀM signUpPrinter
  // async signUpPrinter(body) { ... }

  // (Hàm verifyEmail giữ nguyên)
  async verifyEmail(token) {
    if (!token) {
      throw new ValidationException("Token là bắt buộc");
    }
    const user = await this.authRepository.findUserByVerificationToken(token);

    if (!user) {
      throw new NotFoundException(
        "Token không hợp lệ hoặc đã hết hạn",
        "Token"
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await this.authRepository.saveUser(user);

    return { email: user.email };
  }

  // ✅ BƯỚC 5: ĐƠN GIẢN HÓA HÀM signIn (Bỏ check role)
  async signIn(body) {
    const { email, password } = body;
    if (!email || !password) {
      throw new ValidationException("Email và mật khẩu là bắt buộc");
    }

    const user = await this.authRepository.findUserByEmail(
      email,
      "+hashedPassword"
    );
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        "Vui lòng xác thực email trước khi đăng nhập"
      );
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    // ❌ BỎ CHECK ROLE TẠI ĐÂY

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await this.authRepository.createSession({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Populate user với các profile (quan trọng)
    const userWithProfiles = await this.authRepository.findUserById(user._id);

    return { accessToken, refreshToken, user: userWithProfiles };
  }

  // (Hàm refresh giữ nguyên)
  async refresh(token) {
    if (!token) {
      throw new UnauthorizedException("Không có refresh token");
    }
    // ... logic refresh ...
    const session = await this.authRepository.findSessionByToken(token);
    if (!session) {
      throw new ForbiddenException("Token không hợp lệ hoặc đã bị thu hồi");
    }
    if (new Date() > session.expireAt) {
      await this.authRepository.deleteSession(session._id);
      throw new ForbiddenException("Token đã hết hạn, vui lòng đăng nhập lại");
    }
    const newAccessToken = this.generateAccessToken(session.userId);
    return { accessToken: newAccessToken };
  }

  // ✅ BƯỚC 6: ĐƠN GIẢN HÓA createOAuthSession (Bỏ logic role)
  async createOAuthSession(user) {
    // user đã được tìm hoặc tạo bởi passport (Giai đoạn 2.2)
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await this.authRepository.createSession({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Populate user đầy đủ trước khi trả về
    const userWithProfiles = await this.authRepository.findUserById(user._id);

    return { accessToken, refreshToken, user: userWithProfiles };
  }

  // (Hàm signOut giữ nguyên)
  async signOut(token) {
    if (token) {
      await this.authRepository.deleteSessionByToken(token);
    }
    return true;
  }
}
