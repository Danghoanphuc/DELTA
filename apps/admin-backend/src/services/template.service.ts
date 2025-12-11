// apps/admin-backend/src/services/template.service.ts
// ✅ PHASE 9.1.2: Template Service - Create, Load, and Manage Product Templates

import mongoose from "mongoose";
import {
  ProductTemplate,
  IProductTemplate,
  CatalogProduct,
} from "../models/catalog.models.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.js";

export interface CreateTemplateFromOrderData {
  orderId: string;
  name: string;
  description?: string;
  type?: "welcome_kit" | "event_swag" | "client_gift" | "holiday" | "custom";
  isPublic?: boolean;
}

export interface LoadTemplateResult {
  template: IProductTemplate;
  availability: {
    allAvailable: boolean;
    unavailableProducts: {
      productId: mongoose.Types.ObjectId;
      productName: string;
      suggestedSubstitutes: mongoose.Types.ObjectId[];
    }[];
  };
  needsUpdate: boolean;
}

export interface SubstituteProductInfo {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productSku: string;
  basePrice: number;
  categoryId: mongoose.Types.ObjectId;
  categoryPath: string;
  thumbnailUrl?: string;
  reason: string;
  priceDifference: number;
  isInStock: boolean;
}

/**
 * Template Service
 * Handles product template creation, loading, and management
 */
export class TemplateService {
  /**
   * Create template from existing swag order
   */
  async createFromOrder(
    organizationId: string,
    userId: string,
    data: CreateTemplateFromOrderData
  ): Promise<IProductTemplate> {
    Logger.debug(`[TemplateSvc] Creating template from order: ${data.orderId}`);

    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationException("Tên template không được để trống");
    }

    // Get order (assuming SwagOrder model exists)
    const SwagOrder = mongoose.model("SwagOrder");
    const order = await SwagOrder.findById(data.orderId)
      .populate("swagPack")
      .lean();

    if (!order) {
      throw new NotFoundException("Swag Order", data.orderId);
    }

    // Check authorization
    if (order.organization.toString() !== organizationId) {
      throw new ForbiddenException(
        "Bạn không có quyền tạo template từ đơn hàng này"
      );
    }

    // Extract items from order
    const items = [];
    if (order.packSnapshot && order.packSnapshot.items) {
      for (const item of order.packSnapshot.items) {
        // Get product details
        const product = await CatalogProduct.findById(item.product);
        if (!product) continue;

        items.push({
          productId: item.product,
          productName: item.productName || product.name,
          productSku: product.sku,
          quantity: item.quantity || 1,
          isRequired: true,
          allowSubstitute: true,
          substituteProducts: [],
        });
      }
    }

    if (items.length === 0) {
      throw new ValidationException(
        "Không thể tạo template từ đơn hàng không có sản phẩm"
      );
    }

