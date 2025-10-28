// src/modules/printers/printer.service.js
import { PrinterRepository } from "./printer.repository.js";
import { NotFoundException } from "../../shared/exceptions/index.js";

export class PrinterService {
  constructor() {
    this.printerRepository = new PrinterRepository();
  }

  async getProfile(userId) {
    const profile = await this.printerRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException("Không tìm thấy hồ sơ nhà in.");
    }
    return profile;
  }

  async updateProfile(userId, updateData) {
    const {
      displayName, // User model
      phone, // User model
      // PrinterProfile fields
      businessName,
      contactPhone,
      shopAddress,
      specialties,
      priceTier,
      productionSpeed,
      description,
    } = updateData;

    // 1. Cập nhật User
    const userFieldsToUpdate = {};
    if (displayName) userFieldsToUpdate.displayName = displayName;
    if (phone) userFieldsToUpdate.phone = phone;

    const updatedUser = await this.printerRepository.updateUser(
      userId,
      userFieldsToUpdate
    );

    // 2. Cập nhật PrinterProfile
    const profileFieldsToUpdate = {};
    if (businessName) profileFieldsToUpdate.businessName = businessName;
    if (contactPhone) profileFieldsToUpdate.contactPhone = contactPhone;
    if (shopAddress) profileFieldsToUpdate.shopAddress = shopAddress;
    if (specialties) profileFieldsToUpdate.specialties = specialties;
    if (priceTier) profileFieldsToUpdate.priceTier = priceTier;
    if (productionSpeed)
      profileFieldsToUpdate.productionSpeed = productionSpeed;
    if (description) profileFieldsToUpdate.description = description;

    const updatedProfile = await this.printerRepository.updateProfile(
      userId,
      profileFieldsToUpdate
    );

    return { user: updatedUser, profile: updatedProfile };
  }
}
