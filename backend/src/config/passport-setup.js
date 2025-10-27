// backend/src/config/passport.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";
import { PrinterProfile } from "../models/PrinterProfile.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Hàm tìm hoặc tạo user mới từ Google profile
 * Role sẽ được lấy từ state parameter (không dùng session)
 */
const findOrCreateUser = async (profile, role = "customer") => {
  try {
    console.log(
      `🔍 Finding/Creating user with Google ID: ${profile.id}, role: ${role}`
    );

    // 1. Tìm user hiện có
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
    });

    // 2. Nếu user đã tồn tại
    if (user) {
      console.log(`✅ User found: ${user.email}`);

      // Cập nhật Google ID nếu chưa có
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }

      return user;
    }

    // 3. Tạo user mới
    console.log(`➕ Creating new user with role: ${role}`);

    const newUser = new User({
      googleId: profile.id,
      username: profile.emails[0].value,
      email: profile.emails[0].value,
      displayName: profile.displayName || profile.emails[0].value.split("@")[0],
      avatarUrl: profile.photos?.[0]?.value,
      role: role,
      isVerified: true, // Google đã verify email
    });

    // 4. Nếu là printer, tạo thêm PrinterProfile
    if (role === "printer") {
      const newProfile = new PrinterProfile({
        userId: newUser._id,
        businessName: newUser.displayName,
      });

      newUser.printerProfile = newProfile._id;

      await newProfile.save();
      console.log(`✅ PrinterProfile created for user ${newUser.email}`);
    }

    await newUser.save();
    console.log(`✅ New user created: ${newUser.email}`);

    return newUser;
  } catch (error) {
    console.error("❌ Error in findOrCreateUser:", error);
    throw error;
  }
};

/**
 * Config Passport Google Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.API_URL || "http://localhost:5001"
      }/api/auth/google/callback`,
      passReqToCallback: true, // Để truy cập req trong callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("🎯 Google Strategy Callback triggered");
        console.log("📧 Google Profile Email:", profile.emails?.[0]?.value);

        // Lấy role từ state parameter (đã encode trong URL)
        // State format: "role=customer" hoặc "role=printer"
        const role = req.query.state?.includes("printer")
          ? "printer"
          : "customer";

        console.log(`🎭 Detected role from state: ${role}`);

        // Tìm hoặc tạo user
        const user = await findOrCreateUser(profile, role);

        // Trả về user cho Passport
        done(null, user);
      } catch (error) {
        console.error("❌ Error in Google Strategy:", error);
        done(error, null);
      }
    }
  )
);

// Không cần serialize/deserialize vì không dùng session
export default passport;
