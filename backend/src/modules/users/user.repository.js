// src/modules/users/user.repository.js
import { User } from "../../models/User.js";

export class UserRepository {
  async findById(userId) {
    // Tự động loại bỏ password
    return await User.findById(userId).select("-hashedPassword");
  }
}
