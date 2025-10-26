// backend/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Middleware to authenticate requests using JWT
 * Verifies access token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No access token provided" });
    }

    // Verify token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error("JWT verification error:", err.message);
          return res
            .status(403)
            .json({ message: "Forbidden: Invalid or expired access token" });
        }

        try {
          // Find user by ID from decoded token
          const user = await User.findById(decodedUser.userId).select(
            "-hashedPassword"
          );

          if (!user) {
            return res
              .status(404)
              .json({ message: "User not found" });
          }

          // Check if user is active
          if (!user.isActive) {
            return res
              .status(403)
              .json({ message: "Account is deactivated" });
          }

          // Attach user to request object
          req.user = user;

          // Continue to next middleware
          next();
        } catch (findUserError) {
          console.error("Error finding user in authMiddleware:", findUserError);
          return res.status(500).json({ message: "Internal server error while authenticating user" });
        }
      }
    );
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
