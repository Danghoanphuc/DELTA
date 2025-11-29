import { type Document, type Model, type Types } from "mongoose";
import { Infraction } from "../models/infraction.model.js";
import { TierRule } from "../models/tier-rule.model.js";
import { PrinterTier } from "@printz/types";

import {
  MasterOrder as MasterOrderModel,
  type MasterOrderDocument,
} from "../models/master-order.model.js";
// @ts-ignore
import { PrinterProfile as PrinterProfileModelJS } from "../../../customer-backend/src/shared/models/printer-profile.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const LATE_THRESHOLD_DAYS = 5;
const LATE_THRESHOLD_MS = LATE_THRESHOLD_DAYS * DAY_MS;
const AUTO_BAN_CANCEL_RATE = 0.2; // 20%
const DEFAULT_INFRACTION_POINTS = 25;

const TIER_ORDER: PrinterTier[] = [
  PrinterTier.BRONZE,
  PrinterTier.SILVER,
  PrinterTier.GOLD,
  PrinterTier.PLATINUM,
];

interface MasterOrderMetric {
  _id: Types.ObjectId;
  totalOrders: number;
  lateOrders: number;
  cancelOrders: number;
}

interface PrinterProfileDocument extends Document {
  _id: Types.ObjectId;
  tier?: PrinterTier;
  isActive: boolean;
  createdAt: Date;
  stats?: Record<string, any>;
  healthScore?: number;
}

const PrinterProfileModel =
  PrinterProfileModelJS as Model<PrinterProfileDocument>;

const computeHealthScore = (lateRate: number, cancelRate: number) => {
  const penalty =
    lateRate * 200 + // each % late penalizes strongly
    cancelRate * 300;
  return Math.max(40, Math.min(100, 100 - penalty));
};

const fetchPrinterMetrics = async (): Promise<MasterOrderMetric[]> => {
  const windowStart = new Date(Date.now() - WINDOW_DAYS * DAY_MS);

  const metrics = await MasterOrderModel.aggregate<MasterOrderMetric>([
    {
      $match: {
        createdAt: { $gte: windowStart },
      },
    },
    { $unwind: "$printerOrders" },
    {
      $match: {
        "printerOrders.printerProfileId": { $ne: null },
      },
    },
    {
      $project: {
        printerProfileId: "$printerOrders.printerProfileId",
        status: "$printerOrders.printerStatus",
        createdAt: "$createdAt",
        completedAt: "$printerOrders.completedAt",
        isLate: {
          $cond: [
            {
              $and: [
                { $ifNull: ["$printerOrders.completedAt", false] },
                {
                  $gt: [
                    "$printerOrders.completedAt",
                    { $add: ["$createdAt", LATE_THRESHOLD_MS] },
                  ],
                },
              ],
            },
            1,
            0,
          ],
        },
        isCancelled: {
          $cond: [{ $eq: ["$printerOrders.printerStatus", "cancelled"] }, 1, 0],
        },
      },
    },
    {
      $group: {
        _id: "$printerProfileId",
        totalOrders: { $sum: 1 },
        lateOrders: { $sum: "$isLate" },
        cancelOrders: { $sum: "$isCancelled" },
      },
    },
  ]);

  return metrics;
};

const getTierIndex = (tier?: PrinterTier | null) => {
  const current = tier ?? PrinterTier.BRONZE;
  const idx = TIER_ORDER.indexOf(current);
  return idx >= 0 ? idx : 0;
};

