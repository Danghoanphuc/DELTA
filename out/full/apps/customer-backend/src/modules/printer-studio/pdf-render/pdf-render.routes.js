// backend/src/modules/printer-studio/pdf-render/pdf-render.routes.js
// ✅ BÀN GIAO: Sửa lỗi Event-Loop Blocking bằng cách dùng Bull Queue

import express from "express";
import { protect } from "../../../shared/middleware/auth.middleware.js";
// ❌ Worker không còn được gọi trực tiếp ở đây
// import { pdfRenderer } from "../../../infrastructure/workers/pdf-renderer.worker.js";

// ✅ LAZY IMPORT: Queue sẽ được import khi cần dùng (tránh block khi import module)
// import { pdfQueue } from "../../../config/queue.config.js";
import {
  ValidationException,
  NotFoundException, // ✅ Import NotFoundException
} from "../../../shared/exceptions/index.js";
import { Logger } from "../../../shared/utils/index.js";

const router = express.Router();

/**
 * POST /api/pdf-render/queue
 * Queue một job render PDF print-ready (KHÔNG CHẶN LUỒNG)
 * Body: { baseProductId, editorData, dielineSvgUrl, specifications }
 */
router.post("/queue", protect, async (req, res, next) => {
  try {
    const { baseProductId, editorData, dielineSvgUrl, specifications } =
      req.body;

    // Validation
    if (!baseProductId || !editorData) {
      throw new ValidationException("Thiếu baseProductId hoặc editorData");
    }

    // ✅ BƯỚC 2: Chuẩn bị data cho job
    const jobData = {
      baseProductId,
      editorData,
      dielineSvgUrl,
      specifications,
      userId: req.user._id, // (Thêm userId để có thể thông báo sau)
    };

    // ✅ BƯỚC 3: Đẩy job vào Bull Queue (Redis)
    // ✅ LAZY IMPORT: Import queue chỉ khi cần dùng (tránh block khi import module)
    const { getPdfQueue } = await import("../../../config/queue.config.js");
    const pdfQueue = await getPdfQueue();
    // Đây là một lệnh I/O (gọi Redis), nó Bất đồng bộ nhưng RẤT NHANH.
    // Server sẽ không bị block.
    const job = await pdfQueue.add(jobData);

    Logger.info(
      `[PDF Queue] Đã xếp hàng Job ${job.id} cho User ${req.user._id}`
    );

    // ✅ BƯỚC 4: Trả về 202 (Accepted) ngay lập tức
    // Báo cho client biết "Tôi đã nhận, tôi sẽ làm sau"
    res.status(202).json({
      success: true,
      message: "Yêu cầu render PDF đã được xếp hàng.",
      data: {
        jobId: job.id, // Trả về Job ID thật
        status: "queued",
      },
    });

    // ❌ BƯỚC 5: Xóa bỏ hoàn toàn hàm processJobAsync()
    // Worker process trong 'src/config/queue.config.js' sẽ tự động
    // nhận job này từ Redis và xử lý nó trên một process riêng.
  } catch (error) {
    Logger.error("❌ [PDF Queue] Lỗi khi xếp hàng job:", error);
    next(error); // Chuyển cho global error handler
  }
});

/**
 * GET /api/pdf-render/status/:jobId
 * (Giữ nguyên - Cần phát triển thêm logic để query Bull/Redis)
 */
router.get("/status/:jobId", protect, async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // ✅ LAZY IMPORT: Import queue chỉ khi cần dùng
    const { getPdfQueue } = await import("../../../config/queue.config.js");
    const pdfQueue = await getPdfQueue();
    // (Logic thật: await pdfQueue.getJob(jobId))
    const job = await pdfQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException("Không tìm thấy job", jobId);
    }

    const statusMap = {
      waiting: "queued",
      active: "processing",
      completed: "completed",
      failed: "failed",
      delayed: "delayed",
    };

    // ✅ BullMQ: getState() trả về Promise, returnvalue và failedReason là properties
    const jobState = await job.getState();
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: statusMap[jobState] || jobState, // Fallback nếu không có trong map
        progress: job.progress || 0,
        result: job.returnvalue || null, // Kết quả khi hoàn thành
        error: job.failedReason || null, // Lỗi nếu có
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pdf-render/download/:jobId
 * Tải file PDF đã render xong
 */
router.get("/download/:jobId", protect, async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Mock: Lấy file path từ job result
    // const job = await jobQueue.getJob(jobId);
    // const filePath = job.result.path;

    const filePath = `/tmp/print-${jobId}.pdf`; // (Đây là ví dụ, cần logic thật)

    // Stream file về client
    res.download(filePath, `design-${jobId}.pdf`, (err) => {
      if (err) {
        Logger.error("❌ [PDF Download] Error:", err.message);
        // Dùng next(err) thay vì res.status()
        next(
          new NotFoundException("File PDF không tồn tại hoặc chưa sẵn sàng")
        );
      }
    });
  } catch (error) {
    Logger.error("❌ [PDF Download] Error:", error);
    next(error);
  }
});

// ==================== BACKGROUND PROCESSOR ====================
/**
 * Xử lý job trong background (async)
 * (ĐÃ DI CHUYỂN QUA 'src/config/queue.config.js')
 */
// async function processJobAsync(jobData) { ... } // (ĐÃ BỊ XÓA)

export default router;
