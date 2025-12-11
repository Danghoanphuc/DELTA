// apps/admin-frontend/src/services/admin.delivery-thread.service.ts
/**
 * Admin Delivery Thread Service
 * API service for delivery thread management in admin portal
 */

import api from "@/lib/axios";

export interface ThreadMessage {
  _id: string;
  senderId: string;
  senderModel: "User" | "OrganizationProfile";
  senderName: string;
  senderRole: "customer" | "shipper" | "admin";
  messageType: "text" | "system" | "image";
  content: string;
  attachments?: Array<{
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

export interface DeliveryThread {
  _id: string;
  checkinId: string;
  orderId: string;
  orderNumber: string;
  orderType: "swag" | "master";
  organizationId: string;
  participants: Array<{
    userId: string;
    userModel: "User" | "OrganizationProfile";
    userName: string;
    role: "customer" | "shipper" | "admin";
    joinedAt: string;
    lastReadAt?: string;
  }>;
  messages: ThreadMessage[];
  messageCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

class AdminDeliveryThreadService {
  /**
   * Get thread by checkin ID
   */
  async getThreadByCheckin(checkinId: string): Promise<DeliveryThread> {
    const res = await api.get(`/admin/delivery-threads/checkin/${checkinId}`);
    return res.data?.data?.thread;
  }

  /**
   * Add message to thread
   */
  async addMessage(threadId: string, content: string): Promise<ThreadMessage> {
    const res = await api.post(`/admin/delivery-threads/${threadId}/messages`, {
      content,
    });
    // Backend returns updated thread, extract the last message
    const thread = res.data?.data?.thread;
    return thread?.messages?.[thread.messages.length - 1];
  }
}

export const adminDeliveryThreadService = new AdminDeliveryThreadService();
