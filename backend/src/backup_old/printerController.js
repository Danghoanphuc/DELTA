// backend/src/controllers/printerController.js (CẬP NHẬT)

import { User } from "../models/User.js";
import { PrinterProfile } from "../models/PrinterProfile.js"; // <-- THÊM IMPORT

// (HÀM CŨ ĐÃ SỬA)
export const updatePrinterProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== "printer") {
      return res.status(403).json({
        message: "Cấm truy cập: Chỉ nhà in mới có thể cập nhật hồ sơ.",
      });
    }

    // 2. Lấy dữ liệu (Giờ có thể lấy nhiều hơn từ PrinterProfile)
    const {
      displayName, // Cập nhật cả User.displayName
      phone, // Cập nhật cả User.phone
      // --- Các trường của PrinterProfile ---
      businessName,
      contactPhone,
      shopAddress,
      specialties,
      priceTier,
      productionSpeed,
      description,
      // (Thêm các trường khác...
    } = req.body;

    // 3. Cập nhật User (Chỉ displayName và phone)
    const userFieldsToUpdate = {};
    if (displayName) userFieldsToUpdate.displayName = displayName;
    if (phone) userFieldsToUpdate.phone = phone;

    if (Object.keys(userFieldsToUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userFieldsToUpdate });
    }

    // 4. Cập nhật PrinterProfile (Các trường còn lại)
    const profileFieldsToUpdate = {};
    if (businessName) profileFieldsToUpdate.businessName = businessName;
    if (contactPhone) profileFieldsToUpdate.contactPhone = contactPhone;
    if (shopAddress) profileFieldsToUpdate.shopAddress = shopAddress;
    if (specialties) profileFieldsToUpdate.specialties = specialties;
    if (priceTier) profileFieldsToUpdate.priceTier = priceTier;
    if (productionSpeed)
      profileFieldsToUpdate.productionSpeed = productionSpeed;
    if (description) profileFieldsToUpdate.description = description;

    console.log(
      `--- Nhà in ${userId} đang cập nhật PrinterProfile với:`,
      profileFieldsToUpdate
    );

    // 5. Tìm và cập nhật Profile
    const updatedProfile = await PrinterProfile.findOneAndUpdate(
      { userId: userId },
      { $set: profileFieldsToUpdate },
      { new: true, runValidators: true, upsert: true } // upsert: true để tạo nếu chưa có
    );

    // 6. Lấy User đã cập nhật (để trả về displayName mới nhất)
    const updatedUser = await User.findById(userId).select("-hashedPassword");

    res.status(200).json({
      message: "Cập nhật hồ sơ nhà in thành công!",
      user: updatedUser, // Trả về user (để store auth cập nhật)
      profile: updatedProfile, // Trả về profile (để store profile cập nhật)
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ nhà in:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// --- (HÀM MỚI) ---
// @desc    Lấy hồ sơ nhà in của tôi
// @route   GET /api/printer/my-profile
// @access  Private (Chỉ Printer)
export const getMyPrinterProfile = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ message: "Cấm truy cập." });
    }

    const profile = await PrinterProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ nhà in." });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error("Lỗi khi lấy hồ sơ nhà in:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
