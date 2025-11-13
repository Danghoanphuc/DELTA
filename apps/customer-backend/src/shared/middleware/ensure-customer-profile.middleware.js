// backend/src/shared/middleware/ensure-customer-profile.middleware.js
// ✅ NEW: Auto-create CustomerProfile for legacy users

import { CustomerProfile } from "../models/customer-profile.model.js";
import { Logger } from "../utils/index.js";

/**
 * Middleware to ensure every user has a CustomerProfile
 * Auto-creates one if missing (for legacy users or OAuth users)
 *
 * This middleware should be called after authentication middleware
 * It will not block the request, even if profile creation fails
 */
export const ensureCustomerProfile = async (req, res, next) => {
  try {
    // Skip if no authenticated user
    if (!req.user) {
      return next();
    }

    // Check if user already has customerProfileId
    if (req.user.customerProfileId) {
      return next();
    }

    // ✅ AUTO-CREATE: User doesn't have CustomerProfile (legacy user or OAuth)
    Logger.warn(
      `[Migration] User ${req.user._id} (${req.user.email}) missing CustomerProfile, creating...`
    );

    // Check if profile already exists in database
    let existingProfile = await CustomerProfile.findOne({
      userId: req.user._id,
    });

    if (existingProfile) {
      // Profile exists but user reference is missing, just update user
      Logger.info(
        `[Migration] CustomerProfile already exists for ${req.user.email}, updating user reference...`
      );
      req.user.customerProfileId = existingProfile._id;
      await req.user.save();
      Logger.success(
        `[Migration] Updated user reference for ${req.user.email}`
      );
      return next();
    }

    // Create new profile
    const newProfile = new CustomerProfile({
      userId: req.user._id,
      savedAddresses: [],
    });

    await newProfile.save();

    // Update user with the new profile ID
    req.user.customerProfileId = newProfile._id;
    await req.user.save();

    Logger.success(
      `[Migration] CustomerProfile created for user ${req.user.email}`
    );

    next();
  } catch (error) {
    Logger.error("[Migration] Failed to create CustomerProfile:", error);
    // ✅ IMPORTANT: Don't block the request, just log the error
    // The request can still proceed
    next();
  }
};
