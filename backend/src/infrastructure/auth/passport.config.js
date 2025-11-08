// src/infrastructure/auth/passport.config.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../../shared/models/user.model.js";
// ✅ IMPORT MODEL MỚI
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";

dotenv.config();

/**
 * Hàm tìm hoặc tạo user mới từ Google profile
 * LUÔN LUÔN tạo/tìm user với vai trò 'customer'
 */
const findOrCreateUser = async (profile) => {
  try {
    const email = profile.emails[0].value;
    console.log(`🔍 Finding/Creating user with Google ID: ${profile.id}`);

    // 1. Tìm user hiện có bằng email hoặc googleId
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: email }],
    });

    // 2. Nếu user đã tồn tại
    if (user) {
      console.log(`✅ User found: ${user.email}`);
      let updated = false;
      if (!user.googleId) {
        user.googleId = profile.id;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (updated) await user.save();
      return user;
    }

    // 3. Tạo user mới (Mặc định là customer)
    console.log(`➕ Creating new user (default as customer)`);

    const newUser = new User({
      googleId: profile.id,
      email: email,
      displayName: profile.displayName || email.split("@")[0],
      avatarUrl: profile.photos?.[0]?.value,
      isVerified: true, // Google đã verify email
      printerProfileId: null,
      authMethod: "google",
    });

    // 4. Tạo CustomerProfile
    const newProfile = new CustomerProfile({
      userId: newUser._id,
      savedAddresses: [],
    });

    // 5. Liên kết
    newUser.customerProfileId = newProfile._id;

    // 6. Lưu
    await newUser.save();
    await newProfile.save();

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
        process.env.SERVER_URL || "http://localhost:5001"
      }/api/auth/google/callback`,
      passReqToCallback: true, // ❌ BỎ QUA req.query.state
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("🎯 Google Strategy Callback triggered");
        // ❌ XÓA BỎ LOGIC LẤY ROLE TỪ STATE

        // Tìm hoặc tạo user (luôn là customer)
        const user = await findOrCreateUser(profile);

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
