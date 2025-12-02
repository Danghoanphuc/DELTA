// src/modules/customer/customer.routes.js
import { Router } from "express";
import { CustomerController } from "./customer.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const controller = new CustomerController();

// Tất cả các route này đều yêu cầu đăng nhập
router.use(protect);

/**
 * @route   PUT /api/customer/profile
 * @desc    Cập nhật hồ sơ User (tên, SĐT, avatar)
 * @access  Private (Customer)
 */
router.put("/profile", controller.updateMyProfile);

/**
 * @route   PUT /api/customer/brand-kit
 * @desc    Cập nhật Brand Kit (lưu vào CustomerProfile)
 * @access  Private (Customer)
 */
router.put("/brand-kit", controller.updateMyBrandKit);

/**
 * @route   PUT /api/customer/security/change-password
 * @desc    Đổi mật khẩu
 * @access  Private (Customer)
 */
router.put("/security/change-password", controller.changeMyPassword);

// (Trong tương lai thêm API cho Sổ địa chỉ tại đây)
// router.get("/addresses", controller.getMyAddresses);
// router.post("/addresses", controller.addAddress);
// router.put("/addresses/:id", controller.updateAddress);

export default router;
