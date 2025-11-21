// apps/customer-frontend/src/services/api/connection.api.service.ts
// ✅ SOCIAL: Connection API Service - Kết bạn & Quản lý kết nối

import api from "@/shared/lib/axios";

export interface Connection {
  _id: string;
  requester: {
    _id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  recipient: {
    _id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  status: "pending" | "accepted" | "declined" | "blocked";
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  recipientId: string;
}

export type ConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "declined"
  | "blocked";

export interface ConnectionResponseData {
  connection?: Connection;
  connections?: Connection[];
  friends?: Connection[];
  requests?: Connection[];
  sentRequests?: Connection[];
  count?: number;
  status?: ConnectionStatus;
  isSender?: boolean;
}

export interface ConnectionResponse {
  success: boolean;
  message?: string;
  data?: ConnectionResponseData;
}

/**
 * Send a connection request to another user
 */
export const sendConnectionRequest = async (
  recipientId: string
): Promise<ConnectionResponse> => {
  const response = await api.post<ConnectionResponse>(
    "/connections/send",
    { recipientId }
  );
  return response.data;
};

/**
 * Accept a connection request
 */
export const acceptConnectionRequest = async (
  connectionId: string
): Promise<ConnectionResponse> => {
  const response = await api.put<ConnectionResponse>(
    `/connections/${connectionId}/accept`
  );
  return response.data;
};

/**
 * Decline a connection request
 */
export const declineConnectionRequest = async (
  connectionId: string
): Promise<ConnectionResponse> => {
  const response = await api.put<ConnectionResponse>(
    `/connections/${connectionId}/decline`
  );
  return response.data;
};

/**
 * Block a user
 */
export const blockUser = async (
  userId: string
): Promise<ConnectionResponse> => {
  const response = await api.post<ConnectionResponse>(
    "/connections/block",
    { userId }
  );
  return response.data;
};

/**
 * Get all friends (accepted connections)
 */
export const getFriends = async (): Promise<ConnectionResponse> => {
  const response = await api.get<ConnectionResponse>(
    "/connections/friends"
  );
  return response.data;
};

/**
 * Get pending connection requests (received)
 */
export const getPendingRequests = async (): Promise<ConnectionResponse> => {
  const response = await api.get<ConnectionResponse>(
    "/connections/pending"
  );
  return response.data;
};

/**
 * Get sent connection requests
 */
export const getSentRequests = async (): Promise<ConnectionResponse> => {
  const response = await api.get<ConnectionResponse>(
    "/connections/sent"
  );
  return response.data;
};

/**
 * Get connection status with a specific user
 */
export const getConnectionStatus = async (
  userId: string
): Promise<ConnectionResponse> => {
  const response = await api.get<ConnectionResponse>(
    `/connections/status/${userId}`
  );
  return response.data;
};

/**
 * Remove a connection (unfriend)
 */
export const removeConnection = async (
  connectionId: string
): Promise<ConnectionResponse> => {
  const response = await api.delete<ConnectionResponse>(
    `/connections/${connectionId}`
  );
  return response.data;
};

/**
 * DEBUG: Clear connection with a user (for testing)
 */
export const debugClearConnection = async (
  userId: string
): Promise<ConnectionResponse> => {
  const response = await api.delete<ConnectionResponse>(
    `/connections/debug/clear/${userId}`
  );
  return response.data;
};

