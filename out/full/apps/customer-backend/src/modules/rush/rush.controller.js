// apps/customer-backend/src/modules/rush/rush.controller.js
import mongoose from "mongoose";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { Product } from "../../shared/models/product.model.js";
import { OrderService } from "../orders/order.service.js";
import { socketService } from "../../infrastructure/realtime/pusher.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class RushController {
  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Tìm các giải pháp rush order gần nhất
   * @route POST /api/rush/solutions
   * @access Private
   */
  findRushSolutions = async (req, res, next) => {
    try {
      const { lat, lng, category, deadlineHours } = req.body;

      // Validate input
      if (!lat || !lng) {
        throw new ValidationException("Thiếu tọa độ địa điểm (lat, lng).");
      }

      if (typeof lat !== "number" || typeof lng !== "number") {
        throw new ValidationException("Tọa độ phải là số.");
      }

      if (!deadlineHours || deadlineHours <= 0) {
        throw new ValidationException(
          "Thời gian deadline phải lớn hơn 0 giờ."
        );
      }

      Logger.debug(
        `[RushController] Tìm rush solutions tại [${lng}, ${lat}], category: ${category}, deadline: ${deadlineHours}h`
      );

      // 1. Tìm các nhà in gần nhất có acceptsRushOrders = true
      // Sử dụng $geoNear để tìm trong phạm vi maxRushDistanceKm
      const printers = await PrinterProfile.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [lng, lat], // MongoDB GeoJSON: [longitude, latitude]
            },
            distanceField: "distance", // Khoảng cách tính bằng mét
            spherical: true,
            query: {
              isActive: true,
              isVerified: true,
              "rushConfig.acceptsRushOrders": true,
              "shopAddress.location.coordinates": { $exists: true },
            },
          },
        },
        {
          $addFields: {
            distanceKm: {
              $divide: ["$distance", 1000], // Chuyển mét sang km
            },
          },
        },
        {
          $addFields: {
            withinRange: {
              $or: [
                {
                  $eq: ["$rushConfig.maxRushDistanceKm", 0], // 0 = không giới hạn
                },
                {
                  $gte: [
                    "$rushConfig.maxRushDistanceKm",
                    "$distanceKm",
                  ],
                },
              ],
            },
          },
        },
        {
          $match: {
            withinRange: true,
          },
        },
        {
          $lookup: {
            from: "products",
            let: { printerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$printerProfileId", "$$printerId"] },
                      { $eq: ["$isActive", true] },
                      { $eq: ["$isDraft", false] },
                      category ? { $eq: ["$category", category] } : true,
                      {
                        $lte: [
                          "$productionTime.min",
                          deadlineHours,
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: "products",
          },
        },
        {
          $match: {
            products: { $ne: [] }, // Chỉ lấy nhà in có sản phẩm phù hợp
          },
        },
        {
          $project: {
            _id: 1,
            businessName: 1,
            logoUrl: 1,
            distanceKm: 1,
            rushConfig: 1,
            currentRushQueue: 1,
            products: {
              _id: 1,
              name: 1,
              slug: 1,
              category: 1,
              basePrice: 1,
              pricing: 1,
              productionTime: 1,
              images: 1,
              specifications: 1,
            },
          },
        },
      ]);

      // 2. Tính toán giá ước tính cho mỗi sản phẩm (bao gồm rush fee)
      const solutions = [];

      for (const printer of printers) {
        for (const product of printer.products) {
          // Tính rush fee
          const basePrice = product.basePrice || 0;
          let rushFee = 0;

          const rushConfig = printer.rushConfig || {};
          if (rushConfig.rushFeePercentage > 0) {
            rushFee += basePrice * rushConfig.rushFeePercentage;
          }
          if (rushConfig.rushFeeFixed > 0) {
            rushFee += rushConfig.rushFeeFixed;
          }

          const estimatedPrice = basePrice + rushFee;

          solutions.push({
            printerProfileId: printer._id,
            printerBusinessName: printer.businessName,
            printerLogoUrl: printer.logoUrl,
            distanceKm: Math.round(printer.distanceKm * 100) / 100, // Làm tròn 2 chữ số
            currentRushQueue: printer.currentRushQueue || 0,
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              category: product.category,
              basePrice,
              estimatedPrice: Math.round(estimatedPrice),
              rushFee: Math.round(rushFee),
              productionTime: product.productionTime,
              images: product.images || [],
              specifications: product.specifications || {},
            },
            rushConfig: {
              acceptsRushOrders: rushConfig.acceptsRushOrders || false,
              maxRushDistanceKm: rushConfig.maxRushDistanceKm || 0,
              rushFeePercentage: rushConfig.rushFeePercentage || 0,
              rushFeeFixed: rushConfig.rushFeeFixed || 0,
            },
          });
        }
      }

      // 3. Sắp xếp: Ưu tiên khoảng cách gần, sau đó giá thấp
      solutions.sort((a, b) => {
        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }
        return a.product.estimatedPrice - b.product.estimatedPrice;
      });

      Logger.info(
        `[RushController] Tìm thấy ${solutions.length} giải pháp rush order`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          solutions,
          count: solutions.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tạo rush order
   * @route POST /api/rush/orders
   * @access Private
   */
  createRushOrder = async (req, res, next) => {
    try {
      const user = req.user;
      const {
        printerProfileId,
        productId,
        quantity,
        shippingAddress,
        customerNotes,
        requiredDeadline,
        customization,
      } = req.body;

      // Validate input
      if (!printerProfileId) {
        throw new ValidationException("Thiếu printerProfileId.");
      }

      if (!productId) {
        throw new ValidationException("Thiếu productId.");
      }

      if (!quantity || quantity < 1) {
        throw new ValidationException("Số lượng phải lớn hơn 0.");
      }

      if (!shippingAddress) {
        throw new ValidationException("Thiếu thông tin địa chỉ giao hàng.");
      }

      if (!requiredDeadline) {
        throw new ValidationException("Thiếu thời gian deadline.");
      }

      Logger.debug(
        `[RushController] Tạo rush order cho user ${user._id}, printer ${printerProfileId}, product ${productId}`
      );

      // 1. Validate printer và product
      const printerProfile = await PrinterProfile.findById(printerProfileId);
      if (!printerProfile) {
        throw new NotFoundException("Không tìm thấy nhà in.");
      }

      if (!printerProfile.isActive || !printerProfile.isVerified) {
        throw new ValidationException("Nhà in không hoạt động hoặc chưa được xác thực.");
      }

      if (!printerProfile.rushConfig?.acceptsRushOrders) {
        throw new ValidationException("Nhà in này không nhận rush orders.");
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundException("Không tìm thấy sản phẩm.");
      }

      if (product.printerProfileId.toString() !== printerProfileId.toString()) {
        throw new ValidationException("Sản phẩm không thuộc nhà in này.");
      }

      if (!product.isActive || product.isDraft) {
        throw new ValidationException("Sản phẩm không khả dụng.");
      }

      // 2. Tính giá đơn vị thực tế (dựa trên quantity tier)
      let unitPrice = product.basePrice || 0;
      if (product.pricing && product.pricing.length > 0) {
        const tier = product.pricing.find(
          (tier) =>
            quantity >= tier.minQuantity &&
            (!tier.maxQuantity || quantity <= tier.maxQuantity)
        );
        if (tier) {
          unitPrice = tier.pricePerUnit;
        }
      }

      // 3. Tính rush fee dựa trên giá đơn vị thực tế
      const rushConfig = printerProfile.rushConfig || {};
      let rushFeePerUnit = 0;

      if (rushConfig.rushFeePercentage > 0) {
        rushFeePerUnit += unitPrice * rushConfig.rushFeePercentage;
      }
      if (rushConfig.rushFeeFixed > 0) {
        rushFeePerUnit += rushConfig.rushFeeFixed;
      }

      const totalRushFee = Math.round(rushFeePerUnit * quantity);

      // 4. Tạo order data (tương tự như createOrder thông thường)
      // Map thành cartItems format để tái sử dụng OrderService
      const cartItems = [
        {
          productId: product._id.toString(),
          printerProfileId: printerProfileId.toString(),
          quantity,
          selectedPrice: {
            pricePerUnit: unitPrice, // ✅ Sử dụng unitPrice đã tính từ tier
          },
          customization: customization || {},
        },
      ];

      const orderData = {
        cartItems,
        shippingAddress,
        customerNotes: customerNotes || "",
        isRushOrder: true,
        requiredDeadline: new Date(requiredDeadline),
        rushFeeAmount: totalRushFee, // Rush fee cho toàn bộ quantity
      };

      // 4. Tạo order sử dụng OrderService (đã bao gồm rush order fields)
      const masterOrder = await this.orderService.createOrder(user, orderData);

      // 6. Cập nhật currentRushQueue của printer
      await PrinterProfile.findByIdAndUpdate(printerProfileId, {
        $inc: { currentRushQueue: 1 },
      });

      // 7. ✅ CRITICAL: Emit socket event để thông báo cho nhà in
      const printerOwnerId = printerProfile.user.toString();
      socketService.emitToUser(printerOwnerId, "printer:new_rush_order", {
        orderId: masterOrder._id,
        orderNumber: masterOrder.orderNumber,
        customerName: user.displayName,
        customerEmail: user.email,
        productName: product.name,
        quantity,
        requiredDeadline: masterOrder.requiredDeadline,
        rushFeeAmount: masterOrder.rushFeeAmount,
        totalAmount: masterOrder.totalPrice,
        createdAt: masterOrder.createdAt,
      });

      Logger.info(
        `[RushController] Tạo rush order thành công: ${masterOrder.orderNumber}, đã emit socket event cho printer owner ${printerOwnerId}`
      );

      res.status(API_CODES.CREATED).json(
        ApiResponse.success(
          { order: masterOrder },
          "Tạo rush order thành công!"
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

