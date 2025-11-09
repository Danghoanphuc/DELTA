// backend/src/modules/auth/auth.service.js
// ✅ FIXED: Always creates CustomerProfile for new users

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRepository } from "./auth.repository.js";
import { User } from "../../shared/models/user.model.js";
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";
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

  /**
   * Generate JWT access token
   */
  generateAccessToken(userId) {
    return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  /**
   * Sign up new user (always creates CustomerProfile)
   */
  async signUp(body) {
    const { email, password, displayName } = body;

    // Validate input
    if (!password || !email || !displayName) {
      throw new ValidationException(
        "Thiếu thông tin email, mật khẩu hoặc tên hiển thị"
      );
    }

    // Check for duplicate email
    const duplicateEmail = await this.authRepository.findUserByEmail(email);
    if (duplicateEmail) {
      throw new ConflictException("Email đã được sử dụng");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    try {
      // Step 1: Create User
      const newUser = new User({
        hashedPassword,
        email,
        displayName,
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
        authMethod: "local",
        printerProfileId: null,
        customerProfileId: null, // Will be set in next step
      });

      // Step 2: Create CustomerProfile
      const newProfile = new CustomerProfile({
        userId: newUser._id,
        savedAddresses: [],
      });

      // Step 3: Link User with CustomerProfile
      newUser.customerProfileId = newProfile._id;

      // Step 4: Save both
      await newUser.save();
      await newProfile.save();

      // Step 5: Send verification email
      await sendVerificationEmail(newUser.email, verificationToken);

      console.log(`✅ [Auth] New user created: ${newUser.email}`);
      console.log(`✅ [Auth] CustomerProfile created for ${newUser.email}`);

      return newUser;
    } catch (error) {
      console.error("❌ [Auth] Sign up error:", error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
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

    // Verify email
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await this.authRepository.saveUser(user);

    console.log(`✅ [Auth] Email verified for user: ${user.email}`);

    return { email: user.email };
  }

  /**
   * Sign in user
   */
  async signIn(body) {
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      throw new ValidationException("Email và mật khẩu là bắt buộc");
    }

    // Find user with password
    const user = await this.authRepository.findUserByEmail(
      email,
      "+hashedPassword"
    );

    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ForbiddenException(
        "Vui lòng xác thực email trước khi đăng nhập"
      );
    }

    // Verify password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create session
    await this.authRepository.createSession({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Populate user with profiles
    const userWithProfiles = await this.authRepository.findUserById(user._id);

    console.log(`✅ [Auth] User signed in: ${user.email}`);

    return { accessToken, refreshToken, user: userWithProfiles };
  }

  /**
   * Refresh access token
   */
  async refresh(token) {
    if (!token) {
      throw new UnauthorizedException("Không có refresh token");
    }

    // Find session
    const session = await this.authRepository.findSessionByToken(token);
    if (!session) {
      throw new ForbiddenException("Token không hợp lệ hoặc đã bị thu hồi");
    }

    // Check expiration
    if (new Date() > session.expireAt) {
      await this.authRepository.deleteSession(session._id);
      throw new ForbiddenException("Token đã hết hạn, vui lòng đăng nhập lại");
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(session.userId);

    console.log(`✅ [Auth] Token refreshed for user: ${session.userId}`);

    return { accessToken: newAccessToken };
  }

  /**
   * Create OAuth session (for Google login)
   */
  async createOAuthSession(user) {
    // User is already found/created by passport
    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create session
    await this.authRepository.createSession({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Populate user with profiles
    const userWithProfiles = await this.authRepository.findUserById(user._id);

    console.log(`✅ [Auth] OAuth session created for user: ${user.email}`);

    return { accessToken, refreshToken, user: userWithProfiles };
  }

  /**
   * Sign out user
   */
  async signOut(token) {
    if (token) {
      await this.authRepository.deleteSessionByToken(token);
      console.log(`✅ [Auth] User signed out`);
    }
    return true;
  }
}
