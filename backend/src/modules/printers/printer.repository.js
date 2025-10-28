// src/modules/printers/printer.repository.js
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

export class PrinterRepository {
  async findProfileByUserId(userId) {
    return await PrinterProfile.findOne({ userId });
  }

  async updateUser(userId, userFields) {
    if (Object.keys(userFields).length === 0) {
      return await User.findById(userId).select("-hashedPassword");
    }
    return await User.findByIdAndUpdate(
      userId,
      { $set: userFields },
      { new: true }
    ).select("-hashedPassword");
  }

  async updateProfile(userId, profileFields) {
    return await PrinterProfile.findOneAndUpdate(
      { userId: userId },
      { $set: profileFields },
      { new: true, runValidators: true, upsert: true }
    );
  }
}
