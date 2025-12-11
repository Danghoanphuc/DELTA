/**
 * ProposalRepository - Data Access Layer for Proposals
 *
 * Implements repository pattern for Proposal model
 * Following SOLID principles and existing codebase patterns
 *
 * Requirements: 2.4
 */

import mongoose, { FilterQuery, UpdateQuery, Types } from "mongoose";
import { Logger } from "../utils/logger.js";
import {
  Proposal,
  IProposal,
  PROPOSAL_STATUS,
} from "../models/proposal.model.js";
import {
  IRepository,
  PaginatedResult,
} from "../interfaces/repository.interface.js";

/**
 * Proposal Repository Interface
 */
export interface IProposalRepository extends IRepository<IProposal> {
  findByCustomer(customerId: string): Promise<IProposal[]>;
  updateStatus(id: string, status: string): Promise<IProposal | null>;
  findByProposalNumber(proposalNumber: string): Promise<IProposal | null>;
}

/**
 * ProposalRepository - Data access for proposals
 */
export class ProposalRepository implements IProposalRepository {
  /**
   * Find proposal by ID
   */
  async findById(id: string): Promise<IProposal | null> {
    try {
      return await Proposal.findById(id)
        .populate("customerId", "name email phone")
        .populate("createdBy", "email name")
        .lean();
    } catch (error) {
      Logger.error(`[ProposalRepo] Error finding proposal by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find single proposal by filter
   */
  async findOne(filter: FilterQuery<IProposal>): Promise<IProposal | null> {
    try {
      return await Proposal.findOne(filter)
        .populate("customerId", "name email phone")
        .populate("createdBy", "email name")
        .lean();
    } catch (error) {
      Logger.error(`[ProposalRepo] Error finding proposal:`, error);
      throw error;
    }
  }

  /**
   * Find all proposals matching filter
   */
  async find(filter: FilterQuery<IProposal>): Promise<IProposal[]> {
    try {
      return await Proposal.find(filter)
        .populate("customerId", "name email phone")
        .populate("createdBy", "email name")
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      Logger.error(`[ProposalRepo] Error finding proposals:`, error);
      throw error;
    }
  }

  /**
   * Create new proposal
   * Requirements: 2.4
   */
  async create(data: Partial<IProposal>): Promise<IProposal> {
    try {
      const proposal = new Proposal(data);
      const saved = await proposal.save();
      Logger.success(
        `[ProposalRepo] Created proposal: ${saved.proposalNumber}`
      );
      return saved.toObject();
    } catch (error) {
      Logger.error(`[ProposalRepo] Error creating proposal:`, error);
      throw error;
    }
  }

  /**
   * Update proposal by ID
   */
  async update(
    id: string,
    data: UpdateQuery<IProposal>
  ): Promise<IProposal | null> {
    try {
      const updated = await Proposal.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate("customerId", "name email phone")
        .populate("createdBy", "email name")
        .lean();

      if (updated) {
        Logger.success(
          `[ProposalRepo] Updated proposal: ${updated.proposalNumber}`
        );
      }
      return updated;
    } catch (error) {
      Logger.error(`[ProposalRepo] Error updating proposal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete proposal by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await Proposal.findByIdAndDelete(id);
      if (result) {
        Logger.success(
          `[ProposalRepo] Deleted proposal: ${result.proposalNumber}`
        );
      }
      return !!result;
    } catch (error) {
      Logger.error(`[ProposalRepo] Error deleting proposal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Count proposals matching filter
   */
  async count(filter?: FilterQuery<IProposal>): Promise<number> {
    try {
      return await Proposal.countDocuments(filter || {});
    } catch (error) {
      Logger.error(`[ProposalRepo] Error counting proposals:`, error);
      throw error;
    }
  }

  /**
   * Find proposals by customer ID
   * Requirements: 2.4
   */
  async findByCustomer(customerId: string): Promise<IProposal[]> {
    try {
      return await Proposal.find({ customerId: new Types.ObjectId(customerId) })
        .populate("createdBy", "email name")
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      Logger.error(
        `[ProposalRepo] Error finding proposals by customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update proposal status
   * Requirements: 2.4
   */
  async updateStatus(id: string, status: string): Promise<IProposal | null> {
    try {
      const updated = await Proposal.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
        .populate("customerId", "name email phone")
        .populate("createdBy", "email name")
        .lean();

      if (updated) {
        Logger.success(
          `[ProposalRepo] Updated proposal ${updated.proposalNumber} status to ${status}`
        );
      }
      return updated;
    } catch (error) {
      Logger.error(
        `[ProposalRepo] Error updating proposal ${id} status:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find proposal by proposal number
   */
  async findByProposalNumber(
    proposalNumber: string
  ): Promise<IProposal | null> {
    try {
      return await Proposal.findOne({ proposalNumber })
        .populate("customerId", "name email phone")
        .populate("createdBy", "email name")
        .lean();
    } catch (error) {
      Logger.error(
        `[ProposalRepo] Error finding proposal by number ${proposalNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find proposals with pagination
   */
  async findWithPagination(
    filter: FilterQuery<IProposal>,
    page: number = 1,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaginatedResult<IProposal>> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        Proposal.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("customerId", "name email phone")
          .populate("createdBy", "email name")
          .lean(),
        Proposal.countDocuments(filter),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      Logger.error(
        `[ProposalRepo] Error finding proposals with pagination:`,
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const proposalRepository = new ProposalRepository();
