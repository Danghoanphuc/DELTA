// backend/src/infrastructure/auth/passport.config.js
// ✅ FIXED: Always creates CustomerProfile for new users

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../../shared/models/user.model.js";
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";

dotenv.config();

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

      let updated = false;

      // Update googleId if missing
      if (!user.googleId) {
        user.googleId = profile.id;
        updated = true;
        console.log(`📝 [Passport] Updated googleId for ${user.email}`);
      }

      // Verify email if not verified
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
        console.log(`✅ [Passport] Verified email for ${user.email}`);
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

    const newUser = new User({
      googleId: profile.id,
      email: email,
      displayName: profile.displayName || email.split("@")[0],
      avatarUrl: profile.photos?.[0]?.value,
      isVerified: true, // Google email is verified
      authMethod: "google",
      printerProfileId: null,
      lastLoginAt: new Date(),
    });

    // Step 4: Create CustomerProfile
    const newProfile = new CustomerProfile({
      userId: newUser._id,
      savedAddresses: [],
    });

    // Step 5: Link user to profile
    newUser.customerProfileId = newProfile._id;

    // Step 6: Save both (order matters)
    await newUser.save();
    await newProfile.save();

    console.log(`✅ [Passport] New user created: ${newUser.email}`);
    console.log(`✅ [Passport] CustomerProfile created for ${newUser.email}`);

    return newUser;
  } catch (error) {
    console.error("❌ [Passport] Error in findOrCreateUser:", error);
    throw error;
  }
};

/**
 * Configure Passport Google Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.SERVER_URL || "http://localhost:5001"
      }/api/auth/google/callback`,
      passReqToCallback: true,
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

// No serialize/deserialize needed (we don't use sessions)

export default passport;
