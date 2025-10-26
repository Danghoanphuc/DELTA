// backend/src/config/passport-setup.js (ĐÃ SỬA LỖI)
import passport from "passport";
// 1. SỬA LỖI IMPORT: Import trực tiếp "Strategy"
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";
import { PrinterProfile } from "../models/PrinterProfile.js";
import crypto from "crypto";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5001";

// CẬP NHẬT: findOrCreateUser giờ nhận `req`
const findOrCreateUser = async (req, profile, provider, done) => {
  try {
    let email = profile.emails?.[0]?.value || profile._json?.email || null;
    if (!email) {
      return done(new Error(`[${provider}] Không lấy được email.`), null);
    }

    // Đọc vai trò từ session (do middleware rememberOAuthRole gán)
    const role = req.session.oauthRole || "customer";
    // Xóa session sau khi dùng
    if (req.session.oauthRole) delete req.session.oauthRole;

    console.log(`[Passport] FindOrCreate cho: ${email}, Vai trò: ${role}`);

    let user = await User.findOne({ email });
    if (user) {
      // User đã tồn tại
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // User chưa tồn tại -> Tạo mới
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

    const newUser = new User({
      [`${provider}Id`]: profile.id,
      email,
      displayName,
      isVerified: true,
      avatarUrl,
      username: tempUsername,
      role: role, // GÁN VAI TRÒ ĐÚNG
    });

    // Nếu là nhà in, tạo luôn PrinterProfile
    if (role === "printer") {
      const newProfile = new PrinterProfile({
        userId: newUser._id,
        businessName: displayName,
      });
      newUser.printerProfile = newProfile._id;
      await newProfile.save();
      console.log(`[Passport] Đã tạo PrinterProfile cho ${email}`);
    }

    await newUser.save();
    return done(null, newUser);
  } catch (err) {
    return done(err, null);
  }
};

passport.use(
  // 2. SỬA LỖI KHỞI TẠO: Bỏ ".Strategy"
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${SERVER_URL}/api/auth/google/callback`, // ⚠️ Phải trùng với Google Console
      scope: ["profile", "email"],
      passReqToCallback: true, // Cho phép truyền `req` vào callback
    },
    // CẬP NHẬT: Thêm `req` vào
    (req, accessToken, refreshToken, profile, done) => {
      findOrCreateUser(req, profile, "google", done);
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
