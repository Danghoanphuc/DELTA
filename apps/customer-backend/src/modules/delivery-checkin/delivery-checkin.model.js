// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.model.js
/**
 * Delivery Check-in Model
 *
 * Lưu trữ thông tin check-in giao hàng của shipper.
 * Sử dụng Polymorphic Reference Pattern để hỗ trợ nhiều loại order.
 *
 * @module DeliveryCheckinModel
 */

import mongoose from "mongoose";
import {
  ORDER_TYPES,
  ORDER_TYPE_TO_MODEL,
} from "../../shared/constants/order-types.constant.js";

export const CHECKIN_STATUS = {
  PENDING: "pending", // Đang xử lý upload
  COMPLETED: "completed", // Hoàn tất
  FAILED: "failed", // Upload thất bại
};

/**
 * Photo Schema - Embedded document for check-in photos
 */
const PhotoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    filename: String,
    size: Number, // bytes
    mimeType: String,
    width: Number,
    height: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * GPS Metadata Schema - Embedded document for GPS data
 */
const GPSMetadataSchema = new mongoose.Schema(
  {
    accuracy: Number, // meters
    altitude: Number, // meters
    heading: Number, // degrees
    speed: Number, // m/s
    timestamp: Date, // GPS timestamp
    source: {
      type: String,
      enum: ["device", "browser", "manual"],
      default: "device",
    },
  },
  { _id: false }
);

/**
 * Address Schema - Embedded document for address (from Goong.io)
 */
const AddressSchema = new mongoose.Schema(
  {
    formatted: {
      type: String,
      required: true,
    },
    street: String,
    ward: String,
    district: String,
    city: String,
    country: {
      type: String,
      default: "Vietnam",
    },
  },
  { _id: false }
);

/**
 * Main Delivery Check-in Schema
 */
const deliveryCheckinSchema = new mongoose.Schema(
  {
    // ============================================
    // POLYMORPHIC ORDER REFERENCE
    // Hỗ trợ cả SwagOrder và MasterOrder
    // ============================================

    /**
     * Order Type - Discriminator for polymorphic reference
     * Determines which model orderId refers to
     */
    orderType: {
      type: String,
      enum: Object.values(ORDER_TYPES),
      required: true,
      index: true,
    },

    /**
     * Order ID - Polymorphic reference
     * Uses refPath to dynamically reference correct model
     */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "orderModel",
      required: true,
      index: true,
    },

    /**
     * Order Model - Virtual field for refPath
     * Computed from orderType
     */
    orderModel: {
      type: String,
      required: true,
      enum: Object.values(ORDER_TYPE_TO_MODEL),
    },

    /**
     * Order Number - Denormalized for quick access
     * Avoids need to populate for display
     */
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    // ============================================
    // SHIPPER INFO
    // ============================================
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shipperName: {
      type: String,
      required: true,
    },

    // ============================================
    // CUSTOMER INFO (Denormalized)
    // ============================================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },

    // ============================================
    // LOCATION DATA
    // ============================================
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    address: AddressSchema,
    gpsMetadata: GPSMetadataSchema,

    // ============================================
    // PHOTOS
    // ============================================
    photos: [PhotoSchema],

    // ============================================
    // NOTES & THREAD
    // ============================================
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      index: true,
    },

    // ============================================
    // STATUS & TIMESTAMPS
    // ============================================
    status: {
      type: String,
      enum: Object.values(CHECKIN_STATUS),
      default: CHECKIN_STATUS.PENDING,
      index: true,
    },
    checkinAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // ============================================
    // NOTIFICATION STATUS
    // ============================================
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,

    // ============================================
    // SOFT DELETE
    // ============================================
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
deliveryCheckinSchema.index({ orderId: 1, orderType: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ shipperId: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ customerId: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ location: "2dsphere" });
deliveryCheckinSchema.index({ status: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ orderNumber: 1, orderType: 1 });

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

/**
 * Auto-set orderModel from orderType before save
 */
deliveryCheckinSchema.pre("save", function (next) {
  if (this.orderType && !this.orderModel) {
    this.orderModel = ORDER_TYPE_TO_MODEL[this.orderType];
  }
  next();
});

/**
 * Auto-set orderModel on update
 */
deliveryCheckinSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.orderType && !update.orderModel) {
    update.orderModel = ORDER_TYPE_TO_MODEL[update.orderType];
  }
  next();
});

// ============================================
// VIRTUALS
// ============================================

/**
 * Get primary photo
 */
deliveryCheckinSchema.virtual("primaryPhoto").get(function () {
  return this.photos && this.photos.length > 0 ? this.photos[0] : null;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Check if user can delete this check-in
 */
deliveryCheckinSchema.methods.canDelete = function (userId) {
  return this.shipperId.toString() === userId.toString();
};

/**
 * Check if this is a SwagOrder check-in
 */
deliveryCheckinSchema.methods.isSwagOrder = function () {
  return this.orderType === ORDER_TYPES.SWAG;
};

/**
 * Check if this is a MasterOrder check-in
 */
deliveryCheckinSchema.methods.isMasterOrder = function () {
  return this.orderType === ORDER_TYPES.MASTER;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find check-ins by order (with type)
 */
deliveryCheckinSchema.statics.findByOrder = function (
  orderId,
  orderType = null
) {
  const query = { orderId, isDeleted: false };
  if (orderType) {
    query.orderType = orderType;
  }
  return this.find(query).sort({ checkinAt: -1 }).lean();
};

/**
 * Find check-ins by shipper
 */
deliveryCheckinSchema.statics.findByShipper = function (
  shipperId,
  options = {}
) {
  const query = { shipperId, isDeleted: false };
  if (options.orderType) {
    query.orderType = options.orderType;
  }
  return this.find(query)
    .sort({ checkinAt: -1 })
    .limit(options.limit || 50)
    .lean();
};

/**
 * Find check-ins by customer
 */
deliveryCheckinSchema.statics.findByCustomer = function (
  customerId,
  options = {}
) {
  const query = { customerId, isDeleted: false };
  if (options.orderType) {
    query.orderType = options.orderType;
  }
  return this.find(query)
    .sort({ checkinAt: -1 })
    .limit(options.limit || 100)
    .lean();
};

/**
 * Find check-ins within geographic bounds
 */
deliveryCheckinSchema.statics.findWithinBounds = function (
  bounds,
  options = {}
) {
  const query = {
    location: {
      $geoWithin: {
        $box: [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
      },
    },
    isDeleted: false,
  };

  if (options.orderType) {
    query.orderType = options.orderType;
  }
  if (options.customerId) {
    query.customerId = options.customerId;
  }

  return this.find(query).lean();
};

/**
 * Count check-ins by order type
 */
deliveryCheckinSchema.statics.countByOrderType = async function () {
  return this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$orderType", count: { $sum: 1 } } },
  ]);
};

// ============================================
// EXPORT
// ============================================

export const DeliveryCheckin =
  mongoose.models.DeliveryCheckin ||
  mongoose.model("DeliveryCheckin", deliveryCheckinSchema);
