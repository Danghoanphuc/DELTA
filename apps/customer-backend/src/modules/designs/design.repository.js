// src/modules/designs/design.repository.js
import { DesignTemplate } from "../../shared/models/design-template.model.js";
import { CustomizedDesign } from "../../shared/models/customized-design.model.js";

export class DesignRepository {
  // === Template (Printer) ===

  async createTemplate(templateData) {
    return await DesignTemplate.create(templateData);
  }

  async findTemplateById(templateId) {
    return await DesignTemplate.findById(templateId);
  }

  async findTemplatesByPrinter(printerId) {
    return await DesignTemplate.find({ printerId }).sort({ createdAt: -1 });
  }

  async findPublicTemplates() {
    return await DesignTemplate.find({ isPublic: true })
      .populate("printerId", "displayName avatarUrl")
      .sort({ createdAt: -1 });
  }

  async updateTemplate(templateId, updateData) {
    return await DesignTemplate.findByIdAndUpdate(templateId, updateData, {
      new: true,
    });
  }

  async deleteTemplate(templateId) {
    return await DesignTemplate.findByIdAndDelete(templateId);
  }

  // === Customized Design (User) ===

  async createCustomizedDesign(designData) {
    return await CustomizedDesign.create(designData);
  }

  async findCustomizedDesignById(designId) {
    return await CustomizedDesign.findById(designId);
  }
  async findCustomizedDesignsByUserId(userId) {
    // Sắp xếp để mẫu mới nhất lên đầu
    return await CustomizedDesign.find({ userId }).sort({ createdAt: -1 });
  }

  // ✅ THÊM: Tìm draft design cho user và product
  async findDraftByUserAndProduct(userId, baseProductId) {
    return await CustomizedDesign.findOne({
      userId,
      baseProductId,
      status: "draft",
    });
  }

  // ✅ THÊM: Update draft design
  async updateCustomizedDesign(designId, updateData) {
    return await CustomizedDesign.findByIdAndUpdate(designId, updateData, {
      new: true,
    });
  }
}
