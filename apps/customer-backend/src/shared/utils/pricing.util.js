// backend/src/shared/utils/pricing.util.js
import { ValidationException } from "../exceptions/index.js";

/**
 * 📈 Single Source of Truth for Price Tier Calculation
 * Tìm bậc giá (price tier) tốt nhất dựa trên số lượng.
 * @param {Array} pricing - Mảng product.pricing
 * @param {number} quantity - Số lượng
 * @returns {Object} - Bậc giá phù hợp
 */
export function findBestPriceTier(pricing = [], quantity) {
  if (!pricing || pricing.length === 0) {
    return null; // Trả về null để service tự xử lý lỗi
  }

  let bestTier = pricing[0]; // Mặc định lấy bậc đầu tiên

  // Tìm bậc giá có minQuantity cao nhất mà vẫn <= số lượng mua
  for (const tier of pricing) {
    if (quantity >= tier.minQuantity) {
      if (tier.minQuantity >= bestTier.minQuantity) {
        bestTier = tier;
      }
    }
  }

  // Đảm bảo rằng số lượng phải lớn hơn minQuantity của bậc giá thấp nhất
  if (quantity < pricing[0].minQuantity) {
    // Nếu số lượng yêu cầu thấp hơn mức tối thiểu, coi như không hợp lệ
    throw new ValidationException(
      `Số lượng ${quantity} không đạt mức tối thiểu ${pricing[0].minQuantity} của sản phẩm.`
    );
  }

  return bestTier;
}
