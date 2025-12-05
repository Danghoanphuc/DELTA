// src/modules/organizations/organization.model.js
// ✅ B2B Organization Model - Dành cho khách hàng doanh nghiệp (Web2Print Platform)

import mongoose from "mongoose";

const ORGANIZATION_TIERS = {
  STARTER: "starter",
  BUSINESS: "business",
  ENTERPRISE: "enterprise",
};

// ✅ VALUE-FIRST: Usage Intent options cho onboarding wizard
const USAGE_INTENTS = {
  EMPLOYEE_ONBOARDING: "employee_onboarding", // Onboarding nhân viên mới
  PARTNER_GIFTS: "partner_gifts", // Tặng đối tác/khách hàng
  MERCHANDISE: "merchandise", // Bán merchandise
  EVENTS: "events", // Sự kiện/hội nghị
  MARKETING: "marketing", // Marketing campaigns
  OTHER: "other",
};

const OrganizationProfileSchema = new mongoose.Schema(
  {
    // === CORE FIELDS (Minimal required) ===
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true, trim: true },

    // ✅ VALUE-FIRST: Các field này OPTIONAL, điền sau khi checkout/billing
    taxCode: { type: String, trim: true, sparse: true }, // Không required nữa
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true },

    // ✅ NEW: Usage Intent từ onboarding wizard
    usageIntent: {
      type: String,
      enum: Object.values(USAGE_INTENTS),
    },

    // === BRANDING (Quan trọng cho Value-First) ===
    logoUrl: { type: String }, // ✅ Upload ngay từ wizard step 2
    coverImage: { type: String },
    vectorUrl: { type: String }, // Vector logo for Studio
    brandGuidelineUrl: { type: String }, // Brand guideline PDF

    // === BILLING ADDRESS (Optional - điền khi checkout) ===
    billingAddress: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
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
      enum: ["unverified", "pending_review", "approved", "rejected"],
      default: "unverified",
      required: true,
    },
    verificationDocs: {
      gpkdUrl: { type: String }, // Giấy phép kinh doanh
      cccdUrl: { type: String }, // CCCD đại diện pháp luật
    },
    isVerified: { type: Boolean, default: false, required: true },
    isActive: { type: Boolean, default: true, required: true }, // ✅ Default true để vào Dashboard ngay

    // === B2B SPECIFIC FIELDS ===
    credits: { type: Number, default: 0 }, // ✅ NEW: Số dư tiền nạp
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }, // ✅ NEW: Link tới kho hàng ảo

    // === PAYMENT TERMS ===
    paymentTerms: {
      type: String,
      enum: ["prepaid", "net15", "net30", "net60"],
      default: "prepaid",
    },
    creditLimit: { type: Number, default: 0 }, // Hạn mức trả sau (nếu được duyệt)

    // === TIER & PRICING ===
    tier: {
      type: String,
      enum: Object.values(ORGANIZATION_TIERS),
      default: ORGANIZATION_TIERS.STARTER,
    },

    // === STATS ===
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },

    // === STRIPE (nếu cần) ===
    stripeCustomerId: { type: String },

    // ✅ NEW: Team Management (Wizard Step 3)
    pendingInvites: [
      {
        email: { type: String, lowercase: true, trim: true },
        invitedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "accepted", "expired"],
          default: "pending",
        },
      },
    ],
    teamMembers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ NEW: Onboarding Progress
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 }, // 0: not started, 1: intent, 2: logo, 3: team, 4: done
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// === INDEXES ===
OrganizationProfileSchema.index({ user: 1 }, { unique: true });
OrganizationProfileSchema.index({ taxCode: 1 }, { unique: true, sparse: true }); // sparse để cho phép null
OrganizationProfileSchema.index({ "billingAddress.location": "2dsphere" });

// === VIRTUALS ===
OrganizationProfileSchema.virtual("organizationId").get(function () {
  return this._id;
});

// ✅ FIX: Check if model already exists before creating it
export const OrganizationProfile =
  mongoose.models.OrganizationProfile ||
  mongoose.model("OrganizationProfile", OrganizationProfileSchema);

export { ORGANIZATION_TIERS, USAGE_INTENTS };
