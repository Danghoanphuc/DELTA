/**
 * Organization Model (Stub)
 *
 * This is a stub model for OrganizationProfile
 * The actual model exists in customer-backend
 * This stub allows admin-backend to reference organizations
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IOrganizationProfile extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  displayName?: string; // Alias for name
  businessName?: string;
  taxCode?: string; // Tax identification number
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  billingInfo?: {
    companyName?: string;
    taxId?: string;
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  tier?: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationProfileSchema = new Schema<IOrganizationProfile>(
  {
    name: { type: String },
    displayName: { type: String },
    businessName: { type: String },
    taxCode: { type: String },
    email: { type: String },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    billingInfo: {
      companyName: String,
      taxId: String,
      billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
    },
    tier: { type: String },
  },
  {
    timestamps: true,
    strict: false, // Allow fields not in schema
    collection: "organizationprofiles", // Same collection as customer-backend
  }
);

export const OrganizationProfile = mongoose.model<IOrganizationProfile>(
  "OrganizationProfile",
  organizationProfileSchema
);
