// src/modules/swag-packs/swag-pack.service.js
// ✅ Swag Pack Service - Business logic

import { SwagPackRepository } from "./swag-pack.repository.js";
import {
  NotFoundException,
  ValidationException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class SwagPackService {
  constructor() {
    this.swagPackRepository = new SwagPackRepository();
  }

  /**
   * Create a new swag pack
   */
  async createPack(organizationId, userId, data) {
    Logger.debug(`[SwagPackSvc] Creating pack for org: ${organizationId}`);

    const { name, description, type, items, packaging, branding, tags } = data;

    if (!name) {
      throw new ValidationException("Tên bộ quà là bắt buộc");
    }

    if (!items || items.length === 0) {
      throw new ValidationException("Bộ quà phải có ít nhất 1 sản phẩm");
    }

    const pack = await this.swagPackRepository.create({
      organization: organizationId,
      createdBy: userId,
      name,
      description,
      type: type || "custom",
      items,
      packaging: packaging || {},
      branding: branding || {},
      tags: tags || [],
      status: "draft",
    });

    Logger.success(`[SwagPackSvc] Created pack: ${pack._id}`);
    return pack;
  }

  /**
   * Get packs list
   */
  async getPacks(organizationId, options = {}) {
    return await this.swagPackRepository.findByOrganization(
      organizationId,
      options
    );
  }

  /**
   * Get single pack
   */
  async getPack(organizationId, packId) {
    const pack = await this.swagPackRepository.findById(packId);

    if (!pack) {
      throw new NotFoundException("Swag Pack", packId);
    }

    if (pack.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền truy cập bộ quà này");
    }

    return pack;
  }

  /**
   * Update pack
   */
  async updatePack(organizationId, packId, data) {
    await this.getPack(organizationId, packId); // Verify ownership

    const updated = await this.swagPackRepository.update(packId, data);
    Logger.success(`[SwagPackSvc] Updated pack: ${packId}`);
    return updated;
  }

  /**
   * Add item to pack
   */
  async addItem(organizationId, packId, itemData) {
    const pack = await this.getPack(organizationId, packId);

    pack.items.push(itemData);
    await pack.save();

    Logger.success(`[SwagPackSvc] Added item to pack: ${packId}`);
    return pack;
  }

  /**
   * Remove item from pack
   */
  async removeItem(organizationId, packId, itemId) {
    const pack = await this.getPack(organizationId, packId);

    pack.items = pack.items.filter((item) => item._id.toString() !== itemId);
    await pack.save();

    Logger.success(`[SwagPackSvc] Removed item from pack: ${packId}`);
    return pack;
  }

  /**
   * Update item in pack
   */
  async updateItem(organizationId, packId, itemId, itemData) {
    const pack = await this.getPack(organizationId, packId);

    const itemIndex = pack.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      throw new NotFoundException("Item", itemId);
    }

    pack.items[itemIndex] = {
      ...pack.items[itemIndex].toObject(),
      ...itemData,
    };
    await pack.save();

    return pack;
  }

  /**
   * Publish pack (make active)
   */
  async publishPack(organizationId, packId) {
    const pack = await this.getPack(organizationId, packId);

    if (pack.items.length === 0) {
      throw new ValidationException("Bộ quà phải có ít nhất 1 sản phẩm");
    }

    pack.status = "active";
    await pack.save();

    Logger.success(`[SwagPackSvc] Published pack: ${packId}`);
    return pack;
  }

  /**
   * Archive pack
   */
  async archivePack(organizationId, packId) {
    await this.getPack(organizationId, packId);
    const archived = await this.swagPackRepository.archive(packId);
    Logger.success(`[SwagPackSvc] Archived pack: ${packId}`);
    return archived;
  }

  /**
   * Delete pack
   */
  async deletePack(organizationId, packId) {
    const pack = await this.getPack(organizationId, packId);

    if (pack.totalOrdered > 0) {
      throw new ValidationException(
        "Không thể xóa bộ quà đã có đơn hàng. Hãy archive thay vì xóa."
      );
    }

    await this.swagPackRepository.delete(packId);
    Logger.success(`[SwagPackSvc] Deleted pack: ${packId}`);
    return { success: true };
  }

  /**
   * Duplicate pack
   */
  async duplicatePack(organizationId, packId) {
    const pack = await this.getPack(organizationId, packId);
    const newName = `${pack.name} (Copy)`;

    const duplicated = await this.swagPackRepository.duplicate(pack, newName);
    Logger.success(
      `[SwagPackSvc] Duplicated pack: ${packId} -> ${duplicated._id}`
    );
    return duplicated;
  }

  /**
   * Get pack templates (pre-built packs)
   */
  async getTemplates() {
    // Return pre-defined templates
    return [
      {
        id: "welcome_kit_basic",
        name: "Welcome Kit - Cơ bản",
        type: "welcome_kit",
        description: "Bộ chào mừng nhân viên mới với các item thiết yếu",
        suggestedItems: ["Sổ tay", "Bút ký", "Áo polo", "Bình nước"],
        estimatedPrice: 350000,
      },
      {
        id: "welcome_kit_premium",
        name: "Welcome Kit - Cao cấp",
        type: "welcome_kit",
        description: "Bộ chào mừng đầy đủ cho nhân viên mới",
        suggestedItems: [
          "Sổ tay da",
          "Bút kim loại",
          "Áo polo",
          "Bình giữ nhiệt",
          "Túi tote",
          "Sticker pack",
        ],
        estimatedPrice: 650000,
      },
      {
        id: "event_swag",
        name: "Event Swag Pack",
        type: "event_swag",
        description: "Quà tặng cho sự kiện, hội nghị",
        suggestedItems: ["Dây đeo thẻ", "Sticker", "Bình nước", "Túi canvas"],
        estimatedPrice: 200000,
      },
      {
        id: "client_gift",
        name: "Client Gift Box",
        type: "client_gift",
        description: "Hộp quà tri ân khách hàng",
        suggestedItems: ["Sổ tay cao cấp", "Bút ký", "Lịch để bàn"],
        estimatedPrice: 450000,
      },
      {
        id: "tet_gift",
        name: "Quà Tết",
        type: "holiday_gift",
        description: "Bộ quà Tết cho nhân viên",
        suggestedItems: ["Bao lì xì", "Lịch Tết", "Hộp quà"],
        estimatedPrice: 300000,
      },
    ];
  }

  /**
   * Get dashboard stats
   */
  async getStats(organizationId) {
    const [totalPacks, activePacks, draftPacks] = await Promise.all([
      this.swagPackRepository.countByOrganization(organizationId),
      this.swagPackRepository.countByOrganization(organizationId, "active"),
      this.swagPackRepository.countByOrganization(organizationId, "draft"),
    ]);

    const popularPacks = await this.swagPackRepository.getPopularPacks(
      organizationId,
      5
    );

    return {
      totalPacks,
      activePacks,
      draftPacks,
      popularPacks,
    };
  }
}
