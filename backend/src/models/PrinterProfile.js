// backend/src/models/PrinterProfile.js (MỚI)
const PrinterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // --- Thông tin doanh nghiệp ---
    businessName: { type: String, required: true },
    businessLicense: String, // Số ĐKKD
    taxCode: String,

    // --- Địa chỉ cửa hàng ---
    shopAddress: {
      street: { type: String, required: true },
      ward: String,
      district: { type: String, required: true },
      city: { type: String, required: true },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true },
      },
    },

    // --- Thông tin liên hệ ---
    contactPhone: { type: String, required: true },
    contactEmail: String,
    website: String,

    // --- Mô tả ---
    description: { type: String, maxlength: 2000 },
    coverImage: String,
    logoUrl: String,

    // --- Giờ làm việc ---
    workingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },

    // --- Đánh giá ---
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // --- Trạng thái ---
    isVerified: { type: Boolean, default: false }, // Admin xác minh
    isActive: { type: Boolean, default: true },

    // --- Metadata ---
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });
