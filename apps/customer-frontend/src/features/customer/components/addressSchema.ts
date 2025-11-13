import * as z from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
  street: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  city: z.string().min(2, 'Tên thành phố phải có ít nhất 2 ký tự'),
  state: z.string().min(2, 'Tên quận/huyện phải có ít nhất 2 ký tự'),
  postalCode: z.string().min(5, 'Mã bưu điện phải có ít nhất 5 ký tự'),
  country: z.string().min(2, 'Tên quốc gia phải có ít nhất 2 ký tự'),
});
