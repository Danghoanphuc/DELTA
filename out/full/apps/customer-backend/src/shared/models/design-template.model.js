// src/shared/models/design-template.model.js (ĐÃ CẬP NHẬT)
import mongoose from "mongoose";

const designTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    baseProductId: {
      type: String, // <-- SỬA TỪ ObjectId THÀNH String
      required: true,
      ref: "Product", // Giữ ref để có thể populate sau này
    },

    // === 1. DỮ LIỆU NGUỒN (Bạn đã có) ===
    editorData: {
      type: Object,
      required: true,
    },

    // === 2. DỮ LIỆU SẢN XUẤT (Không cần) ===
    // Template không cần file PDF, vì nó sẽ được tạo khi customer tùy chỉnh.

    // === 3. DỮ LIỆU TRƯNG BÀY (Cần mở rộng) ===
    preview: {
      // Ảnh 2D (Bạn đã có, chỉ đổi tên)
      thumbnailUrl: { type: String }, //

      // Link nhúng 3D (Cần thêm)
      embed3DUrl: { type: String },
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Đổi tên 'previewImageUrl' (cũ) thành 'preview.thumbnailUrl' (mới)
designTemplateSchema.pre("save", function (next) {
  if (this.previewImageUrl && !this.preview?.thumbnailUrl) {
    if (!this.preview) this.preview = {};
    this.preview.thumbnailUrl = this.previewImageUrl;
    this.previewImageUrl = undefined; // Xóa trường cũ
  }
  next();
});

export const DesignTemplate = mongoose.model(
  "DesignTemplate",
  designTemplateSchema
);
