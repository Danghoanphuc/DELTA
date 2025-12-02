// src/modules/media-assets/media-asset.routes.js
import { Router } from "express";
import { MediaAssetController } from "./media-asset.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const controller = new MediaAssetController();

// Tất cả các route này đều yêu cầu đăng nhập
// Middleware 'protect' sẽ chạy trước
router.use(protect);

/**
 * @route   GET /api/media-assets/my-assets
 * @desc    Lấy thư viện media của user
 * @access  Private
 */
router.get("/my-assets", controller.handleGetMyAssets);

/**
 * @route   POST /api/media-assets/
 * @desc    Lưu file đã upload vào CSDL
 * @access  Private
 */
router.post("/", controller.handleCreateMediaAsset);

/**
 * @route   DELETE /api/media-assets/:id
 * @desc    Xóa file (trên cloud và CSDL)
 * @access  Private
 */
router.delete("/:id", controller.handleDeleteMediaAsset);

export default router;
