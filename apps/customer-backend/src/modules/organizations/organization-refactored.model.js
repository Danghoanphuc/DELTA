// src/modules/organizations/organization-refactored.model.js
// ✅ REFACTORED: Organization as pure Workspace entity
// Tách biệt hoàn toàn khỏi User (Identity)

import mongoose from "mongoose";

// === ORGANIZATION TIERS ===
export const ORGANIZATION_TIERS = {
  STARTER: "starter",
  BUSINESS: "business",
  ENTERPRISE: "enterprise",
};

// === USAGE INTENTS ===
export const USAGE_INTENTS = {
  EMPLOYEE_ONBOARDING: "employee_onboarding",
  PARTNER_GIFTS: "partner_gifts",
  MERCHANDISE: "merchandise",
  EVENTS: "events",
  MARKETING: "marketing",
  OTHER: "other",
};

// === VERIFICATION STATUS ===
export const VERIFICATION_STATUS = {
  UNVERIFIED: "unverified",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// === PAYMENT TERMS ===
export const PAYMENT_TERMS = {
  PREPAID: "prepaid",
  NET15: "net15",
  NET30: "net30",
  NET60: "net60",
};

const OrganizationSchema = new mongoose.Schema(
  {
    // === BASIC INFO ===
    businessName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
    },

    // === CONTACT INFO (Work Email - KHÔNG phải login email) ===
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },

    // === TAX & LEGAL ===
    taxCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    legalName: {
      type: String,
      trim: true,
    },
    legalRepresentative: {
      name: { type: String, trim: true },
      position: { type: String, trim: true },
      idNumber: { type: String, trim: true },
    },

    // === BRANDING ===
    logoUrl: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    vectorUrl: {
      type: String,
    },
    brandGuidelineUrl: {
      type: String,
    },
    brandColors: {
      primary: { type: String },
      secondary: { type: String },
    },

    // === ADDRESSES ===
    billingAddress: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, default: "Vietnam" },
      postalCode: { type: String, trim: true },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: { type: [Number] }, // [longitude, latitude]
      },
    },
    shippingAddress: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, default: "Vietnam" },
      postalCode: { type: String, trim: true },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: { type: [Number] },
      },
    },

    // === VERIFICATION ===
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.UNVERIFIED,
      required: true,
    },
    verificationDocs: {
      gpkdUrl: { type: String }, // Giấy phép kinh doanh
      cccdUrl: { type: String }, // CCCD đại diện pháp luật
      otherDocs: [{ type: String }],
    },
    verificationNotes: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // === STATUS ===
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    // === TIER & SUBSCRIPTION ===
    tier: {
      type: String,
      enum: Object.values(ORGANIZATION_TIERS),
      default: ORGANIZATION_TIERS.STARTER,
      required: true,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },

    // === FINANCIAL ===
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentTerms: {
      type: String,
      enum: Object.values(PAYMENT_TERMS),
      default: PAYMENT_TERMS.PREPAID,
    },

    // === STRIPE ===
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // === INVENTORY ===
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },

    // === USAGE INTENT (from wizard) ===
    usageIntent: {
      type: String,
      enum: Object.values(USAGE_INTENTS),
    },

    // === ONBOARDING ===
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },

    // === STATS ===
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      totalMembers: { type: Number, default: 1 },
      totalRecipients: { type: Number, default: 0 },
    },

    // === SETTINGS ===
    settings: {
      requireApproval: { type: Boolean, default: false },
      autoApproveAmount: { type: Number, default: 0 },
      allowMemberInvite: { type: Boolean, default: true },
      notificationEmail: { type: String },
    },

    // === METADATA ===
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === INDEXES ===
OrganizationSchema.index({ businessName: "text", description: "text" });
OrganizationSchema.index({ "billingAddress.location": "2dsphere" });
OrganizationSchema.index({ "shippingAddress.location": "2dsphere" });
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ tier: 1, isActive: 1 });

// === VIRTUALS ===

// Get organization ID
OrganizationSchema.virtual("organizationId").get(function () {
  return this._id;
});

// Check if organization is enterprise
OrganizationSchema.virtual("isEnterprise").get(function () {
  return this.tier === ORGANIZATION_TIERS.ENTERPRISE;
});

// === METHODS ===

// Check if organization can create order
OrganizationSchema.methods.canCreateOrder = function (orderAmount) {
  if (!this.isActive) return false;

  // Prepaid: check credits
  if (this.paymentTerms === PAYMENT_TERMS.PREPAID) {
    return this.credits >= orderAmount;
  }

  // Net terms: check credit limit
  return this.stats.totalSpent + orderAmount <= this.creditLimit;
};

// Deduct credits
OrganizationSchema.methods.deductCredits = async function (amount) {
  if (this.credits < amount) {
    throw new Error("Insufficient credits");
  }
  this.credits -= amount;
  await this.save();
};

// Add credits
OrganizationSchema.methods.addCredits = async function (amount) {
  this.credits += amount;
  await this.save();
};

// === STATICS ===

// Find by slug
OrganizationSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

// Search organizations
OrganizationSchema.statics.search = function (query, options = {}) {
  const { page = 1, limit = 20, tier, isVerified } = options;

  const filter = { isActive: true };
  if (tier) filter.tier = tier;
  if (isVerified !== undefined) filter.isVerified = isVerified;

  if (query) {
    filter.$text = { $search: query };
  }

  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

// === PRE-SAVE HOOKS ===

// Generate slug from business name
OrganizationSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("businessName")) {
    const baseSlug = this.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// === EXPORT ===
export const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
