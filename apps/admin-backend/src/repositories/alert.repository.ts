/**
 * Alert Repository
 *
 * Data access layer for alerts
 */

import { Alert, IAlert, ALERT_STATUS } from "../models/alert.model.js";
import { FilterQuery } from "mongoose";

export class AlertRepository {
  /**
   * Create a new alert
   */
  async create(data: Partial<IAlert>): Promise<IAlert> {
    const alert = new Alert(data);
    return await alert.save();
  }

  /**
   * Find alert by ID
   */
  async findById(id: string): Promise<IAlert | null> {
    return await Alert.findById(id)
      .populate("recipientId", "displayName email")
      .populate("acknowledgedBy", "displayName email")
      .populate("escalatedTo", "displayName email")
      .lean();
  }

  /**
   * Find pending alerts (not yet sent)
   */
  async findPending(
    options: {
      limit?: number;
      urgency?: string;
    } = {}
  ): Promise<IAlert[]> {
    const { limit = 100, urgency } = options;

    const query: FilterQuery<IAlert> = {
      status: ALERT_STATUS.PENDING,
    };

    if (urgency) {
      query.urgency = urgency;
    }

    return await Alert.find(query)
      .sort({ urgency: -1, createdAt: 1 })
      .limit(limit)
      .populate("recipientId", "displayName email")
      .lean();
  }

  /**
   * Find alerts by recipient
   */
  async findByRecipient(
    recipientId: string,
    options: {
      status?: string;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{ alerts: IAlert[]; total: number }> {
    const { status, limit = 20, skip = 0 } = options;

    const query: FilterQuery<IAlert> = {
      recipientId,
    };

    if (status) {
      query.status = status;
    }

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("orderId", "orderNumber expectedCompletionDate status")
        .lean(),
      Alert.countDocuments(query),
    ]);

    return { alerts, total };
  }

  /**
   * Find alerts by order
   */
  async findByOrder(orderId: string): Promise<IAlert[]> {
    return await Alert.find({ orderId })
      .sort({ createdAt: -1 })
      .populate("recipientId", "displayName email")
      .lean();
  }

  /**
   * Mark alert as sent
   */
  async markSent(id: string): Promise<IAlert | null> {
    return await Alert.findByIdAndUpdate(
      id,
      {
        status: ALERT_STATUS.SENT,
        sentAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Mark alert as acknowledged
   */
  async markAcknowledged(
    id: string,
    acknowledgedBy: string
  ): Promise<IAlert | null> {
    return await Alert.findByIdAndUpdate(
      id,
      {
        status: ALERT_STATUS.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
        acknowledgedBy,
      },
      { new: true }
    );
  }

  /**
   * Mark alert as resolved
   */
  async markResolved(id: string): Promise<IAlert | null> {
    return await Alert.findByIdAndUpdate(
      id,
      {
        status: ALERT_STATUS.RESOLVED,
        resolvedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Escalate alert to another user
   */
  async escalate(id: string, escalateTo: string): Promise<IAlert | null> {
    return await Alert.findByIdAndUpdate(
      id,
      {
        escalatedTo: escalateTo,
        escalatedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Count pending alerts by recipient
   */
  async countPendingByRecipient(recipientId: string): Promise<number> {
    return await Alert.countDocuments({
      recipientId,
      status: { $in: [ALERT_STATUS.PENDING, ALERT_STATUS.SENT] },
    });
  }

  /**
   * Find orders with upcoming deadlines
   * Used for deadline checking job
   */
  async findOrdersWithUpcomingDeadlines(
    hoursThreshold: number
  ): Promise<any[]> {
    const now = new Date();
    const thresholdDate = new Date(
      now.getTime() + hoursThreshold * 60 * 60 * 1000
    );

    // Import ProductionOrder model dynamically to avoid circular dependency
    const { ProductionOrder } = await import(
      "../models/production-order.model.js"
    );

    return await ProductionOrder.find({
      expectedCompletionDate: {
        $gte: now,
        $lte: thresholdDate,
      },
      status: {
        $nin: ["completed", "failed", "cancelled"],
      },
    })
      .select("_id swagOrderNumber expectedCompletionDate status")
      .lean();
  }

  /**
   * Check if alert already exists for order and type
   */
  async existsForOrder(
    orderId: string,
    type: string,
    withinHours: number = 24
  ): Promise<boolean> {
    const cutoffDate = new Date(Date.now() - withinHours * 60 * 60 * 1000);

    const count = await Alert.countDocuments({
      orderId,
      type,
      createdAt: { $gte: cutoffDate },
    });

    return count > 0;
  }
}
