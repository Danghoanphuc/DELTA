// backend/src/controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import Session from "../models/session.js";
import { PrinterProfile } from "../models/PrinterProfile.js";
import { sendVerificationEmail } from "../libs/email.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

// === UTILITY FUNCTIONS ===

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

// === CONTROLLERS ===

// @desc    Sign up as customer
// @route   POST /api/auth/signup
// @access  Public
export const signUp = async (req, res) => {
  try {
    const { username, password, email, displayName } = req.body;

    if (!password || !email || !displayName) {
      return res.status(400).json({
        message: "Missing required fields: password, email, and displayName",
      });
    }

    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 3600000);

    const newUser = await User.create({
      username: email,
      hashedPassword,
      email,
      displayName,
      verificationToken,
      verificationTokenExpiresAt,
      role: "customer",
    });

    await sendVerificationEmail(newUser.email, verificationToken);
    return res.sendStatus(201);
  } catch (error) {
    console.error("Error in signUp:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    }).select("+verificationToken +verificationTokenExpiresAt");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Sign in
// @route   POST /api/auth/signin
// @access  Public
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email }).select("+hashedPassword");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before signing in" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expireAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.status(200).json({
      message: `Welcome back, ${user.displayName}!`,
      accessToken,
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refreshToken cookie)
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized: Missing refresh token" });
    }

    const session = await Session.findOne({ refreshToken: refreshToken });
    if (!session) {
      return res.status(403).json({
        message: "Forbidden: Invalid or revoked token",
      });
    }

    if (new Date() > session.expireAt) {
      await Session.deleteOne({ _id: session._id });
      return res
        .status(403)
        .json({ message: "Expired: Token has expired, please sign in again" });
    }

    const newAccessToken = generateAccessToken(session.userId);
    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Error in refresh:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Sign out
// @route   POST /api/auth/signout
// @access  Public
export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error in signOut:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Sign up as printer
// @route   POST /api/auth/signup-printer
// @access  Public
export const signUpPrinter = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!password || !email || !displayName) {
      return res.status(400).json({
        message: "Missing required fields: email, password, and displayName",
      });
    }

    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(Date.now() + 3600000);

    const newUser = new User({
      username: email,
      hashedPassword,
      email,
      displayName,
      role: "printer",
      verificationToken,
      verificationTokenExpiresAt,
    });

    const newProfile = new PrinterProfile({
      userId: newUser._id,
      businessName: displayName,
    });

    newUser.printerProfile = newProfile._id;

    await newUser.save();
    await newProfile.save();

    await sendVerificationEmail(newUser.email, verificationToken);

    return res.sendStatus(201);
  } catch (error) {
    console.error("Error in signUpPrinter:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
