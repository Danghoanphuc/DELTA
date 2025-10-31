// src/modules/designs/design.service.js
import { DesignRepository } from "./design.repository.js";
import {
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from "../../shared/exceptions/index.js";
import { ProductRepository } from "../products/product.repository.js";
import { Logger } from "../../shared/utils/index.js";

export class DesignService {
  constructor() {
    this.designRepository = new DesignRepository();
  }

  // === Template (Printer) ===

  async createTemplate(printerId, body, file) {
    Logger.debug(`[Service.createTemplate] Bắt đầu...`);

    // 1. Parse JSON data from designData field
    let designData;
    try {
      designData = JSON.parse(body.designData);
    } catch (e) {
      throw new ValidationException("Dữ liệu designData JSON không hợp lệ.");
    }

    const { name, description, editorData, baseProductId, isPublic, tags } = designData;

    if (!name || !editorData || !baseProductId) {
      throw new ValidationException(
        "Tên (name), dữ liệu editor (editorData), và ID phôi (baseProductId) là bắt buộc."
      );
    }

    // 2. Validate file (from Multer)
    if (!file) {
      throw new ValidationException("Thiếu file ảnh xem trước (previewImage).");
    }

    // 3. Get file URL
    const previewImageUrl = file.path;

    // 4. (Optional) Validate base product exists
    // const baseProduct = await this.productRepo.findById(baseProductId);
    // if (!baseProduct) {
    //   throw new NotFoundException("Không tìm thấy Phôi (Product) nền", baseProductId);
    // }

    // 5. Create Design Template data package
    const template = await this.designRepository.createTemplate({
      name,
      description, // Add description if it exists in the model
      editorData,      
      printerId,
      baseProductId,
      isPublic: isPublic || false,
      tags: tags || [],
      preview: {
        thumbnailUrl: previewImageUrl,
        embed3DUrl: null, // To be updated later
      },
    });

    Logger.success("Template created", { templateId: template._id, printerId });
    return template;
  }

  // === Customized Design (User) ===

  async createCustomizedDesign(userId, data) {
    const { editorData, baseTemplateId, finalPreviewImageUrl } = data;
    if (!editorData) {
      throw new ValidationException("Dữ liệu thiết kế là bắt buộc");
    }

    const design = await this.designRepository.createCustomizedDesign({
      ...data,
      userId,
    });
    Logger.success("Customized design saved", { designId: design._id, userId });
    return design;
  }

  async getCustomizedDesign(designId, user) {
    const design = await this.designRepository.findCustomizedDesignById(
      designId
    );
    if (!design) {
      throw new NotFoundException(
        "Không tìm thấy thiết kế tùy chỉnh",
        designId
      );
    }

    // Chỉ chủ sở hữu hoặc nhà in (trong logic đơn hàng) mới được xem
    // Tạm thời chỉ cho chủ sở hữu
    if (design.userId.toString() !== user._id.toString()) {
      throw new ForbiddenException("Không có quyền xem thiết kế này");
    }

    return design;
  }
  async getMyCustomizedDesigns(userId) {
    Logger.debug(`[Service] Fetching all designs for user: ${userId}`);
    return await this.designRepository.findCustomizedDesignsByUserId(userId);
  }
}
