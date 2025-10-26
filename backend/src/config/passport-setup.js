// backend/src/config/passport-setup.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";
import { PrinterProfile } from "../models/PrinterProfile.js";
import crypto from "crypto";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5001";

/**
 * Find or create user from OAuth provider
 * @param {Object} req - Express request object
 * @param {Object} profile - OAuth profile
 * @param {String} provider - OAuth provider name (e.g., "google")
 * @param {Function} done - Passport callback
 */
const findOrCreateUser = async (req, profile, provider, done) => {
  try {
    let email = profile.emails?.[0]?.value || profile._json?.email || null;
    if (!email) {
      return done(new Error(`[${provider}] Could not retrieve email`), null);
    }

    // Get role from session (set by rememberOAuthRole middleware)
    const role = req.session.oauthRole || "customer";
    // Clean up session after use
    if (req.session.oauthRole) delete req.session.oauthRole;

    console.log(`[Passport] FindOrCreate for: ${email}, Role: ${role}`);

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      // User exists, update OAuth ID if missing
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // User doesn't exist, create new user
    const displayName =
      profile.displayName ||
      `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
      email.split("@")[0];

    const avatarUrl = profile.photos?.[0]?.value || "";
    const tempUsername =
      email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") +
      "_" +
      provider.substring(0, 2) +
      crypto.randomBytes(2).toString("hex");

    const newUser = new User({
      [`${provider}Id`]: profile.id,
      email,
      displayName,
      isVerified: true, // Auto-verify OAuth users
      avatarUrl,
      username: tempUsername,
      role: role,
      authMethod: provider,
    });

    // If printer role, create PrinterProfile
    if (role === "printer") {
      const newProfile = new PrinterProfile({
        userId: newUser._id,
        businessName: displayName,
      });
      newUser.printerProfile = newProfile._id;
      await newProfile.save();
      console.log(`[Passport] Created PrinterProfile for ${email}`);
    }

    await newUser.save();
    console.log(`[Passport] Created new user: ${email}`);
    return done(null, newUser);
  } catch (err) {
    console.error(`[Passport] Error in findOrCreateUser:`, err);
    return done(err, null);
  }
};

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
      passReqToCallback: true, // Pass req to callback
    },
    (req, accessToken, refreshToken, profile, done) => {
      findOrCreateUser(req, profile, "google", done);
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("[Passport] Error deserializing user:", err);
    done(err, null);
  }
});

export default passport;
