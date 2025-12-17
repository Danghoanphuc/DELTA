// packages/auth/models/session.model.js
// ✅ SHARED: Session model cho cả Customer và Admin

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true, // ✅ Index for faster queries
    },
    userType: {
      type: String,
      enum: ["customer", "admin"],
      required: [true, "User type is required"],
      index: true, // ✅ Index for filtering by user type
    },
    refreshToken: {
      type: String,
      required: [true, "Refresh token is required"],
      unique: true,
      index: true, // ✅ Index for faster token lookups
    },
    expireAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: true, // ✅ Index for TTL and cleanup queries
    },
    // ✅ ENHANCED SECURITY: Additional fields for admin sessions
    ipAddress: {
      type: String,
      required: false, // Optional for backward compatibility
    },
    userAgent: {
      type: String,
      required: false,
    },
    // ✅ ADMIN SECURITY: Track admin-specific metadata
    adminMetadata: {
      lastActivity: Date,
      permissions: [String],
      securityLevel: {
        type: String,
        enum: ["standard", "elevated", "super"],
        default: "standard",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ✅ SECURITY: Auto-delete expired sessions
sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// ✅ PERFORMANCE: Compound indexes for common queries
sessionSchema.index({ userId: 1, userType: 1 });
sessionSchema.index({ refreshToken: 1, userType: 1 });

// ✅ SECURITY: Instance methods for session validation
sessionSchema.methods.isExpired = function () {
  return new Date() > this.expireAt;
};

sessionSchema.methods.isAdminSession = function () {
  return this.userType === "admin";
};

sessionSchema.methods.updateActivity = function () {
  if (this.adminMetadata) {
    this.adminMetadata.lastActivity = new Date();
  }
  return this.save();
};

// ✅ SECURITY: Static methods for cleanup
sessionSchema.statics.cleanupExpiredSessions = async function () {
  const result = await this.deleteMany({
    expireAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

sessionSchema.statics.cleanupOldSessions = async function (
  userId,
  userType,
  keepLatest = 5
) {
  const sessions = await this.find({ userId, userType })
    .sort({ createdAt: -1 })
    .skip(keepLatest);

  if (sessions.length > 0) {
    const sessionIds = sessions.map((s) => s._id);
    const result = await this.deleteMany({ _id: { $in: sessionIds } });
    return result.deletedCount;
  }
  return 0;
};

export default mongoose.model("Session", sessionSchema);
