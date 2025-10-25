import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true],
    },
    refreshToken: {
      type: String,
      required: [true],
      unique: true,
    },
    //   Lưu thời điểm refreshToken hết hạn
    expireAt: {
      type: Date,
      required: [true],
    },
  },
  {
    timestamps: true,
  }
);
// Tự động xóa khi hết hạn
sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("session", sessionSchema);