    // Create template
    const template = new ProductTemplate({
      name: data.name,
      description: data.description,
      type: data.type || "custom",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      items,
      defaultCustomization: {
        includeLogo: true,
        includePersonalization: false,
      },
      packaging: {
        boxType: "standard",
        includeCard: false,
      },
      estimatedCost: 0,
      estimatedPrice: order.packSnapshot?.unitPrice || 0,
      isActive: true,
      isPublic: data.isPublic || false,
      usageTracking: {
        timesUsed: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      },
      orderHistory: [],
      discontinuedProducts: [],
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await template.save();

    Logger.success(
      `[TemplateSvc] Created template: ${template.name} (${template._id})`
    );

    return template;
  }

  /**
   * Load template for reorder
   * Checks product availability and suggests substitutes
   */
  async loadForReorder(
    organizationId: string,
    templateId: string
  ): Promise<LoadTemplateResult> {
    Logger.debug(`[TemplateSvc] Loading template for reorder: ${templateId}`);

    // Get template
    const template = await ProductTemplate.findById(templateId)
      .populate("items.productId")
      .populate("items.substituteProducts.productId");

    if (!template) {
      throw new NotFoundException("Product Template", templateId);
    }

    // Check authorization
    if (
      template.organizationId &&
      template.organizationId.toString() !== organizationId
    ) {
      throw new ForbiddenException("Bạn không có quyền sử dụng template này");
    }

    if (!template.isActive) {
      throw new ValidationException("Template này đã bị vô hiệu hóa");
    }

    // Check product availability
    const availability = await template.checkProductAvailability();

    // Determine if template needs update
    const needsUpdate = availability.unavailableProducts.length > 0;

    Logger.debug(
      `[TemplateSvc] Template loaded. Available: ${availability.allAvailable}, Needs update: ${needsUpdate}`
    );

    return {
      template,
      availability,
      needsUpdate,
    };
  }

  /**
   * Get suggested substitutes for a discontinued product
   */
  async getSuggestedSubstitutes(
    templateId: string,
    productId: string
  ): Promise<SubstituteProductInfo[]> {
    Logger.debug(
      `[TemplateSvc] Getting substitutes for product: ${productId} in template: ${templateId}`
    );

    // Get template
    const template = await ProductTemplate.findById(templateId);
    if (!template) {
      throw new NotFoundException("Product Template", templateId);
    }

    // Get original product
    const originalProduct = await CatalogProduct.findById(productId);
    if (!originalProduct) {
      throw new NotFoundException("Product", productId);
    }

    // Get substitute product IDs
    const substituteIds = await template.getSuggestedSubstitutes(
      new mongoose.Types.ObjectId(productId)
    );

    if (substituteIds.length === 0) {
      return [];
    }

    // Get full product details
    const substitutes = await CatalogProduct.find({
      _id: { $in: substituteIds },
      status: "active",
      isPublished: true,
    }).lean();

    // Format substitute info
    const substituteInfo: SubstituteProductInfo[] = substitutes.map(
      (product) => {
        const priceDifference = product.basePrice - originalProduct.basePrice;
        const priceDiffPercent =
          (priceDifference / originalProduct.basePrice) * 100;

        let reason = "Sản phẩm tương tự trong cùng danh mục";
        if (Math.abs(priceDiffPercent) < 10) {
          reason = "Giá tương đương, chất lượng tương tự";
        } else if (priceDifference < 0) {
          reason = `Giá thấp hơn ${Math.abs(priceDiffPercent).toFixed(0)}%`;
        } else {
          reason = `Chất lượng cao hơn, giá cao hơn ${priceDiffPercent.toFixed(
            0
          )}%`;
        }

        return {
          productId: product._id,
          productName: product.name,
          productSku: product.sku,
          basePrice: product.basePrice,
          categoryId: product.categoryId,
          categoryPath: product.categoryPath,
          thumbnailUrl: product.thumbnailUrl,
          reason,
          priceDifference,
          isInStock: product.stockQuantity > 0,
        };
      }
    );

    Logger.debug(
      `[TemplateSvc] Found ${substituteInfo.length} substitutes for product ${productId}`
    );

    return substituteInfo;
  }

  /**
   * Update template with substitute products
   */
  async updateSubstitutes(
    organizationId: string,
    templateId: string,
    productId: string,
    substituteProductIds: string[]
  ): Promise<IProductTemplate> {
    Logger.debug(
      `[TemplateSvc] Updating substitutes for product ${productId} in template ${templateId}`
    );

    // Get template
    const template = await ProductTemplate.findById(templateId);
    if (!template) {
      throw new NotFoundException("Product Template", templateId);
    }

    // Check authorization
    if (
      template.organizationId &&
      template.organizationId.toString() !== organizationId
    ) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa template này");
    }

    // Find item in template
    const item = template.items.find(
      (i: any) => i.productId.toString() === productId
    );

    if (!item) {
      throw new NotFoundException("Product in template", productId);
    }

    // Get substitute products
    const substituteProducts = await CatalogProduct.find({
      _id: { $in: substituteProductIds },
      status: "active",
      isPublished: true,
    }).lean();

    // Update substitutes
    item.substituteProducts = substituteProducts.map((p) => ({
      productId: p._id,
      productName: p.name,
      productSku: p.sku,
      reason: "Được chọn bởi người dùng",
    }));

    await template.save();

    Logger.success(
      `[TemplateSvc] Updated substitutes for product ${productId}`
    );

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(
    organizationId: string,
    templateId: string
  ): Promise<IProductTemplate> {
    const template = await ProductTemplate.findById(templateId)
      .populate("items.productId")
      .populate("items.substituteProducts.productId");

    if (!template) {
      throw new NotFoundException("Product Template", templateId);
    }

    // Check authorization
    if (
      template.organizationId &&
      template.organizationId.toString() !== organizationId &&
      !template.isPublic
    ) {
      throw new ForbiddenException("Bạn không có quyền xem template này");
    }

    return template;
  }

  /**
   * Get templates for organization
   */
  async getTemplates(
    organizationId: string,
    filters?: {
      type?: string;
      isPublic?: boolean;
      isActive?: boolean;
    }
  ): Promise<IProductTemplate[]> {
    const query: any = {
      $or: [
        { organizationId: new mongoose.Types.ObjectId(organizationId) },
        { isPublic: true },
      ],
    };

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const templates = await ProductTemplate.find(query)
      .sort({ "usageTracking.timesUsed": -1, createdAt: -1 })
      .lean();

    return templates;
  }

  /**
   * Update template
   */
  async updateTemplate(
    organizationId: string,
    templateId: string,
    data: Partial<IProductTemplate>
  ): Promise<IProductTemplate> {
    const template = await ProductTemplate.findById(templateId);

    if (!template) {
      throw new NotFoundException("Product Template", templateId);
    }

    // Check authorization
    if (
      template.organizationId &&
      template.organizationId.toString() !== organizationId
    ) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa template này");
    }

    // Update allowed fields
    if (data.name) template.name = data.name;
    if (data.description !== undefined) template.description = data.description;
    if (data.type) template.type = data.type;
    if (data.isActive !== undefined) template.isActive = data.isActive;
    if (data.isPublic !== undefined) template.isPublic = data.isPublic;

    await template.save();

    Logger.success(`[TemplateSvc] Updated template: ${template._id}`);

    return template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(
    organizationId: string,
    templateId: string
  ): Promise<void> {
    const template = await ProductTemplate.findById(templateId);

    if (!template) {
      throw new NotFoundException("Product Template", templateId);
    }

    // Check authorization
    if (
      template.organizationId &&
      template.organizationId.toString() !== organizationId
    ) {
      throw new ForbiddenException("Bạn không có quyền xóa template này");
    }

    await ProductTemplate.findByIdAndDelete(templateId);

    Logger.success(`[TemplateSvc] Deleted template: ${templateId}`);
  }
}
