import mongoose from "mongoose";

const PRINTER_TIERS_OBJECT = {
  STANDARD: "standard",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
};

const PrinterProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true, default: "" },
    logoUrl: { type: String },
    coverImage: { type: String },
    shopAddress: {
      street: { type: String, required: true, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },
        coordinates: { type: [Number], required: true },
      },
    },
    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending_review", "approved", "rejected"],
      default: "not_submitted",
      required: true,
    },
    verificationDocs: { gpkdUrl: { type: String }, cccdUrl: { type: String } },
    isVerified: { type: Boolean, default: false, required: true },
    isActive: { type: Boolean, default: true, required: true },
    tier: {
      type: String,
      enum: Object.values(PRINTER_TIERS_OBJECT),
      default: PRINTER_TIERS_OBJECT.STANDARD,
    },
    standardCommissionRate: { type: Number, default: 0.1, min: 0, max: 1 },
    commissionOverride: {
      rate: { type: Number, min: 0, max: 1 },
      expiresAt: { type: Date },
    },
    healthScore: { type: Number, default: 100 },
    dailyCapacity: { type: Number, default: 100 },
    currentQueueSize: { type: Number, default: 0 },
    stats: { lastDemotionAt: Date, lastPromotionAt: Date },
    specialties: { type: [String], default: [] },
    priceTier: {
      type: String,
      enum: ["cheap", "standard", "premium"],
      default: "standard",
    },
    productionSpeed: {
      type: String,
      enum: ["fast", "standard"],
      default: "standard",
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    stripeAccountId: { type: String },
    stripeAccountStatus: {
      type: String,
      enum: ["PENDING", "ACTIVE", "RESTRICTED", "UNKNOWN"],
    },
    factoryImages: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: "" },
      },
    ],
    factoryVideoUrl: { type: String },
    businessLicense: { type: String },
    taxCode: { type: String },
    rushConfig: {
      acceptsRushOrders: { type: Boolean, default: false, index: true },
      maxRushDistanceKm: { type: Number, default: 10 },
      rushFeePercentage: { type: Number, default: 0.2 },
      rushFeeFixed: { type: Number, default: 0 },
    },
    currentRushQueue: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

PrinterProfileSchema.index({ user: 1 }, { unique: true });
PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.virtual("printerProfileId").get(function () {
  return this._id;
});

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);
