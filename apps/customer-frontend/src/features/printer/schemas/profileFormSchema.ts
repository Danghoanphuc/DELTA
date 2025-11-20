// src/features/printer/schemas/profileFormSchema.ts
// Zod validation schema cho PrinterProfileForm

import { z } from "zod";

export const profileFormSchema = z.object({
  businessName: z
    .string()
    .min(3, "Tên xưởng phải có ít nhất 3 ký tự")
    .max(100, "Tên xưởng không được quá 100 ký tự"),
  
  contactPhone: z
    .string()
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0)"),
  
  contactEmail: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  
  website: z
    .string()
    .url("Website không hợp lệ")
    .optional()
    .or(z.literal("")),
  
  description: z
    .string()
    .max(500, "Mô tả không được quá 500 ký tự")
    .optional(),
  
  shopAddress: z.object({
    street: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
    ward: z.string().optional(),
    district: z.string().min(2, "Quận/Huyện là bắt buộc"),
    city: z.string().min(2, "Tỉnh/Thành phố là bắt buộc"),
  }),
  
  specialties: z
    .array(z.string())
    .min(1, "Chọn ít nhất 1 chuyên môn"),
  
  priceTier: z.enum(["cheap", "standard", "premium"]).refine(
    (val) => ["cheap", "standard", "premium"].includes(val),
    { message: "Chọn phân khúc giá" }
  ),
  
  productionSpeed: z.enum(["fast", "standard"]).refine(
    (val) => ["fast", "standard"].includes(val),
    { message: "Chọn tốc độ sản xuất" }
  ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Constants cho form options
export const SPECIALTY_OPTIONS = [
  "Danh thiếp",
  "Tờ rơi",
  "Banner",
  "Brochure",
  "Bao bì",
  "Sticker",
  "Áo thun",
  "Cốc/Ly",
  "Backdrop",
  "Standee",
  "Khác",
];

export const VIETNAM_CITIES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa",
  "Lâm Đồng",
  "Thừa Thiên Huế",
  "Bà Rịa - Vũng Tàu",
  "An Giang",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

