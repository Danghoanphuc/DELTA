// @ts-nocheck
/**
 * JobTicketRepository
 *
 * Data access layer for job ticket operations
 * Handles all database interactions for job tickets
 *
 * Requirements: 6.2
 */

import { JobTicket, IJobTicket } from "../models/job-ticket.model.js";
import { Types } from "mongoose";

export class JobTicketRepository {
  /**
   * Create a new job ticket
   */
  async create(data: Partial<IJobTicket>): Promise<IJobTicket> {
    const ticket = new JobTicket(data);
    return await ticket.save();
  }

  /**
   * Find job ticket by ID
   */
  async findById(id: string | Types.ObjectId): Promise<IJobTicket | null> {
    return await JobTicket.findById(id)
      .populate("assets")
      .populate("orderId")
      .lean();
  }

  /**
   * Find all job tickets for an order
   */
  async findByOrder(orderId: string | Types.ObjectId): Promise<IJobTicket[]> {
    return await JobTicket.find({ orderId })
      .populate("assets")
      .sort({ generatedAt: -1 })
      .lean();
  }

  /**
   * Find job ticket by QR code
   */
  async findByQR(qrCode: string): Promise<IJobTicket | null> {
    return await JobTicket.findOne({ qrCode })
      .populate("assets")
      .populate("orderId")
      .lean();
  }

  /**
   * Find job ticket by ticket ID
   */
  async findByTicketId(ticketId: string): Promise<IJobTicket | null> {
    return await JobTicket.findOne({ ticketId })
      .populate("assets")
      .populate("orderId")
      .lean();
  }

  /**
   * Update job ticket status
   */
  async updateStatus(
    id: string | Types.ObjectId,
    status: string
  ): Promise<IJobTicket | null> {
    return await JobTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
  }

  /**
   * Add production log to job ticket
   */
  async addProductionLog(
    id: string | Types.ObjectId,
    log: {
      stage: string;
      operatorId: Types.ObjectId;
      stationId: string;
      notes?: string;
    }
  ): Promise<IJobTicket | null> {
    const ticket = await JobTicket.findById(id);
    if (!ticket) return null;

    await ticket.addProductionLog(log);
    return ticket.toObject();
  }

  /**
   * Add production error to job ticket
   */
  async addProductionError(
    id: string | Types.ObjectId,
    error: {
      errorType: string;
      description: string;
      reportedBy: Types.ObjectId;
    }
  ): Promise<IJobTicket | null> {
    const ticket = await JobTicket.findById(id);
    if (!ticket) return null;

    await ticket.logError(error);
    return ticket.toObject();
  }

  /**
   * Mark job ticket as completed
   */
  async markCompleted(id: string | Types.ObjectId): Promise<IJobTicket | null> {
    return await JobTicket.findByIdAndUpdate(
      id,
      {
        status: "completed",
        completedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Get all active job tickets
   */
  async findActive(): Promise<IJobTicket[]> {
    return await JobTicket.find({
      status: { $in: ["active", "in_progress"] },
    })
      .populate("assets")
      .populate("orderId")
      .sort({ generatedAt: -1 })
      .lean();
  }

  /**
   * Count job tickets by status
   */
  async countByStatus(status: string): Promise<number> {
    return await JobTicket.countDocuments({ status });
  }
}
