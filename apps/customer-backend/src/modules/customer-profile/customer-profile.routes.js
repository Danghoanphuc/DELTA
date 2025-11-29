// src/modules/customer-profile/customer-profile.routes.js
import express from "express";
import { CustomerProfileController } from "./customer-profile.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();
const controller = new CustomerProfileController();

// Tất cả routes đều cần authentication
router.use(protect);

// Địa chỉ
router.get("/addresses", controller.getSavedAddresses);
router.get("/addresses/default", controller.getDefaultAddress);
router.post("/addresses", controller.addAddress);
router.put("/addresses/:addressId", controller.updateAddress);
router.delete("/addresses/:addressId", controller.deleteAddress);
router.post("/addresses/:addressId/set-default", controller.setDefaultAddress);

export default router;
