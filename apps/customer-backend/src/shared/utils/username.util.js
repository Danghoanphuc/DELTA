import crypto from "crypto";
import { User } from "../models/user.model.js";

const sanitize = (value) => {
  if (!value) return "";
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Generate a unique username based on email/local-part
 * Ensures compatibility with existing unique index on username
 */
export const generateUniqueUsername = async (email) => {
  const fallback = `user${crypto.randomBytes(3).toString("hex")}`;
  const base =
    sanitize(email?.split("@")[0]) || sanitize(email) || fallback;

  let username = base;
  let counter = 1;

  // Loop until we find a username that's not taken
  while (await User.exists({ username })) {
    username = `${base}${counter}`;
    counter += 1;
  }

  return username;
};

