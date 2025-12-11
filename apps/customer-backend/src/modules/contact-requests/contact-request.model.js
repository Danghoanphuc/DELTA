// apps/customer-backend/src/modules/contact-requests/contact-request.model.js
import mongoose from "mongoose";

export const CONTACT_REQUEST_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  QUOTED: "quoted",
  CONVERTED: "converted",
  CLOSED: "closed",
};

const contactRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CONTACT_REQUEST_STATUS),
      default: CONTACT_REQUEST_STATUS.NEW,
    },
    // Location data from Goong.io
    location: {
      ip: String,
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      district: String,
      ward: String,
      country: String,
    },
    // Metadata
    userAgent: String,
    referrer: String,
    source: {
      type: String,
      default: "contact_form",
    },
    // Notes from admin
    notes: String,
    contactedAt: Date,
    quotedAt: Date,
    convertedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
contactRequestSchema.index({ phone: 1 });
contactRequestSchema.index({ email: 1 });
contactRequestSchema.index({ status: 1 });
contactRequestSchema.index({ createdAt: -1 });

export const ContactRequest = mongoose.model(
  "ContactRequest",
  contactRequestSchema
);
