// src/modules/users/user.repository.js
import { User } from "../../shared/models/user.model.js";

export class UserRepository {
  async findById(userId) {
    // Tự động loại bỏ password
    return await User.findById(userId).select("-hashedPassword");
  }
}
