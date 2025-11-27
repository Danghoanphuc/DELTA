// backend/src/infrastructure/auth/passport.config.js
// ✅ FIXED: Always creates CustomerProfile for new users

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "../../config/env.config.js";
import { User } from "../../shared/models/user.model.js";
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";
import { generateUniqueUsername } from "../../shared/utils/username.util.js"; 

/**
 * Find or create user from Google profile
 * Always creates/ensures user has CustomerProfile
 */
const findOrCreateUser = async (profile) => {
  try {
    const email = profile.emails[0].value;
    console.log(`🔍 [Passport] Finding/Creating user: ${email}`);

    // Step 1: Find existing user by email or googleId
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: email }],
    });

    // Step 2: If user exists
    if (user) {
      console.log(`✅ [Passport] User found: ${user.email}`);
      console.log(`📋 [Passport] User authMethod: ${user.authMethod || 'local'}`);
      console.log(`📋 [Passport] User has googleId: ${!!user.googleId}`);

      let updated = false;

      // ✅ FIXED: Kiểm tra conflict - nếu user có googleId khác với profile.id
      if (user.googleId && user.googleId !== profile.id) {
        console.warn(
          `⚠️ [Passport] User ${user.email} has different googleId. Current: ${user.googleId}, New: ${profile.id}`
        );
        // Vẫn cho phép đăng nhập nhưng không cập nhật googleId (giữ nguyên)
      } else if (!user.googleId) {
        // ✅ CRITICAL: Nếu user đăng ký bằng local, thêm googleId để có thể đăng nhập bằng Google sau này
        user.googleId = profile.id;
        updated = true;
        console.log(`📝 [Passport] Linked Google account to existing user: ${user.email}`);
      }

      // ✅ FIXED: Cập nhật authMethod nếu user đang dùng local
      if (user.authMethod === "local") {
        console.log(`📝 [Passport] User ${user.email} can now login with both local and Google`);
      } else if (!user.authMethod) {
        user.authMethod = "google";
        updated = true;
        console.log(`📝 [Passport] Set authMethod to 'google' for ${user.email}`);
      }

      // Ensure username exists (legacy data may miss this)
      if (!user.username) {
        user.username = await generateUniqueUsername(email);
        updated = true;
        console.log(`🆕 [Passport] Generated username for ${user.email}`);
      }

      // Verify email if not verified
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
        console.log(`✅ [Passport] Verified email for ${user.email}`);
      }

      // Update avatar from Google if missing or empty
      if ((!user.avatarUrl || user.avatarUrl === "") && profile.photos?.[0]?.value) {
        user.avatarUrl = profile.photos[0].value;
        updated = true;
        console.log(`🖼️ [Passport] Updated avatar from Google for ${user.email}`);
      }

      // Update displayName from Google if missing
      if (!user.displayName && profile.displayName) {
        user.displayName = profile.displayName;
        updated = true;
        console.log(`👤 [Passport] Updated displayName from Google for ${user.email}`);
      }

      // Update last login time
      user.lastLoginAt = new Date();
      updated = true;

      if (updated) {
        await user.save();
      }

      // ✅ Ensure user has CustomerProfile
      if (!user.customerProfileId) {
        console.log(
          `📝 [Passport] User ${user.email} missing CustomerProfile, creating...`
        );

        // Check if profile exists but reference is broken
        let existingProfile = await CustomerProfile.findOne({
          userId: user._id,
        });

        if (existingProfile) {
          user.customerProfileId = existingProfile._id;
          await user.save();
          console.log(
            `✅ [Passport] Linked existing CustomerProfile for ${user.email}`
          );
        } else {
          // Create new profile
          const newProfile = new CustomerProfile({
            userId: user._id,
            savedAddresses: [],
          });
          await newProfile.save();
          user.customerProfileId = newProfile._id;
          await user.save();
          console.log(
            `✅ [Passport] Created CustomerProfile for ${user.email}`
          );
        }
      }

      return user;
    }

    // Step 3: Create new user (doesn't exist)
    console.log(`➕ [Passport] Creating new user: ${email}`);

    try {
      const username = await generateUniqueUsername(email);

      const newUser = new User({
        googleId: profile.id,
        email: email,
        username,
        displayName: profile.displayName || email.split("@")[0],
        avatarUrl: profile.photos?.[0]?.value || "",
        isVerified: true, // Google email is verified
        authMethod: "google",
        printerProfileId: null,
        customerProfileId: null, // Sẽ set sau khi tạo profile
        lastLoginAt: new Date(),
      });

      // Step 4: Create CustomerProfile trước
      const newProfile = new CustomerProfile({
        userId: newUser._id,
        savedAddresses: [],
      });

      // Step 5: Save profile trước để có _id
      await newProfile.save();

      // Step 6: Link user to profile và save user
      newUser.customerProfileId = newProfile._id;
      await newUser.save();

      console.log(`✅ [Passport] New user created: ${newUser.email}`);
      console.log(`✅ [Passport] CustomerProfile created for ${newUser.email}`);

      return newUser;
    } catch (createError) {
      console.error("❌ [Passport] Error creating new user:", createError);
      // Nếu lỗi do duplicate (user đã được tạo trong lúc này), thử tìm lại
      if (createError.code === 11000 || createError.name === "MongoServerError") {
        console.log("🔄 [Passport] User might have been created concurrently, retrying...");
        const existingUser = await User.findOne({
          $or: [{ googleId: profile.id }, { email: email }],
        });
        if (existingUser) {
          console.log(`✅ [Passport] Found existing user: ${existingUser.email}`);
          return existingUser;
        }
      }
      throw createError;
    }
  } catch (error) {
    console.error("❌ [Passport] Error in findOrCreateUser:", error);
    throw error;
  }
};

/**
 * Config Passport Google Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: `${config.serverUrl}/api/auth/google/callback`,
      passReqToCallback: true, // Để truy cập req trong callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("🎯 [Passport] Google Strategy Callback triggered");
        console.log(
          "📧 [Passport] Google Profile Email:",
          profile.emails?.[0]?.value
        );

        // Find or create user (always creates CustomerProfile)
        const user = await findOrCreateUser(profile);

        // Return user to passport
        done(null, user);
      } catch (error) {
        console.error("❌ [Passport] Error in Google Strategy:", error);
        done(error, null);
      }
    }
  )
);

export default passport;