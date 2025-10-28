// src/modules/users/user.controller.js
import { UserService } from "./user.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getMe = async (req, res, next) => {
    try {
      // req.user được đính kèm từ middleware 'protect'
      const user = await this.userService.getMe(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ user }));
    } catch (error) {
      next(error);
    }
  };
}
