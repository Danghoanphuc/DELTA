// src/modules/organizations/organization-member.model.js
// ✅ REFACTORED: Tách biệt User (Identity) và Organization (Workspace)
// Relationship: User ↔ Organization với roles

import mongoose from "mongoose";

// === MEMBER ROLES ===
export const MEMBER_ROLES = {
  OWNER: "owner", // Người tạo org, full control
  ADMIN: "admin", // Quản trị viên, gần như full control
  MEMBER: "member", // Thành viên thường, limited permissions
  VIEWER: "viewer", // Chỉ xem, không edit
};

// === MEMBER STATUS ===
export const MEMBER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  INVITED: "invited", // Đã mời nhưng chưa accept
};

const OrganizationMemberSchema = new mongoose.Schema(
  {
    // === CORE RELATIONSHIP ===
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // === ROLE & PERMISSIONS ===
    role: {
      type: String,
      enum: Object.values(MEMBER_ROLES),
      default: MEMBER_ROLES.MEMBER,
      required: true,
    },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUS),
      default: MEMBER_STATUS.ACTIVE,
      required: true,
    },

    // === INVITATION INFO (nếu status = invited) ===
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invitedAt: {
      type: Date,
    },
    inviteToken: {
      type: String,
      // ✅ FIX: Remove unique here to avoid duplicate index warning
      // Index is defined below with sparse: true
    },
    inviteExpiresAt: {
      type: Date,
    },

    // === ACCEPTANCE INFO ===
    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // === CUSTOM PERMISSIONS (Optional - for fine-grained control) ===
    permissions: {
      canManageTeam: { type: Boolean, default: false },
      canManageOrders: { type: Boolean, default: true },
      canManageInventory: { type: Boolean, default: false },
      canManageBilling: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
    },

    // === METADATA ===
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === INDEXES ===
// Composite unique: Một user chỉ có 1 membership trong 1 org
OrganizationMemberSchema.index(
  { userId: 1, organizationId: 1 },
  { unique: true }
);
OrganizationMemberSchema.index({ organizationId: 1, role: 1 });
// ✅ FIX: Unique + sparse index for inviteToken (only one definition)
OrganizationMemberSchema.index(
  { inviteToken: 1 },
  { unique: true, sparse: true }
);

// === METHODS ===

// Check if member is owner
OrganizationMemberSchema.methods.isOwner = function () {
  return this.role === MEMBER_ROLES.OWNER;
};

// Check if member is admin or owner
OrganizationMemberSchema.methods.isAdminOrOwner = function () {
  return [MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(this.role);
};

// Check if member can perform action
OrganizationMemberSchema.methods.can = function (permission) {
  // Owner và Admin có full permissions
  if (this.isAdminOrOwner()) return true;

  // Check custom permissions
  return this.permissions[permission] || false;
};

// === STATICS ===

// Find all members of an organization
OrganizationMemberSchema.statics.findByOrganization = function (
  organizationId
) {
  return this.find({ organizationId, status: MEMBER_STATUS.ACTIVE })
    .populate("userId", "displayName email avatarUrl")
    .sort({ role: 1, joinedAt: 1 });
};

// Find all organizations of a user
OrganizationMemberSchema.statics.findByUser = function (userId) {
  return this.find({ userId, status: MEMBER_STATUS.ACTIVE })
    .populate("organizationId")
    .sort({ joinedAt: -1 });
};

// Check if user is member of organization
OrganizationMemberSchema.statics.isMember = async function (
  userId,
  organizationId
) {
  const member = await this.findOne({
    userId,
    organizationId,
    status: MEMBER_STATUS.ACTIVE,
  });
  return !!member;
};

// Get user's role in organization
OrganizationMemberSchema.statics.getUserRole = async function (
  userId,
  organizationId
) {
  const member = await this.findOne({
    userId,
    organizationId,
    status: MEMBER_STATUS.ACTIVE,
  });
  return member ? member.role : null;
};

// === EXPORT ===
export const OrganizationMember =
  mongoose.models.OrganizationMember ||
  mongoose.model("OrganizationMember", OrganizationMemberSchema);
