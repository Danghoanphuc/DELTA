// src/services/admin.delivery-checkin.service.ts
// ✅ Admin Delivery Check-in Service

import mongoose from "mongoose";
import Logger from "../infrastructure/logger.js";

// Order types constants (matching customer-backend)
const ORDER_TYPES = {
  SWAG: "swag",
  MASTER: "master",
};

const ORDER_TYPE_TO_MODEL: Record<string, string> = {
  [ORDER_TYPES.SWAG]: "SwagOrder",
  [ORDER_TYPES.MASTER]: "MasterOrder",
};

interface GetCheckinsOptions {
  page?: number;
  limit?: number;
  orderType?: string;
  status?: string;
  shipperId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface Bounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

interface BoundsOptions {
  orderType?: string;
  customerId?: string;
}

export class DeliveryCheckinService {
  private DeliveryCheckin: mongoose.Model<any>;

  constructor() {
    // Get or create the DeliveryCheckin model
    try {
      this.DeliveryCheckin = mongoose.model("DeliveryCheckin");
    } catch {
      // Model not registered yet, create schema
      const deliveryCheckinSchema = new mongoose.Schema(
        {
          orderType: String,
          orderModel: String,
          orderId: mongoose.Schema.Types.ObjectId,
          orderNumber: String,
          shipperId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          shipperName: String,
          customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          customerEmail: String,
          location: {
            type: { type: String, default: "Point" },
            coordinates: [Number],
          },
          address: {
            formatted: String,
            street: String,
            ward: String,
            district: String,
            city: String,
            country: String,
          },
          gpsMetadata: {
            accuracy: Number,
            altitude: Number,
            heading: Number,
            speed: Number,
            timestamp: Date,
            source: String,
          },
          photos: [
            {
              url: String,
              thumbnailUrl: String,
              filename: String,
              size: Number,
              mimeType: String,
              width: Number,
              height: Number,
              uploadedAt: Date,
            },
          ],
          notes: String,
          threadId: mongoose.Schema.Types.ObjectId,
          status: String,
          checkinAt: Date,
          emailSent: Boolean,
          emailSentAt: Date,
          isDeleted: { type: Boolean, default: false },
          deletedAt: Date,
          deletedBy: mongoose.Schema.Types.ObjectId,
        },
        { timestamps: true }
      );

      deliveryCheckinSchema.index({ location: "2dsphere" });
      this.DeliveryCheckin = mongoose.model(
        "DeliveryCheckin",
        deliveryCheckinSchema
      );
    }
  }

