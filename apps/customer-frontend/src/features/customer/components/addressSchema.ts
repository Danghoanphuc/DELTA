// apps/customer-frontend/src/features/customer/components/addressSchema.ts
import * as z from 'zod';

/**
 * Schema cho địa chỉ Việt Nam (Vietnam-First)
 * - Loại bỏ postalCode (không phổ biến tại VN)
 * - Sử dụng city, district, ward (cascading select)
 * - street: Địa chỉ cụ thể (số nhà, tên đường)
 */
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
  street: z.string().min(5, 'Địa chỉ cụ thể phải có ít nhất 5 ký tự'),
  city: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  country: z.string().default('Việt Nam'),
});
