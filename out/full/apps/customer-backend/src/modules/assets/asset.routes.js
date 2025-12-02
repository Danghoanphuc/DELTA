// src/modules/assets/asset.routes.js (FILE MỚI)
import { Router } from "express";
import { AssetController } from "./asset.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";

const router = Router();
const assetController = new AssetController();

// === CÁC ROUTE CỦA NHÀ IN (PRINTER) ===
router.use(protect, isPrinter);

/**
 * @route   POST /api/assets
 * @desc    Tạo một Phôi (Asset) mới
 * @access  Private (Printer only)
 * @body    JSON data của phôi
 */
router.post("/", assetController.createAsset);

/**
 * @route   GET /api/assets/my-assets
 * @desc    Lấy danh sách Phôi của nhà in
 * @access  Private (Printer only)
 */
router.get("/my-assets", assetController.getMyAssets);

/**
 * @route   PUT /api/assets/:assetId
 * @desc    Cập nhật Phôi
 * @access  Private (Printer only)
 */
router.put("/:assetId", assetController.updateAsset);

/**
 * @route   GET /api/assets/:assetId
 * @desc    Lấy chi tiết Phôi
 * @access  Private (Printer only)
 */
router.get("/:assetId", assetController.getAssetById);

export default router;