  /**
   * Get all delivery check-ins with filters
   */
  async getCheckins(options: GetCheckinsOptions) {
    const {
      page = 1,
      limit = 20,
      orderType,
      status,
      shipperId,
      customerId,
      startDate,
      endDate,
      search,
    } = options;

    const query: any = { isDeleted: false };

    // Apply filters
    if (orderType) query.orderType = orderType;
    if (status) query.status = status;
    if (shipperId) query.shipperId = new mongoose.Types.ObjectId(shipperId);
    if (customerId) query.customerId = new mongoose.Types.ObjectId(customerId);

    // Date range
    if (startDate || endDate) {
      query.checkinAt = {};
      if (startDate) query.checkinAt.$gte = new Date(startDate);
      if (endDate) query.checkinAt.$lte = new Date(endDate);
    }

    // Search by orderNumber or shipperName
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { shipperName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [checkins, total] = await Promise.all([
      this.DeliveryCheckin.find(query)
        .populate("shipperId", "displayName email avatarUrl")
        .populate("customerId", "displayName email")
        .sort({ checkinAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.DeliveryCheckin.countDocuments(query),
    ]);

    Logger.debug(
      `[AdminDeliveryCheckinSvc] Found ${checkins.length}/${total} check-ins`
    );

    return {
      checkins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get delivery check-in statistics
   */
  async getStats() {
    const [totalCheckins, byOrderType, byStatus, recentCheckins] =
      await Promise.all([
        // Total count
        this.DeliveryCheckin.countDocuments({ isDeleted: false }),

        // By order type
        this.DeliveryCheckin.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: "$orderType", count: { $sum: 1 } } },
        ]),

        // By status
        this.DeliveryCheckin.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // Recent check-ins (last 7 days)
        this.DeliveryCheckin.aggregate([
          {
            $match: {
              isDeleted: false,
              checkinAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$checkinAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return {
      totalCheckins,
      byOrderType: byOrderType.reduce((acc, item) => {
        acc[item._id || "unknown"] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id || "unknown"] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recentCheckins,
    };
  }

  /**
   * Get check-ins within geographic bounds
   */
  async getCheckinsByBounds(bounds: Bounds, options: BoundsOptions = {}) {
    const { orderType, customerId } = options;

    const query: any = {
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

    if (orderType) query.orderType = orderType;
    if (customerId) query.customerId = new mongoose.Types.ObjectId(customerId);

    const checkins = await this.DeliveryCheckin.find(query)
      .select(
        "_id location orderNumber orderType shipperName photos.thumbnailUrl checkinAt address.formatted"
      )
      .sort({ checkinAt: -1 })
      .limit(500)
      .lean();

    Logger.debug(
      `[AdminDeliveryCheckinSvc] Found ${checkins.length} check-ins within bounds`
    );

    return checkins;
  }

  /**
   * Get single check-in by ID
   */
  async getCheckinById(id: string) {
    const checkin = (await this.DeliveryCheckin.findById(id)
      .populate("shipperId", "displayName email avatarUrl")
      .populate("customerId", "displayName email")
      .lean()) as any;

    if (!checkin) {
      throw new Error("Check-in không tồn tại");
    }

    // Resolve order info
    if (checkin.orderType && checkin.orderId) {
      try {
        const modelName = ORDER_TYPE_TO_MODEL[checkin.orderType];
        if (modelName) {
          const OrderModel = mongoose.model(modelName);
          const order = await OrderModel.findById(checkin.orderId)
            .select("orderNumber status paymentStatus")
            .lean();
          checkin.order = order;
        }
      } catch (error) {
        Logger.warn(
          `[AdminDeliveryCheckinSvc] Could not resolve order for check-in ${id}`
        );
      }
    }

    return checkin;
  }

  /**
   * Get check-ins for a specific order
   */
  async getCheckinsByOrder(orderId: string, orderType?: string) {
    const query: any = {
      orderId: new mongoose.Types.ObjectId(orderId),
      isDeleted: false,
    };

    if (orderType) query.orderType = orderType;

    const checkins = await this.DeliveryCheckin.find(query)
      .populate("shipperId", "displayName email avatarUrl")
      .sort({ checkinAt: -1 })
      .lean();

    return checkins;
  }

  /**
   * Get check-ins by shipper
   */
  async getCheckinsByShipper(
    shipperId: string,
    options: { page?: number; limit?: number; orderType?: string } = {}
  ) {
    const { page = 1, limit = 20, orderType } = options;

    const query: any = {
      shipperId: new mongoose.Types.ObjectId(shipperId),
      isDeleted: false,
    };

    if (orderType) query.orderType = orderType;

    const skip = (page - 1) * limit;

    const [checkins, total] = await Promise.all([
      this.DeliveryCheckin.find(query)
        .sort({ checkinAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.DeliveryCheckin.countDocuments(query),
    ]);

    return {
      checkins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a check-in (soft delete)
   */
  async deleteCheckin(id: string, adminId: string) {
    const checkin = await this.DeliveryCheckin.findById(id);

    if (!checkin) {
      throw new Error("Check-in không tồn tại");
    }

    if (checkin.isDeleted) {
      throw new Error("Check-in đã bị xóa trước đó");
    }

    await this.DeliveryCheckin.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: new mongoose.Types.ObjectId(adminId),
    });

    Logger.info(
      `[AdminDeliveryCheckinSvc] Admin ${adminId} deleted check-in ${id}`
    );
  }
}
