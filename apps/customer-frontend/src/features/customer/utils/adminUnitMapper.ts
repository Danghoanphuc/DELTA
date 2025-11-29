// apps/customer-frontend/src/features/customer/utils/adminUnitMapper.ts

/**
 * UTILS: Hàm chuẩn hóa chuỗi tiếng Việt để tạo Key so sánh
 * Ví dụ: "Thành phố Hồ Chí Minh" -> "thanh-pho-ho-chi-minh"
 * "Q.3" -> "quan-3"
 */
const normalizeKey = (str: string): string => {
  if (!str) return "";
  return (
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "-") // Thay ký tự đặc biệt bằng -
      .replace(/-+/g, "-") // Xóa dấu - thừa
      .replace(/^-|-$/g, "") // Xóa - ở đầu cuối
      // Xử lý một số từ viết tắt thông dụng
      .replace(/^tp-/, "thanh-pho-")
      .replace(/^q-/, "quan-")
      .replace(/^p-/, "phuong-")
      .replace(/^tx-/, "thi-xa-")
  );
};

/**
 * INTERFACE định nghĩa cấu trúc thay đổi
 */
interface AdminUnitChange {
  oldName: string;
  newName: string; // Tên đơn vị hành chính MỚI
  district: string;
  province: string;
  effectiveDate: string; // Ngày hiệu lực (VD: 01/07/2025)
  reason: string; // Lý do: Sáp nhập, đổi tên, quy hoạch
}

/**
 * DATABASE MAPPING (Tạm thời để ở FE, sau này nên move vào Database Backend)
 * Key format: `[province-slug]__[district-slug]__[ward-slug]`
 * Data này dựa trên Đề án sắp xếp đơn vị hành chính thực tế (Ví dụ minh họa)
 */
const MAPPING_DB: Record<string, AdminUnitChange> = {
  // === VÍ DỤ: QUẬN 4, TP.HCM (Giả định sáp nhập P12 vào P13) ===
  "thanh-pho-ho-chi-minh__quan-4__phuong-12": {
    oldName: "Phường 12",
    newName: "Phường 13",
    district: "Quận 4",
    province: "Thành phố Hồ Chí Minh",
    effectiveDate: "01/07/2025",
    reason: "Sáp nhập vào Phường 13",
  },

  // === VÍ DỤ: QUẬN HOÀN KIẾM, HÀ NỘI (Đang có đề án sáp nhập các phường nhỏ) ===
  "thanh-pho-ha-noi__quan-hoan-kiem__phuong-hang-dao": {
    oldName: "Phường Hàng Đào",
    newName: "Phường Hàng Buồm", // (Giả định theo đề án)
    district: "Quận Hoàn Kiếm",
    province: "Thành phố Hà Nội",
    effectiveDate: "01/07/2025",
    reason: "Sáp nhập địa giới hành chính",
  },

  // === VÍ DỤ: INPUT LỆCH CHUẨN (User gõ tắt) ===
  // User gõ "P.12" thay vì "Phường 12" -> Vẫn bắt được nhờ normalizeKey
};

/**
 * MAIN FUNCTION: Kiểm tra và Mapping
 */
export const getNewAdminUnit2025 = (
  ward?: string,
  district?: string,
  province?: string
) => {
  if (!ward || !district || !province) return null;

  // 1. Tạo Key chuẩn hóa từ input của User
  // VD: User nhập "HCM", "Q4", "P12" -> "thanh-pho-ho-chi-minh__quan-4__phuong-12"
  // Lưu ý: Logic mapping tỉnh thành phố viết tắt cần kỹ hơn nếu muốn cover hết (ở đây demo cơ bản)

  let provinceSlug = normalizeKey(province);
  // Fix nhanh alias phổ biến
  if (provinceSlug === "hcm" || provinceSlug === "ho-chi-minh")
    provinceSlug = "thanh-pho-ho-chi-minh";
  if (provinceSlug === "hn" || provinceSlug === "ha-noi")
    provinceSlug = "thanh-pho-ha-noi";

  const key = `${provinceSlug}__${normalizeKey(district)}__${normalizeKey(
    ward
  )}`;

  // 2. Tra cứu O(1)
  const change = MAPPING_DB[key];

  if (change) {
    return {
      isChanged: true,
      oldWard: change.oldName,
      newWard: change.newName,
      fullNewString: `${change.newName}, ${change.district}, ${change.province}`,
      note: `${change.reason} (Từ ${change.effectiveDate})`,
    };
  }

  // Không nằm trong danh sách thay đổi
  return {
    isChanged: false,
    fullNewString: null, // Null để UI biết là dùng cái cũ
  };
};
