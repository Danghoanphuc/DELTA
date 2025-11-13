// src/modules/users/user.service.js
import { UserRepository } from "./user.repository.js";
import { NotFoundException } from "../../shared/exceptions/index.js";

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Lấy thông tin người dùng "me" bằng ID
   * @param {string} userId - ID của người dùng (từ token)
   * @returns {Promise<Object>} Thông tin người dùng
   */
  async getMe(userId) {
    // Gọi đến repository để tìm user bằng ID
    const user = await this.userRepository.findById(userId); //

    if (!user) {
      // Nếu không tìm thấy, ném ra lỗi 404
      throw new NotFoundException("Người dùng", userId);
    }

    // Trả về user (repository đã tự động loại bỏ password)
    return user;
  }
}
