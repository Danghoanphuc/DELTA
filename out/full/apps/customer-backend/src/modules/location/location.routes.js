// apps/customer-backend/src/modules/location/location.routes.js
import { Router } from "express";
import { LocationController } from "./location.controller.js";

const router = Router();
const controller = new LocationController();

/**
 * @route   POST /api/location/reverse-geocode
 * @desc    Reverse geocoding: Chuyển tọa độ thành địa chỉ
 * @access  Public
 * @body    { lat: number, lng: number }
 */
router.post("/reverse-geocode", controller.reverseGeocode);

export default router;
