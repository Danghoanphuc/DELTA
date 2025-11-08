import mongoose from "mongoose";

const CustomerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Lưu các địa chỉ đã dùng
    savedAddresses: [
      {
        recipientName: String,
        phone: String,
        street: String,
        ward: String,
        district: String,
        city: String,
      },
    ],
    // (Trong tương lai có thể thêm: phương thức thanh toán đã lưu, v.v.)
  },
  { timestamps: true }
);

CustomerProfileSchema.index({ userId: 1 });

export const CustomerProfile = mongoose.model(
  "CustomerProfile",
  CustomerProfileSchema
);
