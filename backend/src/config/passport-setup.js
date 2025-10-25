// backend/src/config/passport-setup.js
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { User } from "../models/User.js";
import crypto from "crypto";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5001";

const findOrCreateUser = async (profile, provider, done) => {
  try {
    let email = profile.emails?.[0]?.value || profile._json?.email || null;

    if (!email) {
      return done(
        new Error(`[${provider}] Không lấy được email từ provider.`),
        null
      );
    }

    let user = await User.findOne({ email });
    if (user) {
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    const displayName =
      profile.displayName ||
      `${profile.name?.givenName || ""} ${
        profile.name?.familyName || ""
      }`.trim() ||
      email.split("@")[0];

    const avatarUrl = profile.photos?.[0]?.value || "";
    const tempUsername =
      email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") +
      "_" +
      provider.substring(0, 2) +
      crypto.randomBytes(2).toString("hex");

    const newUser = await User.create({
      [`${provider}Id`]: profile.id,
      email,
      displayName,
      isVerified: true,
      avatarUrl,
      username: tempUsername,
      hashedPassword: crypto.randomBytes(16).toString("hex"),
    });

    return done(null, newUser);
  } catch (err) {
    return done(err, null);
  }
};

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/auth/google/callback`, // ⚠️ Phải trùng với Google Console
      scope: ["profile", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      findOrCreateUser(profile, "google", done);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