export const runDailyHealthCheck = async () => {
  console.log(
    `[Cron Worker] Bắt đầu chạy Tác vụ Sức khỏe hàng ngày... ${new Date().toISOString()}`
  );

  try {
    const [metrics, tierRules] = await Promise.all([
      fetchPrinterMetrics(),
      TierRule.find().lean().exec(),
    ]);

    if (!metrics.length) {
      console.log(
        "[Cron Worker] Không có dữ liệu đơn hàng trong 30 ngày gần nhất. Bỏ qua."
      );
      return;
    }

    const metricMap = new Map<string, MasterOrderMetric>();
    const printerIds: Types.ObjectId[] = [];
    for (const metric of metrics) {
      const id = metric._id.toString();
      metricMap.set(id, metric);
      printerIds.push(metric._id);
    }

    const tierRuleMap = new Map<string, (typeof tierRules)[number]>();
    for (const rule of tierRules) {
      tierRuleMap.set(rule.tier, rule);
    }

    const printers = await PrinterProfileModel.find({
      _id: { $in: printerIds },
    }).exec();

    let updatedCount = 0;
    let bannedCount = 0;

    for (const printer of printers) {
      const metric = metricMap.get(printer._id.toString());
      if (!metric || metric.totalOrders === 0) {
        continue;
      }

      const lateRate = metric.lateOrders / metric.totalOrders;
      const cancelRate = metric.cancelOrders / metric.totalOrders;
      const healthScore = computeHealthScore(lateRate, cancelRate);
      const now = new Date();
      const stats: Record<string, any> = {
        ...(printer.get("stats") ?? {}),
        lastHealthCheckAt: now,
        lastLateRate: lateRate,
        lastCancelRate: cancelRate,
        lastOrderSampleSize: metric.totalOrders,
      };

      let dirty = false;

      if (printer.get("healthScore") !== healthScore) {
        printer.set("healthScore", healthScore);
        dirty = true;
      }

      if (cancelRate > AUTO_BAN_CANCEL_RATE && printer.isActive) {
        printer.isActive = false;
        stats.lastDemotionAt = now;
        dirty = true;
        bannedCount += 1;

        await Infraction.create({
          printerProfileId: printer._id,
          type: "PRINTER_CANCELLATION",
          pointsDeducted: DEFAULT_INFRACTION_POINTS,
          notes: `Auto-ban do tỉ lệ hủy ${Math.round(
            cancelRate * 100
          )}% trong 30 ngày.`,
        });
      }

      const currentTier = printer.tier ?? PrinterTier.BRONZE;
      const currentIdx = getTierIndex(currentTier);
      const currentRule = tierRuleMap.get(currentTier);

      const lastTransitionRef =
        stats.lastPromotionAt || stats.lastDemotionAt || printer.createdAt;
      const daysInTier = lastTransitionRef
        ? (now.getTime() - new Date(lastTransitionRef).getTime()) / DAY_MS
        : Infinity;

      const needsDemotion =
        currentIdx > 0 &&
        currentRule &&
        (healthScore < currentRule.promotionCriteria.minHealthScore ||
          lateRate > currentRule.promotionCriteria.maxLateRate);

      if (needsDemotion) {
        const newTier = TIER_ORDER[currentIdx - 1];
        if (newTier && newTier !== currentTier) {
          printer.tier = newTier;
          stats.lastDemotionAt = now;
          dirty = true;
        }
      } else {
        const nextTier = TIER_ORDER[currentIdx + 1];
        const nextRule = nextTier ? tierRuleMap.get(nextTier) : null;
        const eligibleForPromotion =
          nextTier &&
          nextRule &&
          healthScore >= nextRule.promotionCriteria.minHealthScore &&
          lateRate <= nextRule.promotionCriteria.maxLateRate &&
          daysInTier >= nextRule.promotionCriteria.minDaysInTier;

        if (eligibleForPromotion && nextTier) {
          printer.tier = nextTier;
          stats.lastPromotionAt = now;
          dirty = true;
        }
      }

      if (dirty) {
        printer.set("stats", stats);
        await printer.save();
        updatedCount += 1;
      }
    }

    console.log(
      `[Cron Worker] Health check hoàn thành. Cập nhật ${updatedCount} nhà in, auto-ban ${bannedCount}.`
    );
  } catch (error) {
    console.error(
      "[Cron Worker] LỖI NGHIÊM TRỌNG khi đang chạy Health Check:",
      error
    );
  }
};
