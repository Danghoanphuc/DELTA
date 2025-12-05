// src/modules/swag-orders/swag-order.repository.js
// ✅ Swag Order Repository - Data access layer

import { SwagOrder } from "./swag-order.model.js";

export class SwagOrderRepository {
  async create(data) {
    const order = new SwagOrder(data);
    return await order.save();
  }

  async findById(id) {
    return await SwagOrder.findById(id)
      .populate("swagPack")
      .populate("createdBy", "displayName email")
      .populate("recipientShipments.recipient");
  }

  async findByOrganization(organizationId, options = {}) {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = { organization: organizationId };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [orders, total] = await Promise.all([
      SwagOrder.find(query)
        .populate("swagPack", "name thumbnailUrl")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      SwagOrder.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySelfServiceToken(token) {
    return await SwagOrder.findOne({
      "recipientShipments.selfServiceToken": token,
      "recipientShipments.selfServiceExpiry": { $gt: new Date() },
    });
  }

  async update(id, data) {
    return await SwagOrder.findByIdAndUpdate(id, data, { new: true });
  }

  async updateShipmentStatus(orderId, recipientId, status, trackingInfo = {}) {
    return await SwagOrder.findOneAndUpdate(
      { _id: orderId, "recipientShipments.recipient": recipientId },
      {
        $set: {
          "recipientShipments.$.shipmentStatus": status,
          ...(trackingInfo.trackingNumber && {
            "recipientShipments.$.trackingNumber": trackingInfo.trackingNumber,
          }),
          ...(trackingInfo.trackingUrl && {
            "recipientShipments.$.trackingUrl": trackingInfo.trackingUrl,
          }),
          ...(trackingInfo.carrier && {
            "recipientShipments.$.carrier": trackingInfo.carrier,
          }),
          ...(status === "shipped" && {
            "recipientShipments.$.shippedAt": new Date(),
          }),
          ...(status === "delivered" && {
            "recipientShipments.$.deliveredAt": new Date(),
          }),
        },
      },
      { new: true }
    );
  }

  async delete(id) {
    return await SwagOrder.findByIdAndDelete(id);
  }

  async countByOrganization(organizationId, status) {
    const query = { organization: organizationId };
    if (status) query.status = status;
    return await SwagOrder.countDocuments(query);
  }

  async getStats(organizationId) {
    const stats = await SwagOrder.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRecipients: { $sum: "$totalRecipients" },
          totalSpent: { $sum: "$pricing.total" },
        },
      },
    ]);

    return stats.reduce((acc, s) => {
      acc[s._id] = {
        count: s.count,
        totalRecipients: s.totalRecipients,
        totalSpent: s.totalSpent,
      };
      return acc;
    }, {});
  }

  async getRecentOrders(organizationId, limit = 5) {
    return await SwagOrder.find({ organization: organizationId })
      .populate("swagPack", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
