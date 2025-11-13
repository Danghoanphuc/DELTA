// src/modules/printer-studio/studio.service.js
// ✅ PHẪU THUẬT: Sửa lỗi import ProductRepository

// ✅ SỬA LỖI 1: Import instance (chữ 'p' thường)
import { productRepository } from "../products/product.repository.js";
import { DesignRepository } from "../designs/design.repository.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class StudioService {
  constructor() {
    // ✅ SỬA LỖI 2: Dùng instance đã import
    this.productRepo = productRepository;
    this.designRepo = new DesignRepository();
  }

  async publish(printerId, body, files) {
    Logger.debug(`[StudioService] Bắt đầu publish...`);

    // 1. Validate Input (Parse JSON data từ form)
    let productData, templateData;
    try {
      productData = JSON.parse(body.productData);
      templateData = JSON.parse(body.templateData);
    } catch (e) {
      throw new ValidationException(
        "Dữ liệu productData/templateData JSON không hợp lệ."
      );
    }

    if (
      !files.modelFile ||
      !files.dielineFile ||
      !files.productionFile ||
      !files.previewFile
    ) {
      throw new ValidationException(
        "Thiếu file upload (cần 4 file: model, dieline, production, preview)."
      );
    }

    // 2. Trích xuất URL từ Cloudinary (đã được multer xử lý)
    const modelUrl = files.modelFile[0].path;
    const dielineUrl = files.dielineFile[0].path;
    const productionFileUrl = files.productionFile[0].path;
    const previewThumbnailUrl = files.previewFile[0].path;

    // (Giả sử ta chưa có link embed 3D tĩnh, sẽ dùng sau)
    const embed3DUrl = null;

    // 3. Tạo "Đầu ra 1: Product (Phôi)"
    // ✅ SỬA LỖI 3: Dùng this.productRepo (instance)
    const newProduct = await this.productRepo.create({
      ...productData, // (name, category, specifications, pricing)
      printerId: printerId,
      isActive: true, // Mặc định là active
      // Thêm các tài sản "Phôi" vào model Product
      // (Lưu ý: Bạn cần thêm "assets" vào product.model.js)
      assets: {
        modelUrl: modelUrl,
        dielineUrl: dielineUrl,
      },
    });
    Logger.success(`[StudioService] Đã tạo Product (Phôi): ${newProduct._id}`);

    // 4. Tạo "Đầu ra 2: DesignTemplate (Mẫu)"
    const newTemplate = await this.designRepo.createTemplate({
      ...templateData, // (name, editorData, isPublic)
      printerId: printerId,
      baseProductId: newProduct._id, // <-- Liên kết 2 bản ghi

      // Gói Dữ liệu Thiết kế (3 phần)
      // 1. Nguồn (đã có trong templateData.editorData)

      // 2. Sản xuất (Thành phẩm)
      productionFile: {
        url: productionFileUrl,
        type: "SVG", // Giả định là SVG
        bleed_mm: productData.specifications?.bleed || 0,
      },

      // 3. Trưng bày (Cái bóng)
      preview: {
        thumbnailUrl: previewThumbnailUrl,
        embed3DUrl: embed3DUrl,
      },
    });
    Logger.success(
      `[StudioService] Đã tạo DesignTemplate (Mẫu): ${newTemplate._id}`
    );

    // 5. Trả về kết quả
    return {
      product: newProduct,
      template: newTemplate,
    };
  }
}
