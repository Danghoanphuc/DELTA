// apps/customer-backend/src/shared/models/printer-profile.model.js
// ✅ FIX: Schema đầy đủ với tất cả các trường cần thiết

import mongoose from "mongoose";
import { PRINTER_TIERS_OBJECT } from "@printz/types";

const PrinterProfileSchema = new mongoose.Schema(
  {
    // ✅ FIX: USER REFERENCE (Quan trọng - để populate)
    // Note: unique và index được khai báo ở schema.index() để tránh duplicate
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ FIX: THÔNG TIN CƠ BẢN (Bắt buộc)
    // Note: index được khai báo ở schema.index() để tránh duplicate
    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ FIX: HÌNH ẢNH
    logoUrl: {
      type: String,
    },

    coverImage: {
      type: String,
    },

    // ✅ FIX: ĐỊA CHỈ XƯỞNG IN (Bắt buộc)
    shopAddress: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      ward: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
          validate: {
            validator: function (v) {
              return (
                Array.isArray(v) &&
                v.length === 2 &&
                typeof v[0] === "number" &&
                typeof v[1] === "number"
              );
            },
            message: "Coordinates must be an array of 2 numbers [long, lat]",
          },
        },
      },
    },

    // ✅ FIX: VERIFICATION STATUS (Bắt buộc)
    // Note: index được khai báo ở schema.index() để tránh duplicate
    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending_review", "approved", "rejected"],
      default: "not_submitted",
      required: true,
    },

    verificationDocs: {
      gpkdUrl: {
        type: String,
      },
      cccdUrl: {
        type: String,
      },
    },

    // Note: index được khai báo ở schema.index() để tránh duplicate
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    // ✅ FIX: TIER & COMMISSION
    // Note: index được khai báo ở schema.index() để tránh duplicate
    tier: {
      type: String,
      enum: Object.values(PRINTER_TIERS_OBJECT),
      default: PRINTER_TIERS_OBJECT.STANDARD,
    },

    standardCommissionRate: {
      type: Number,
      default: 0.1, // Mặc định 10%
      min: 0,
      max: 1,
    },

    commissionOverride: {
      rate: { type: Number, min: 0, max: 1 },
      expiresAt: { type: Date },
    },

    // ✅ OPTIONAL: HEALTH METRICS (Nếu cần)
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    dailyCapacity: {
      type: Number,
      default: 100,
      min: 0,
    },

    currentQueueSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ OPTIONAL: STATS
    stats: {
      lastDemotionAt: Date,
      lastPromotionAt: Date,
    },

    // ✅ OPTIONAL: BUSINESS INFO
    specialties: {
      type: [String],
      default: [],
    },

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

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ OPTIONAL: STRIPE INTEGRATION
    stripeAccountId: {
      type: String,
    },

    stripeAccountStatus: {
      type: String,
      enum: ["PENDING", "ACTIVE", "RESTRICTED", "UNKNOWN"],
    },

    // ✅ OPTIONAL: GALLERY (Factory images)
    factoryImages: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          default: "",
        },
      },
    ],

    factoryVideoUrl: {
      type: String,
    },

    // ✅ OPTIONAL: BUSINESS LICENSE
    businessLicense: {
      type: String,
    },

    taxCode: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // ✅ FIX: Thêm userId virtual từ user để backward compatibility
        if (ret.user && typeof ret.user === "object" && ret.user._id) {
          ret.userId = ret.user._id;
        } else if (ret.user && typeof ret.user === "string") {
          ret.userId = ret.user;
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ✅ FIX: Pre-save validation (Chỉ validate khi tạo mới)
PrinterProfileSchema.pre("save", function (next) {
  // Khi tạo mới, validate tất cả required fields
  if (this.isNew) {
    if (!this.user) {
      return next(new Error("User reference is required"));
    }
    if (!this.businessName || !this.businessName.trim()) {
      return next(new Error("Business name is required"));
    }
    if (!this.contactPhone || !this.contactPhone.trim()) {
      return next(new Error("Contact phone is required"));
    }
    if (!this.shopAddress) {
      return next(new Error("Shop address is required"));
    }
    if (!this.shopAddress.street || !this.shopAddress.district || !this.shopAddress.city) {
      return next(new Error("Shop address must have street, district, and city"));
    }
    // Validate coordinates nếu có
    if (this.shopAddress.location && this.shopAddress.location.coordinates) {
      const [lng, lat] = this.shopAddress.location.coordinates;
      if (
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
      ) {
        return next(new Error("Invalid coordinates: must be [longitude, latitude]"));
      }
    }
  }
  
  // Khi update, validate coordinates nếu có thay đổi
  if (!this.isNew && this.isModified("shopAddress") && this.shopAddress) {
    if (this.shopAddress.location && this.shopAddress.location.coordinates) {
      const [lng, lat] = this.shopAddress.location.coordinates;
      if (
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
      ) {
        return next(new Error("Invalid coordinates: must be [longitude, latitude]"));
      }
    }
  }
  
  next();
});

// ✅ FIX: Indexes (Quan trọng cho performance)
PrinterProfileSchema.index({ user: 1 }, { unique: true });
PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });
PrinterProfileSchema.index({ verificationStatus: 1 });
PrinterProfileSchema.index({ isVerified: 1 });
PrinterProfileSchema.index({ isActive: 1 });
PrinterProfileSchema.index({ tier: 1 });
PrinterProfileSchema.index({ createdAt: -1 });
PrinterProfileSchema.index({ updatedAt: -1 });

// ✅ FIX: Virtual để backward compatibility
PrinterProfileSchema.virtual("printerProfileId").get(function () {
  return this._id;
});

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);
