// apps/customer-backend/src/shared/models/product.model.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // === SỬA ĐỔI QUAN TRỌNG ===
    printerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrinterProfile", // Tham chiếu đến PrinterProfile
      required: true,
      index: true,
    },
    // =========================

    taxonomyId: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },

    // (Giữ nguyên) Basic information
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "business-card",
        "flyer",
        "banner",
        "brochure",
        "t-shirt",
        "mug",
        "sticker",
        "packaging",
        "other",
      ],
      required: true,
    },

    // (Giữ nguyên) Assets (W2P)
    assets: {
      modelUrl: { type: String },
      dielineUrl: { type: String },
      surfaces: [
        {
          materialName: { type: String, required: true },
          surfaceKey: { type: String, required: true },
          name: { type: String, required: true },
        },
      ],
    },

    // ✅ THÊM: Hình ảnh sản phẩm
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // (Giữ nguyên) Pricing
    pricing: [
      {
        minQuantity: { type: Number, required: true },
        maxQuantity: Number,
        pricePerUnit: { type: Number, required: true },
      },
    ],
    basePrice: { type: Number, required: true, default: 0 },

    // (Giữ nguyên) Specifications
    specifications: {
      material: String,
      size: String,
      color: String,
      finishing: String,
    },

    // (Giữ nguyên) Production time
    productionTime: {
      min: Number,
      max: Number,
    },

    // (Giữ nguyên) Customization options
    customization: {
      allowFileUpload: { type: Boolean, default: true },
      acceptedFileTypes: [String],
      hasDesignService: { type: Boolean, default: false },
      designServiceFee: Number,
    },

    // (Giữ nguyên) Status
    isActive: { type: Boolean, default: true }, // Nhà in quản lý
    stock: { type: Number, default: 0 },

    // (Giữ nguyên) Metadata
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // === NÂNG CẤP: TRỤ CỘT SỨC KHỎE SẢN PHẨM (ADMIN QUẢN LÝ) ===
    isPublished: {
      type: Boolean,
      default: true, // Admin quản lý
    },
    healthStatus: {
      type: String,
      enum: ["Active", "Warning", "Suspended"],
      default: "Active",
      index: true,
    },
    stats: {
      refundRate: { type: Number, default: 0 },
      cancellationRate: { type: Number, default: 0 },
      lastSuspensionAt: Date,
    },
    // ==========================================================

    // === RAG: VECTOR EMBEDDING FOR SEMANTIC SEARCH ===
    embedding: {
      type: [Number], // Array of floats (1536 dimensions for text-embedding-3-small)
      select: false, // Do not return by default in queries (privacy & performance)
      index: false, // Mongoose index not needed - Atlas Vector Search handles indexing
    },
    // ================================================

    // === ✨ SMART PIPELINE: DRAFT SYSTEM ===
    isDraft: {
      type: Boolean,
      default: true, // ✅ Mặc định là draft khi tạo mới
      index: true,
    },
    draftStep: {
      type: Number,
      default: 1, // Bước nào user đang ở (1-5)
      min: 1,
      max: 5,
    },
    draftLastSavedAt: {
      type: Date,
      default: Date.now,
    },

    // === ✨ SMART PIPELINE: ASYNC UPLOAD TRACKING ===
    uploadStatus: {
      type: String,
      enum: ["pending", "uploading", "completed", "failed"],
      default: "pending",
    },
    uploadProgress: {
      type: Number, // 0-100
      default: 0,
      min: 0,
      max: 100,
    },

    // === ✨ SMART PIPELINE: AI GENERATION METADATA ===
    aiGenerated: {
      description: { type: Boolean, default: false },
      tags: { type: Boolean, default: false },
      generatedAt: Date,
    },

    // === ✨ SMART PIPELINE: VALIDATION STATE (cho Draft) ===
    validationErrors: {
      type: Map,
      of: String, // { "name": "Tên quá ngắn", "pricing": "Giá không hợp lệ" }
    },
    // ================================================

    // === 🎨 POD CATALOG OPTIMIZATION: PRINT METHODS ===
    printMethods: [
      {
        method: {
          type: String,
          enum: [
            "screen_print",
            "dtg",
            "embroidery",
            "heat_transfer",
            "sublimation",
            "vinyl",
            "laser_engraving",
          ],
          required: true,
        },
        areas: [
          {
            name: { type: String, required: true }, // "front", "back", "left_chest", "sleeve"
            maxWidth: { type: Number, required: true }, // mm
            maxHeight: { type: Number, required: true }, // mm
            position: {
              x: { type: Number, default: 0 },
              y: { type: Number, default: 0 },
            },
            allowedColors: { type: Number, default: 1 }, // max colors for this area
            setupFee: { type: Number, default: 0 }, // one-time setup cost
            unitCost: { type: Number, default: 0 }, // cost per unit
          },
        ],
        artworkRequirements: {
          minResolution: { type: Number, default: 300 }, // DPI
          acceptedFormats: {
            type: [String],
            default: ["AI", "EPS", "PDF", "PNG"],
          },
          colorMode: {
            type: String,
            enum: ["CMYK", "RGB", "Pantone"],
            default: "CMYK",
          },
          maxFileSize: { type: Number, default: 50 }, // MB
        },
        leadTime: {
          min: { type: Number, required: true }, // days
          max: { type: Number, required: true }, // days
          unit: { type: String, default: "days" },
        },
      },
    ],

    // === 🎨 POD CATALOG OPTIMIZATION: MOQ BY PRINT METHOD ===
    moqByPrintMethod: [
      {
        printMethod: {
          type: String,
          enum: [
            "screen_print",
            "dtg",
            "embroidery",
            "heat_transfer",
            "sublimation",
            "vinyl",
            "laser_engraving",
          ],
          required: true,
        },
        moq: { type: Number, required: true, default: 1 },
      },
    ],

    // === 🎨 POD CATALOG OPTIMIZATION: PRODUCTION COMPLEXITY ===
    productionComplexity: {
      score: { type: Number, min: 1, max: 10, default: 5 }, // 1=simple, 10=complex
      factors: [{ type: String }], // ["multiple_colors", "embroidery", "special_material"]
    },
    // ================================================
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Text search index
ProductSchema.index({ name: "text", description: "text", category: "text" });

// ✅ Draft queries optimization
ProductSchema.index({ printerProfileId: 1, isDraft: 1, draftLastSavedAt: -1 });

export const Product = mongoose.model("Product", ProductSchema);
