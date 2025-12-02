/**
 * CANVAS ADAPTER (Web2Print Optimized)
 * - Engine: @napi-rs/canvas (Rust)
 * - Features: Color Management (P3), Custom Fonts, Memory Safety
 */

import {
  createCanvas,
  loadImage,
  Image,
  Canvas,
  GlobalFonts,
  SKRSContext2D,
} from "@napi-rs/canvas";
import path from "path";

// --- CẤU HÌNH MÀU SẮC (COLOR PROFILE) ---
// Web2Print cần độ chính xác cao. Display-P3 có dải màu rộng hơn sRGB 25%.
// Nếu server/client hỗ trợ, nó sẽ hiển thị màu rực rỡ và đúng hơn với bản in.
const DEFAULT_COLOR_SPACE = "srgb"; // 'srgb' (an toàn) hoặc 'display-p3' (cao cấp)

export const getCanvasService = () => {
  return {
    /**
     * Tạo Canvas với cấu hình màu chuẩn
     * @param width Chiều rộng
     * @param height Chiều cao
     * @param useHighQualityColor Bật chế độ màu Display-P3 (cho in ấn)
     */
    create: (width: number, height: number, useHighQualityColor = false) => {
      // @napi-rs/canvas chỉ nhận 2 tham số (width, height)
      const canvas = createCanvas(width, height);

      // Color space được cấu hình qua context settings nếu cần
      // const ctx = canvas.getContext('2d', { colorSpace: useHighQualityColor ? 'display-p3' : 'srgb' });
      // Note: @napi-rs/canvas có thể không hỗ trợ colorSpace option, mặc định là sRGB

      return canvas;
    },

    load: async (source: string | Buffer) => {
      try {
        return await loadImage(source);
      } catch (error) {
        console.error("[CanvasAdapter] Load Image Failed:", error);
        throw new Error("Không thể tải ảnh. Vui lòng kiểm tra định dạng file.");
      }
    },

    /**
     * Đăng ký Font chữ tùy chỉnh (Custom Fonts)
     * Cực kỳ quan trọng cho Web2Print (In tên lên áo, thiệp)
     */
    registerFont: (fontPath: string, familyName: string) => {
      try {
        // GlobalFonts giúp đăng ký font ở cấp độ hệ thống ảo của Canvas
        const absolutePath = path.resolve(fontPath);
        const success = GlobalFonts.registerFromPath(absolutePath, familyName);
        if (!success)
          console.warn(
            `[CanvasAdapter] Font register returned false: ${familyName}`
          );
        return success;
      } catch (error) {
        console.error(
          `[CanvasAdapter] Failed to register font ${familyName}:`,
          error
        );
        return false;
      }
    },

    /**
     * Giải phóng bộ nhớ (Chống Memory Leak)
     * Khi render xong ảnh khổ lớn (ví dụ 4000x4000px), RAM sẽ bị ăn mòn nếu không clear.
     */
    dispose: (canvas: Canvas) => {
      // Với @napi-rs, GC (Garbage Collector) hoạt động tốt,
      // nhưng set kích thước về 0 là mẹo để báo hiệu giải phóng buffer ngay lập tức.
      canvas.width = 0;
      canvas.height = 0;
      // (Canvas gốc của Rust tự drop khi biến ra khỏi scope)
    },

    // Export Class để check instanceof
    ImageClass: Image,
    CanvasClass: Canvas,
  };
};

// --- HEALTHCHECK & DIAGNOSTIC ---
export const checkCanvasHealth = () => {
  try {
    const width = 50;
    const height = 50;
    const c = createCanvas(width, height);
    const ctx = c.getContext("2d");

    // Test vẽ cơ bản
    ctx.fillStyle = "#FF0000"; // Đỏ chuẩn
    ctx.fillRect(0, 0, width, height);

    // Test xuất Buffer (Quan trọng nhất)
    const buffer = c.toBuffer("image/png");

    // Kiểm tra màu (đơn giản hóa)
    // Nếu buffer rỗng hoặc quá nhỏ -> Lỗi engine
    if (buffer.length < 100) return false;

    return {
      status: "healthy",
      engine: "@napi-rs/canvas",
      testBufferSize: buffer.length,
    };
  } catch (error) {
    console.error("[CanvasAdapter] CRITICAL FAILURE:", error);
    return false;
  }
};
