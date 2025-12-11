// apps/customer-frontend/src/features/delivery-checkin/services/delivery-thread.service.ts
/**
 * Delivery Thread Service
 * API service for delivery discussion threads
 */

import api from "@/shared/lib/axios";

export interface ThreadMessage {
  _id: string;
  senderId: string;
  senderModel: "User" | "OrganizationProfile";
  senderName: string;
  senderRole: "customer" | "admin" | "shipper";
  messageType: "text" | "image" | "system";
  content: string;
  attachments: Array<{
    url: string;
    thumbnailUrl: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  userId: string;
  userModel: "User" | "OrganizationProfile";
  userName: string;
  role: "customer" | "admin" | "shipper";
  joinedAt: string;
  lastReadAt?: string;
}

export interface DeliveryThread {
  _id: string;
  checkinId: string;
  orderId: string;
  orderNumber: string;
  organizationId: string;
  participants: ThreadParticipant[];
  messages: ThreadMessage[];
  messageCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  content: string;
  messageType?: "text" | "image";
  attachments?: Array<{
    url: string;
    thumbnailUrl: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

class DeliveryThreadService {
  /**
   * Get or create thread for a check-in
   */
  async getThreadByCheckin(checkinId: string): Promise<DeliveryThread> {
    const res = await api.get(`/delivery-threads/checkin/${checkinId}`);
    return res.data?.data?.thread;
  }

  /**
   * Get thread by ID
   */
  async getThread(threadId: string): Promise<DeliveryThread> {
    const res = await api.get(`/delivery-threads/${threadId}`);
    return res.data?.data?.thread;
  }

  /**
   * Add message to thread
   */
  async addMessage(
    threadId: string,
    data: CreateMessageData
  ): Promise<DeliveryThread> {
    const res = await api.post(`/delivery-threads/${threadId}/messages`, data);
    return res.data?.data?.thread;
  }

  /**
   * Update message
   */
  async updateMessage(
    threadId: string,
    messageId: string,
    content: string
  ): Promise<DeliveryThread> {
    const res = await api.put(
      `/delivery-threads/${threadId}/messages/${messageId}`,
      { content }
    );
    return res.data?.data?.thread;
  }

  /**
   * Delete message
   */
  async deleteMessage(
    threadId: string,
    messageId: string
  ): Promise<DeliveryThread> {
    const res = await api.delete(
      `/delivery-threads/${threadId}/messages/${messageId}`
    );
    return res.data?.data?.thread;
  }

  /**
   * Mark thread as read
   */
  async markAsRead(threadId: string): Promise<DeliveryThread> {
    const res = await api.post(`/delivery-threads/${threadId}/read`);
    return res.data?.data?.thread;
  }

  /**
   * Get threads for current user
   */
  async getThreads(params?: {
    page?: number;
    limit?: number;
    isResolved?: boolean;
  }): Promise<{
    threads: DeliveryThread[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const res = await api.get("/delivery-threads", { params });
    return res.data?.data;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const res = await api.get("/delivery-threads/unread-count");
    return res.data?.data?.count || 0;
  }
}

export const deliveryThreadService = new DeliveryThreadService();
