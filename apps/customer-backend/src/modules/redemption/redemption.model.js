// src/modules/redemption/redemption.model.js
// ✅ Redemption Link Model - Link để người nhận tự chọn size/màu (SwagUp-style)

import mongoose from "mongoose";
import crypto from "crypto";

const REDEMPTION_STATUS = {
  PENDING: "pending", // Chưa redeem
  REDEEMED: "redeemed", // Đã chọn xong
  EXPIRED: "expired", // Hết hạn
  CANCELLED: "cancelled", // Đã hủy
};

const LINK_TYPE = {
  SINGLE: "single", // 1 link = 1 người
  BULK: "bulk", // 1 link = nhiều người (có limit)
  UNLIMITED: "unlimited", // Không giới hạn
};

// Schema cho item có thể chọn
const RedeemableItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  swagPack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SwagPack",
  },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },

  // Options người nhận có thể chọn
  allowSizeSelection: { type: Boolean, default: false },
  availableSizes: [{ type: String }],
  allowColorSelection: { type: Boolean, default: false },
  availableColors: [
    {
      name: { type: String },
      hex: { type: String },
      imageUrl: { type: String },
    },
  ],

  // Quantity
  quantity: { type: Number, default: 1 },
  isRequired: { type: Boolean, default: true }, // Bắt buộc phải chọn
});

// Schema cho mỗi lần redeem
const RedemptionEntrySchema = new mongoose.Schema({
  // Recipient info
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipient",
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },

  // Shipping address
  shippingAddress: {
    street: { type: String },
    ward: { type: String },
    district: { type: String },
    city: { type: String },
    country: { type: String, default: "Vietnam" },
    postalCode: { type: String },
  },

  // Selections
  selections: [
    {
      itemIndex: { type: Number, required: true },
      selectedSize: { type: String },
      selectedColor: { type: String },
      quantity: { type: Number, default: 1 },
      notes: { type: String },
    },
  ],

  // Metadata
  redeemedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },

  // Order created from this redemption
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SwagOrder",
  },
});

const RedemptionLinkSchema = new mongoose.Schema(
  {
    // === ORGANIZATION LINK ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === LINK IDENTITY ===
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Unique token for URL
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },

    // Short code for easy sharing
    shortCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    // === TYPE & LIMITS ===
    type: {
      type: String,
      enum: Object.values(LINK_TYPE),
      default: LINK_TYPE.SINGLE,
    },
    maxRedemptions: { type: Number, default: 1 },
    currentRedemptions: { type: Number, default: 0 },

    // === ITEMS ===
    items: [RedeemableItemSchema],

    // === BRANDING ===
    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String, default: "#000000" },
      headerImageUrl: { type: String },
      welcomeTitle: { type: String, default: "Bạn có quà!" },
      welcomeMessage: { type: String },
      thankYouTitle: { type: String, default: "Cảm ơn bạn!" },
      thankYouMessage: { type: String },
      senderName: { type: String },
      senderLogo: { type: String },
    },

    // === SETTINGS ===
    settings: {
      // Required fields
      requirePhone: { type: Boolean, default: true },
      requireAddress: { type: Boolean, default: true },

      // Address options
      allowAddressEdit: { type: Boolean, default: true },
      prefillFromRecipient: { type: Boolean, default: true },

      // Notifications
      sendConfirmationEmail: { type: Boolean, default: true },
      sendZaloNotification: { type: Boolean, default: true },
      notifyAdminOnRedeem: { type: Boolean, default: true },
      adminNotificationEmails: [{ type: String }],

      // Auto-create order
      autoCreateOrder: { type: Boolean, default: true },

      // Custom fields
      customFields: [
        {
          name: { type: String },
          label: { type: String },
          type: { type: String, enum: ["text", "select", "date"] },
          required: { type: Boolean, default: false },
          options: [{ type: String }], // For select type
        },
      ],
    },

    // === EXPIRATION ===
    expiresAt: { type: Date },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(REDEMPTION_STATUS),
      default: REDEMPTION_STATUS.PENDING,
    },

    // === REDEMPTION ENTRIES ===
    redemptions: [RedemptionEntrySchema],

    // === CAMPAIGN/SOURCE ===
    campaign: { type: String, trim: true },
    source: { type: String, trim: true },
    tags: [{ type: String, trim: true }],

    // === STATS ===
    stats: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      started: { type: Number, default: 0 }, // Bắt đầu điền form
      completed: { type: Number, default: 0 }, // Hoàn thành
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
RedemptionLinkSchema.index({ token: 1 });
RedemptionLinkSchema.index({ shortCode: 1 });
RedemptionLinkSchema.index({ organization: 1, status: 1 });
RedemptionLinkSchema.index({ organization: 1, createdAt: -1 });
RedemptionLinkSchema.index({ expiresAt: 1 });

// === VIRTUALS ===
RedemptionLinkSchema.virtual("redemptionUrl").get(function () {
  return `https://printz.vn/redeem/${this.token}`;
});

RedemptionLinkSchema.virtual("shortUrl").get(function () {
  if (this.shortCode) {
    return `https://printz.vn/r/${this.shortCode}`;
  }
  return this.redemptionUrl;
});

RedemptionLinkSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

RedemptionLinkSchema.virtual("remainingRedemptions").get(function () {
  if (this.type === LINK_TYPE.UNLIMITED) return Infinity;
  return Math.max(0, this.maxRedemptions - this.currentRedemptions);
});

RedemptionLinkSchema.virtual("conversionRate").get(function () {
  if (this.stats.views === 0) return 0;
  return ((this.stats.completed / this.stats.views) * 100).toFixed(1);
});

// === METHODS ===
RedemptionLinkSchema.methods.canRedeem = function () {
  if (this.status !== REDEMPTION_STATUS.PENDING) return false;
  if (this.isExpired) return false;
  if (
    this.type !== LINK_TYPE.UNLIMITED &&
    this.currentRedemptions >= this.maxRedemptions
  ) {
    return false;
  }
  return true;
};

RedemptionLinkSchema.methods.recordView = async function (isUnique = false) {
  this.stats.views += 1;
  if (isUnique) this.stats.uniqueViews += 1;
  await this.save();
};

RedemptionLinkSchema.methods.addRedemption = async function (entryData) {
  if (!this.canRedeem()) {
    throw new Error("Link không thể redeem");
  }

  this.redemptions.push(entryData);
  this.currentRedemptions += 1;
  this.stats.completed += 1;

  // Update status if max reached
  if (
    this.type !== LINK_TYPE.UNLIMITED &&
    this.currentRedemptions >= this.maxRedemptions
  ) {
    this.status = REDEMPTION_STATUS.REDEEMED;
  }

  await this.save();
  return this.redemptions[this.redemptions.length - 1];
};

// === STATICS ===
RedemptionLinkSchema.statics.findByToken = function (token) {
  return this.findOne({ token });
};

RedemptionLinkSchema.statics.findByShortCode = function (shortCode) {
  return this.findOne({ shortCode: shortCode.toUpperCase() });
};

RedemptionLinkSchema.statics.generateShortCode = async function () {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  let exists = true;

  while (exists) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    exists = await this.findOne({ shortCode: code });
  }

  return code;
};

export const RedemptionLink =
  mongoose.models.RedemptionLink ||
  mongoose.model("RedemptionLink", RedemptionLinkSchema);

export { REDEMPTION_STATUS, LINK_TYPE };
