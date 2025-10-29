// src/modules/auth/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRepository } from "./auth.repository.js";
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { sendVerificationEmail } from "../../infrastructure/email/email.service.js"; // Giả sử lib email ở /src/libs
import {
  ValidationException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "../../shared/exceptions/index.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  generateAccessToken(userId) {
    return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

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

    const newUser = await this.authRepository.createUser({
      username: email,
      hashedPassword,
      email,
      displayName,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 giờ
      role: "customer",
    });

    await sendVerificationEmail(newUser.email, verificationToken);
    return newUser;
  }

  async signUpPrinter(body) {
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

    // Dùng transaction (nếu có) sẽ tốt hơn, ở đây làm tuần tự
    const newUser = new User({
      username: email,
      hashedPassword,
      email,
      displayName,
      role: "printer",
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 3600000),
    });

    const newProfile = new PrinterProfile({
      userId: newUser._id,
      businessName: displayName,
    });

    newUser.printerProfile = newProfile._id;

    // Lưu cả hai
    await newUser.save();
    await newProfile.save();

    await sendVerificationEmail(newUser.email, verificationToken);
    return newUser;
  }

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

    // [FIX] Automatically update role for legacy printer accounts upon login
    if (user.printerProfile && user.role !== "printer") {
      console.log(`[AuthService] Updating role for printer: ${user.email}`);
      user.role = "printer";
      await this.authRepository.saveUser(user);
    }

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await this.authRepository.createSession({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Loại bỏ password trước khi trả về
    user.hashedPassword = undefined;

    return { accessToken, refreshToken, user };
  }

  async refresh(token) {
    if (!token) {
      throw new UnauthorizedException("Không có refresh token");
    }

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

  async createOAuthSession(user) {
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await this.authRepository.createSession({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Convert to plain object and remove sensitive data
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.hashedPassword;
    delete userObject.verificationToken;
    delete userObject.verificationTokenExpiresAt;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetTokenExpiresAt;

    return { accessToken, refreshToken, user: userObject };
  }

  async signOut(token) {
    if (token) {
      await this.authRepository.deleteSessionByToken(token);
    }
    return true;
  }
}
