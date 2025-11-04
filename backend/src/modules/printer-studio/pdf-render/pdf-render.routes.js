// backend/src/api/routes/pdf-render.routes.js
// ✅ NHIỆM VỤ 1: API ENDPOINT CHO PDF RENDERING (ASYNC)

import express from "express";
import {
  protect,
  isPrinter,
} from "../../../shared/middleware/auth.middleware.js";
import { pdfRenderer } from "../../../infrastructure/workers/pdf-renderer.worker.js";

const router = express.Router();

/**
 * POST /api/pdf-render/queue
 * Queue một job render PDF print-ready
 * Body: { baseProductId, editorData, dielineSvgUrl, specifications }
 */
router.post("/queue", protect, async (req, res) => {
  try {
    const { baseProductId, editorData, dielineSvgUrl, specifications } =
      req.body;

    // Validation
    if (!baseProductId || !editorData) {
      return res.status(400).json({
        success: false,
        message: "Thiếu baseProductId hoặc editorData",
      });
    }

    // ✅ QUAN TRỌNG: Đẩy vào queue (không render ngay)
    // Trong production thực tế, dùng Bull Queue, RabbitMQ, hoặc AWS SQS
    // Ở đây tôi sẽ mock một job ID

    const jobId = `pdf_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // Mock: Lưu job info vào "queue" (trong thực tế là database hoặc Redis)
    // jobQueue.add({ jobId, baseProductId, editorData, dielineSvgUrl, specifications });

    console.log(`✅ [PDF Queue] Job queued: ${jobId}`);

    // ✅ Trả về ngay lập tức (không chờ render xong)
    res.status(202).json({
      success: true,
      message: "PDF render job đã được xếp hàng",
      data: {
        jobId,
        status: "queued",
        estimatedTime: "3-5 phút",
      },
    });

    // ✅ Xử lý async trong background (không await)
    processJobAsync({
      jobId,
      baseProductId,
      editorData,
      dielineSvgUrl,
      specifications,
    });
  } catch (error) {
    console.error("❌ [PDF Queue] Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xếp hàng PDF job",
      error: error.message,
    });
  }
});

/**
 * GET /api/pdf-render/status/:jobId
 * Kiểm tra trạng thái job
 */
router.get("/status/:jobId", protect, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Mock: Query từ database hoặc Redis
    // const job = await jobQueue.getJob(jobId);

    // Giả lập response
    res.json({
      success: true,
      data: {
        jobId,
        status: "processing", // queued | processing | completed | failed
        progress: 45,
        result: null, // URL của file PDF khi hoàn thành
      },
    });
  } catch (error) {
    console.error("❌ [PDF Status] Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra trạng thái job",
    });
  }
});

/**
 * GET /api/pdf-render/download/:jobId
 * Tải file PDF đã render xong
 */
router.get("/download/:jobId", protect, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Mock: Lấy file path từ job result
    // const job = await jobQueue.getJob(jobId);
    // const filePath = job.result.path;

    const filePath = `/tmp/print-${jobId}.pdf`;

    // Stream file về client
    res.download(filePath, `design-${jobId}.pdf`, (err) => {
      if (err) {
        console.error("❌ [PDF Download] Error:", err);
        res.status(404).json({
          success: false,
          message: "File PDF không tồn tại",
        });
      }
    });
  } catch (error) {
    console.error("❌ [PDF Download] Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải file PDF",
    });
  }
});

// ==================== BACKGROUND PROCESSOR ====================
/**
 * Xử lý job trong background (async)
 * Trong production, đây sẽ là một worker process riêng biệt
 */
async function processJobAsync(jobData) {
  const { jobId, baseProductId, editorData, dielineSvgUrl, specifications } =
    jobData;

  try {
    console.log(`⏳ [PDF Worker] Processing job: ${jobId}`);

    // ✅ Gọi worker để render PDF
    const result = await pdfRenderer.renderPDF({
      baseProductId,
      editorData,
      dielineSvgUrl,
      specifications,
    });

    console.log(`✅ [PDF Worker] Job completed: ${jobId}`);

    // Cập nhật trạng thái job trong database
    // await jobQueue.updateJob(jobId, { status: 'completed', result });

    // Có thể gửi email/notification cho user
    // await notificationService.send(userId, 'PDF của bạn đã sẵn sàng!');
  } catch (error) {
    console.error(`❌ [PDF Worker] Job failed: ${jobId}`, error);

    // Cập nhật trạng thái thất bại
    // await jobQueue.updateJob(jobId, { status: 'failed', error: error.message });
  }
}

export default router;
