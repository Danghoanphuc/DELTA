// backend/src/types/user.d.ts

// Import kiểu ObjectId nếu dùng Mongoose
import mongoose from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId | string; // Hoặc chỉ 'string' nếu bạn không dùng Mongoose ID
  // Thêm các trường khác mà Passport trả về nếu bạn cần dùng
  email?: string;
  displayName?: string;
  // ...
}
