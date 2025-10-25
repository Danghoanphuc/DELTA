// backend/src/controllers/printerController.js

import { User } from "../models/User.js";

export const updatePrinterProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== "printer") {
      return res.status(403).json({
        message: "Cấm truy cập: Chỉ nhà in mới có thể cập nhật hồ sơ.",
      });
    }

    // 2. Lấy thêm dữ liệu mới
    const {
      displayName,
      phone,
      address,
      specialties,
      priceTier, // <-- Thêm
      productionSpeed, // <-- Thêm
    } = req.body;

    // 3. Xây dựng đối tượng cập nhật
    const fieldsToUpdate = {};
    if (displayName) fieldsToUpdate.displayName = displayName;
    if (phone) fieldsToUpdate.phone = phone;
    if (address) fieldsToUpdate.address = address;
    if (specialties) fieldsToUpdate.specialties = specialties;
    if (priceTier) fieldsToUpdate.priceTier = priceTier; // <-- Thêm
    if (productionSpeed) fieldsToUpdate.productionSpeed = productionSpeed; // <-- Thêm

    console.log(
      `--- Nhà in ${userId} đang cập nhật hồ sơ với:`,
      fieldsToUpdate
    );

    // 4. Tìm và cập nhật user
    const updatedPrinter = await User.findByIdAndUpdate(
      userId,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select("-hashedPassword");

    if (!updatedPrinter) {
      return res.status(404).json({ message: "Không tìm thấy nhà in." });
    }

    res.status(200).json({
      message: "Cập nhật hồ sơ nhà in thành công!",
      printer: updatedPrinter,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ nhà in:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
