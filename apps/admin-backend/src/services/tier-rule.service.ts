// apps/admin-backend/src/services/tier-rule.service.ts
import { TierRule, type ITierRule } from "../models/tier-rule.model.js";
import { NotFoundException } from "../shared/exceptions.js";
import { type ITierRule as ITierRuleContract } from "@printz/types";

/**
 * Lấy tất cả các luật
 */
export const getAllTierRules = async (): Promise<ITierRule[]> => {
  return await TierRule.find().sort({ commissionPercent: 1 });
};

/**
 * Tạo/Cập nhật một luật
 * (Dùng "upsert" để dễ dàng quản lý)
 */
export const upsertTierRule = async (
  ruleData: Partial<ITierRuleContract>
): Promise<ITierRule> => {
  if (!ruleData.tier) {
    throw new Error("Tier (bậc) là bắt buộc để tạo/cập nhật luật.");
  }

  const rule = await TierRule.findOneAndUpdate(
    { tier: ruleData.tier }, // Tìm theo bậc
    { $set: ruleData }, // Cập nhật dữ liệu
    { new: true, upsert: true } // 'new' = trả về doc mới, 'upsert' = tạo nếu chưa có
  );
  return rule;
};

/**
 * Lấy một luật theo ID
 */
export const getTierRuleById = async (id: string): Promise<ITierRule> => {
  const rule = await TierRule.findById(id);
  if (!rule) {
    throw new NotFoundException("TierRule", id);
  }
  return rule;
};
