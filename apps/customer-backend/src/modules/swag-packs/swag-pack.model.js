// src/modules/swag-packs/swag-pack.model.js
// ✅ Swag Pack Model - Bộ quà tặng (SwagUp-style)

import mongoose from "mongoose";

const PACK_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
};

const PACK_TYPE = {
  WELCOME_KIT: "welcome_kit", // Bộ chào mừng nhân viên
  EVENT_SWAG: "event_swag", // Quà sự kiện
  CLIENT_GIFT: "client_gift", // Quà khách hàng
  HOLIDAY_GIFT: "holiday_gift", // Quà lễ tết
  CUSTOM: "custom", // Tùy chỉnh
};

// Schema cho từng item trong pack
const PackItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true }, // Snapshot tên sản phẩm
  productImage: { type: String }, // Snapshot ảnh
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true },

  // Customization options
  customization: {
    logoPlacement: { type: String }, // Vị trí in logo
    printColor: { type: String }, // Màu in
    personalized: { type: Boolean, default: false }, // In tên riêng
    personalizedField: { type: String }, // Field để lấy tên (firstName, fullName, etc.)
  },

  // Size options (for apparel)
  sizeOptions: {
    enabled: { type: Boolean, default: false },
    defaultSize: { type: String },
    allowRecipientChoice: { type: Boolean, default: false },
  },
});

const SwagPackSchema = new mongoose.Schema(
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

    // === BASIC INFO ===
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    internalNotes: { type: String, trim: true }, // Ghi chú nội bộ

    // === TYPE & STATUS ===
    type: {
      type: String,
      enum: Object.values(PACK_TYPE),
      default: PACK_TYPE.CUSTOM,
    },
    status: {
      type: String,
      enum: Object.values(PACK_STATUS),
      default: PACK_STATUS.DRAFT,
    },

    // === ITEMS ===
    items: [PackItemSchema],

    // === PACKAGING ===
    packaging: {
      boxType: { type: String, default: "standard" }, // standard, premium, eco
      includeCard: { type: Boolean, default: false },
      cardMessage: { type: String, trim: true },
      includeRibbon: { type: Boolean, default: false },
      ribbonColor: { type: String },
      customPackaging: { type: Boolean, default: false },
      customPackagingNotes: { type: String },
    },

    // === BRANDING ===
    branding: {
      includeLogo: { type: Boolean, default: true },
      logoUrl: { type: String }, // Override org logo
      brandColor: { type: String },
      includeThankYouCard: { type: Boolean, default: false },
      thankYouMessage: { type: String },
    },

    // === PRICING (Calculated) ===
    pricing: {
      itemsTotal: { type: Number, default: 0 },
      packagingFee: { type: Number, default: 0 },
      brandingFee: { type: Number, default: 0 },
      kittingFee: { type: Number, default: 0 }, // Phí đóng gói
      subtotal: { type: Number, default: 0 },
      // Per-unit price (for bulk orders)
      unitPrice: { type: Number, default: 0 },
    },

    // === PREVIEW ===
    previewImages: [{ type: String }], // Mockup images
    thumbnailUrl: { type: String },

    // === STATS ===
    totalOrdered: { type: Number, default: 0 },
    lastOrderedAt: { type: Date },

    // === TAGS ===
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
SwagPackSchema.index({ organization: 1, status: 1 });
SwagPackSchema.index({ organization: 1, type: 1 });
SwagPackSchema.index({ organization: 1, name: "text" });

// === VIRTUALS ===
SwagPackSchema.virtual("itemCount").get(function () {
  return this.items?.length || 0;
});

SwagPackSchema.virtual("totalQuantity").get(function () {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

// === METHODS ===
SwagPackSchema.methods.calculatePricing = function () {
  // Calculate items total
  const itemsTotal = this.items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  // Packaging fee based on box type
  const packagingFees = {
    standard: 15000,
    premium: 35000,
    eco: 20000,
  };
  const packagingFee = packagingFees[this.packaging?.boxType] || 15000;

  // Branding fee
  let brandingFee = 0;
  if (this.branding?.includeLogo) brandingFee += 10000;
  if (this.branding?.includeThankYouCard) brandingFee += 5000;

  // Kitting fee (per pack)
  const kittingFee = this.items.length * 5000; // 5k per item type

  const subtotal = itemsTotal + packagingFee + brandingFee + kittingFee;

  this.pricing = {
    itemsTotal,
    packagingFee,
    brandingFee,
    kittingFee,
    subtotal,
    unitPrice: subtotal,
  };

  return this.pricing;
};

// === PRE-SAVE ===
SwagPackSchema.pre("save", function (next) {
  if (
    this.isModified("items") ||
    this.isModified("packaging") ||
    this.isModified("branding")
  ) {
    this.calculatePricing();
  }
  next();
});

export const SwagPack =
  mongoose.models.SwagPack || mongoose.model("SwagPack", SwagPackSchema);

export { PACK_STATUS, PACK_TYPE };
