/**
 * ReorderRepository - Data access layer for re-order operations
 *
 * Handles database operations for re-ordering functionality
 */

import { Proposal, IProposal } from "../models/proposal.model.js";
import { Asset, IAsset } from "../models/asset.model.js";
import { Logger } from "../utils/logger.js";

/**
 * ReorderRepository - Repository for re-order data access
 */
export class ReorderRepository {
  /**
   * Find proposal by ID
   */
  async findProposalById(id: string): Promise<IProposal | null> {
    return await Proposal.findById(id).lean();
  }

  /**
   * Find order by ID (using Proposal as order representation)
   */
  async findOrderById(id: string): Promise<IProposal | null> {
    return await Proposal.findById(id).lean();
  }

  /**
   * Find FINAL assets for an order
   */
  async findFinalAssetsByOrder(orderId: string): Promise<IAsset[]> {
    return await Asset.find({
      orderId,
      status: "final",
      isLocked: true,
    }).lean();
  }

  /**
   * Create new proposal (order)
   */
  async createProposal(data: Partial<IProposal>): Promise<IProposal> {
    const proposal = new Proposal(data);
    return await proposal.save();
  }

  /**
   * Link assets to new order
   */
  async linkAssetsToOrder(
    assetIds: string[],
    newOrderId: string
  ): Promise<void> {
    // Note: In a real implementation, we might create copies of assets
    // For now, we'll just log the operation
    Logger.debug(
      `[ReorderRepo] Would link ${assetIds.length} assets to order ${newOrderId}`
    );
  }
}

// Export singleton instance
export const reorderRepository = new ReorderRepository();
