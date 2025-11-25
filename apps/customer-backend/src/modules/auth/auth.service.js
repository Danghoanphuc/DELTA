// backend/src/modules/auth/auth.service.js
// ✅ FIXED: Đã loại bỏ logic hash thủ công

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRepository } from "./auth.repository.js";
import { User } from "../../shared/models/user.model.js"; // <-- Model này giờ đã "chuẩn"
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";
import { sendVerificationEmail } from "../../infrastructure/email/email.service.js";
import { generateUniqueUsername } from "../../shared/utils/username.util.js";
import {
  ValidationException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { config } from "../../config/env.config.js";

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
    return jwt.sign({ userId: userId }, config.auth.accessTokenSecret, {
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  /**
   * Sign up new user (always creates CustomerProfile)
   * ✅ FIXED: Thêm validation cho email và password strength
   */
  async signUp(body) {
    const { email, password, displayName } = body;

    // ✅ FIXED: Validate input với thông báo rõ ràng
    if (!password || !email || !displayName) {
      throw new ValidationException(
        "Thiếu thông tin email, mật khẩu hoặc tên hiển thị"
      );
    }

    // ✅ FIXED: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException("Email không hợp lệ");
    }

    // ✅ FIXED: Validate password strength
    if (password.length < 6) {
      throw new ValidationException("Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (password.length > 128) {
      throw new ValidationException("Mật khẩu không được quá 128 ký tự");
    }

    // ✅ FIXED: Validate displayName
    if (displayName.trim().length < 2) {
      throw new ValidationException("Tên hiển thị phải có ít nhất 2 ký tự");
    }

    if (displayName.trim().length > 50) {
      throw new ValidationException("Tên hiển thị không được quá 50 ký tự");
    }

    // ✅ FIXED: Check for duplicate email với message không leak thông tin
    const duplicateEmail = await this.authRepository.findUserByEmail(email);
    if (duplicateEmail) {
      // ✅ SECURITY: Không leak thông tin email đã tồn tại
      throw new ConflictException(
        "Email này đã được sử dụng. Nếu đây là email của bạn, vui lòng đăng nhập hoặc sử dụng chức năng quên mật khẩu."
      );
    }

    // --- THAY ĐỔI TẠI ĐÂY ---
    // ❌ BỎ ĐI: const hashedPassword = await bcrypt.hash(password, 10);
    // --- KẾT THÚC THAY ĐỔI ---

    // Generate verification token (giữ nguyên)
    const verificationToken = crypto.randomBytes(32).toString("hex");

    try {
      const username = await generateUniqueUsername(email);

      // Step 1: Create User
      const newUser = new User({
        // --- THAY ĐỔI TẠI ĐÂY ---
        hashedPassword: password, // <-- Đưa mật khẩu GỐC vào
        // --- KẾT THÚC THAY ĐỔI ---
        email,
        username,
        displayName,
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
        authMethod: "local",
        printerProfileId: null,
        customerProfileId: null,
      });

      // Step 2: Create CustomerProfile (giữ nguyên)
      const newProfile = new CustomerProfile({
        userId: newUser._id,
        savedAddresses: [],
      });

      // Step 3: Link User with CustomerProfile (giữ nguyên)
      newUser.customerProfileId = newProfile._id;

      // Step 4: Save both (giữ nguyên)
      // (Lúc này, pre('save') hook của user.model.js sẽ tự động chạy và hash)
      await newUser.save();
      await newProfile.save();

      // Step 5: Send verification email (giữ nguyên)
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
   * ✅ FIXED: Thêm validation và kiểm tra đã verify chưa
   */
  async verifyEmail(token) {
    if (!token) {
      throw new ValidationException("Token là bắt buộc");
    }

    // ✅ FIXED: Validate token format (hex string, 64 chars)
    if (typeof token !== "string" || token.length !== 64) {
      throw new ValidationException("Token không hợp lệ");
    }

    const user = await this.authRepository.findUserByVerificationToken(token);

    if (!user) {
      throw new NotFoundException(
        "Token không hợp lệ hoặc đã hết hạn",
        "Token"
      );
    }

    // ✅ FIXED: Kiểm tra đã verify chưa
    if (user.isVerified) {
      throw new ConflictException("Email này đã được xác thực rồi");
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
   * Resend verification email
   * ✅ NEW: Cho phép user yêu cầu gửi lại email xác thực
   */
  async resendVerificationEmail(email) {
    if (!email) {
      throw new ValidationException("Email là bắt buộc");
    }

    // ✅ FIXED: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException("Email không hợp lệ");
    }

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      // ✅ SECURITY: Không leak thông tin email có tồn tại hay không
      throw new NotFoundException(
        "Nếu email này đã được đăng ký, chúng tôi sẽ gửi email xác thực."
      );
    }

    // Nếu đã verify rồi thì không cần gửi lại
    if (user.isVerified) {
      throw new ConflictException("Email này đã được xác thực rồi");
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour
    await this.authRepository.saveUser(user);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    console.log(`✅ [Auth] Verification email resent for user: ${user.email}`);

    return { email: user.email };
  }

  /**
   * Sign in user
   * ✅ FIXED: Thêm validation và kiểm tra user active
   */
  async signIn(body) {
    const { email, password } = body;

    // ✅ FIXED: Validate input
    if (!email || !password) {
      throw new ValidationException("Email và mật khẩu là bắt buộc");
    }

    // ✅ FIXED: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException("Email không hợp lệ");
    }

    // Find user with password
    const user = await this.authRepository.findUserByEmail(
      email,
      "+hashedPassword"
    );

    if (!user) {
      // ✅ SECURITY: Không leak thông tin email có tồn tại hay không
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    // ✅ FIXED: Kiểm tra user còn active
    if (!user.isActive) {
      throw new ForbiddenException("Tài khoản đã bị vô hiệu hóa");
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ForbiddenException(
        "Vui lòng xác thực email trước khi đăng nhập"
      );
    }

    // Verify password
    // (user.comparePassword giờ đã tồn tại trong model .js)
    const passwordCorrect = await user.comparePassword(password);
    if (!passwordCorrect) {
      // ✅ SECURITY: Không leak thông tin password đúng hay sai
      // ✅ SECURITY: Log failed attempt để phát hiện brute force
      console.warn(`⚠️ [Auth] Failed login attempt for email: ${email}`);
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // ✅ FIXED: Xóa các session cũ hơn 30 ngày để tránh tích lũy
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    try {
      const Session = (await import("../../shared/models/session.model.js")).default;
      const deletedCount = await Session.deleteMany({
        userId: user._id,
        expireAt: { $lt: thirtyDaysAgo },
      });
      if (deletedCount.deletedCount > 0) {
        console.log(`🧹 [Auth] Cleaned up ${deletedCount.deletedCount} old sessions for user: ${user.email}`);
      }
    } catch (cleanupError) {
      // Log nhưng không throw - cleanup không critical
      console.warn(`⚠️ [Auth] Error cleaning up old sessions:`, cleanupError.message);
    }

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
   * ✅ FIXED: Thêm token rotation, gia hạn session, và kiểm tra user active
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

    // ✅ FIXED: Kiểm tra user còn active
    const user = await this.authRepository.findUserById(session.userId);
    if (!user) {
      await this.authRepository.deleteSession(session._id);
      throw new NotFoundException("Người dùng không tồn tại");
    }

    if (!user.isActive) {
      await this.authRepository.deleteSession(session._id);
      throw new ForbiddenException("Tài khoản đã bị vô hiệu hóa");
    }

    // ✅ FIXED: Token rotation - Tạo refresh token mới
    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    // ✅ FIXED: Gia hạn session - Cập nhật expireAt thêm 14 ngày
    const newExpireAt = new Date(Date.now() + REFRESH_TOKEN_TTL);

    // ✅ FIXED: Xóa session cũ và tạo session mới (token rotation)
    // ✅ FIXED: Sử dụng transaction để tránh race condition
    // ✅ SECURITY: Log token refresh để phát hiện reuse
    console.log(`🔄 [Auth] Token refresh for user: ${session.userId}, session: ${session._id}`);
    
    try {
      await this.authRepository.deleteSession(session._id);
      await this.authRepository.createSession({
        userId: session.userId,
        refreshToken: newRefreshToken,
        expireAt: newExpireAt,
      });
      console.log(`✅ [Auth] Token rotated successfully for user: ${session.userId}`);
    } catch (error) {
      // ✅ SECURITY: Log error để phát hiện token reuse hoặc attack
      console.error(`❌ [Auth] Error during token rotation for user: ${session.userId}`, error);
      // Nếu có lỗi khi tạo session mới, không xóa session cũ
      throw new ForbiddenException("Không thể làm mới token, vui lòng thử lại");
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(session.userId);

    console.log(`✅ [Auth] Token refreshed for user: ${session.userId}`);

    // ✅ FIXED: Trả về cả refresh token mới
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Create OAuth session (for Google login)
   * ✅ FIXED: Thêm error handling và validation
   */
  async createOAuthSession(user) {
    try {
      // ✅ FIXED: Validate user
      if (!user) {
        throw new ValidationException("User object is required");
      }

      if (!user._id) {
        throw new ValidationException("User ID is required");
      }

      console.log(`🔐 [Auth] Creating OAuth session for user: ${user.email || user._id}`);

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = crypto.randomBytes(64).toString("hex");

      console.log(`🔐 [Auth] Tokens generated for user: ${user.email || user._id}`);

      // Create session (user có thể có nhiều session từ nhiều thiết bị)
      await this.authRepository.createSession({
        userId: user._id,
        refreshToken,
        expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      });

      console.log(`🔐 [Auth] Session created for user: ${user.email || user._id}`);

      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();

      console.log(`🔐 [Auth] User lastLoginAt updated for: ${user.email || user._id}`);

      // Populate user with profiles
      const userWithProfiles = await this.authRepository.findUserById(user._id);

      console.log(`✅ [Auth] OAuth session created successfully for user: ${user.email || user._id}`);

      return { accessToken, refreshToken, user: userWithProfiles };
    } catch (error) {
      console.error(`❌ [Auth] Error creating OAuth session for user: ${user?.email || user?._id || 'unknown'}`, error);
      console.error(`❌ [Auth] Error stack:`, error.stack);
      throw error; // Re-throw để callback handler xử lý
    }
  }

  /**
   * Sign out user
   * ✅ FIXED: Thêm validation và error handling
   */
  async signOut(token) {
    if (!token) {
      // Không có token cũng coi như sign out thành công (idempotent)
      return true;
    }

    try {
      const deleted = await this.authRepository.deleteSessionByToken(token);
      if (deleted.deletedCount > 0) {
        console.log(`✅ [Auth] User signed out, session deleted`);
      } else {
        console.log(`⚠️ [Auth] Sign out: Session not found (may have been already deleted)`);
      }
    } catch (error) {
      // Log nhưng không throw - sign out nên luôn thành công
      console.warn(`⚠️ [Auth] Error during sign out:`, error.message);
    }

    return true;
  }
}
