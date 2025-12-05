// src/modules/recipients/recipient.model.js
// ✅ Recipient Model - Quản lý danh sách người nhận quà (SwagUp-style)

import mongoose from "mongoose";

const RECIPIENT_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  BOUNCED: "bounced", // Email không hợp lệ
};

const RecipientSchema = new mongoose.Schema(
  {
    // === ORGANIZATION LINK ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },

    // === BASIC INFO ===
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    // === SHIPPING ADDRESS ===
    address: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, default: "Vietnam" },
      postalCode: { type: String, trim: true },
    },

    // === PERSONALIZATION (cho Kitting) ===
    customFields: {
      department: { type: String, trim: true },
      jobTitle: { type: String, trim: true },
      employeeId: { type: String, trim: true },
      shirtSize: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      },
      startDate: { type: Date },
      notes: { type: String, trim: true },
    },

    // === TAGS (for filtering) ===
    tags: [{ type: String, trim: true }],

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(RECIPIENT_STATUS),
      default: RECIPIENT_STATUS.ACTIVE,
    },

    // === STATS ===
    totalGiftsSent: { type: Number, default: 0 },
    lastGiftSentAt: { type: Date },

    // === IMPORT SOURCE ===
    importSource: {
      type: String,
      enum: ["manual", "csv", "api", "hris"],
      default: "manual",
    },
    importBatchId: { type: String }, // Track CSV imports
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
RecipientSchema.index({ organization: 1, email: 1 }, { unique: true });
RecipientSchema.index({ organization: 1, status: 1 });
RecipientSchema.index({ organization: 1, tags: 1 });
RecipientSchema.index({ organization: 1, "customFields.department": 1 });

// === VIRTUALS ===
RecipientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

RecipientSchema.virtual("fullAddress").get(function () {
  const parts = [
    this.address?.street,
    this.address?.ward,
    this.address?.district,
    this.address?.city,
  ].filter(Boolean);
  return parts.join(", ");
});

export const Recipient =
  mongoose.models.Recipient || mongoose.model("Recipient", RecipientSchema);

export { RECIPIENT_STATUS };
