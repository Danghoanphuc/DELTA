// src/shared/models/customized-design.model.js (ĐÃ CẬP NHẬT)
import mongoose from "mongoose";

const customizedDesignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    baseTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DesignTemplate",
    },

    // === 1. DỮ LIỆU NGUỒN (Bạn đã có) ===
    editorData: {
      type: Object,
      required: true,
    },

    // === 2. DỮ LIỆU SẢN XUẤT (Cần thêm) ===
    // File PDF/SVG 300dpi mà backend tạo ra (Giai đoạn 4)
    productionFile: {
      url: { type: String }, // Link đến S3/Cloudinary
      type: { type: String, enum: ["PDF", "SVG"] },
      size_mm: { width: Number, height: Number },
      bleed_mm: { type: Number, default: 0 },
    },

    // === 3. DỮ LIỆU TRƯNG BÀY (Cần mở rộng) ===
    preview: {
      // Ảnh PNG 2D (Bạn đã có, chỉ đổi tên)
      thumbnailUrl: { type: String }, //

      // Link nhúng 3D (Cần thêm)
      // Link embed từ Sketchfab/Pacdora (Giai đoạn 1)
      embed3DUrl: { type: String },
    },
  },
  { timestamps: true }
);

// Đổi tên 'finalPreviewImageUrl' (cũ) thành 'preview.thumbnailUrl' (mới)
// (Bạn có thể chạy một script migration nhỏ trong DB)
customizedDesignSchema.pre("save", function (next) {
  if (this.finalPreviewImageUrl && !this.preview?.thumbnailUrl) {
    if (!this.preview) this.preview = {};
    this.preview.thumbnailUrl = this.finalPreviewImageUrl;
    this.finalPreviewImageUrl = undefined; // Xóa trường cũ
  }
  next();
});

export const CustomizedDesign = mongoose.model(
  "CustomizedDesign",
  customizedDesignSchema
);
