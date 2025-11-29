// apps/customer-frontend/src/features/chat/services/chat.api.service.ts

import api from "@/shared/lib/axios";
import { AiApiResponse, ChatMessage, ChatConversation } from "@/types/chat";
import { Order } from "@/types/order";

// ✅ 1. HÀM CHUẨN HÓA DỮ LIỆU (CORE)
export const normalizeMessage = (msg: any): ChatMessage => {
  // 1. Ép kiểu senderType
  let finalSenderType = msg.senderType;
  
  if (!finalSenderType) {
      if (msg.role === 'user') finalSenderType = 'User';
      else if (msg.role === 'assistant' || msg.role === 'system') finalSenderType = 'AI';
      else if (msg.isBot === true) finalSenderType = 'AI';
      else if (msg.isBot === false) finalSenderType = 'User';
      else finalSenderType = 'AI'; // Fallback an toàn
  }

  // 2. Ép kiểu type
  let finalType = msg.type;
  if (!finalType) {
      if (finalSenderType === 'AI') {
          if (msg.content?.products) finalType = "product_selection";
          else if (msg.content?.orders) finalType = "order_selection";
          else if (msg.content?.qrCode) finalType = "payment_request";
          else finalType = "ai_response";
      } else {
          finalType = "text";
      }
  }

  // 3. Đảm bảo content luôn có text
  let finalContent = msg.content;
  if (typeof finalContent === 'string') {
      finalContent = { text: finalContent };
  } else if (!finalContent) {
      finalContent = { text: "" };
  }

  return {
      ...msg,
      senderType: finalSenderType,
      type: finalType,
      content: finalContent
  } as ChatMessage;
};

// ✅ 2. CÁC API CƠ BẢN
export const fetchChatConversations = async (filters?: { type?: string }): Promise<ChatConversation[]> => {
  try {
    const res = await api.get("/chat/conversations", { params: filters });
    return Array.isArray(res.data?.data?.conversations)
      ? res.data.data.conversations
      : [];
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return [];
  }
};

export const fetchChatHistory = async (
  conversationId: string,
  page: number = 1,
  limit: number = 30
) => {
  try {
    const res = await api.get(`/chat/history/${conversationId}`, {
      params: { page, limit },
    });

    const data = res.data?.data;
    let rawMessages: any[] = [];
    let totalMessages = 0;
    let currentPage = page;
    let totalPages = 1;

    if (data && typeof data === "object") {
      if (Array.isArray(data.messages)) {
        rawMessages = data.messages;
        totalMessages = data.totalMessages || rawMessages.length;
        currentPage = data.currentPage || page;
        totalPages = data.totalPages || 1;
      } else if (Array.isArray(data)) {
        rawMessages = data;
        totalMessages = rawMessages.length;
      }
    }

    // 🔥 Áp dụng chuẩn hóa cho từng tin nhắn
    const transformedMessages: ChatMessage[] = rawMessages.map(normalizeMessage);

    return {
      messages: transformedMessages,
      totalMessages,
      currentPage,
      totalPages,
    };
  } catch (err) {
    console.error("Error fetching history:", err);
    return { messages: [], totalMessages: 0, currentPage: 1, totalPages: 1 };
  }
};

export const postChatMessage = async (
  message: string,
  conversationId: string | null,
  latitude?: number,
  longitude?: number,
  type?: ChatMessage["type"],
  metadata?: any,
  displayText?: string,
  clientSideId?: string
): Promise<AiApiResponse> => {
  const payload = {
    message,
    displayText,
    conversationId,
    latitude,
    longitude,
    type,
    metadata,
    clientSideId,
  };
  const res = await api.post("/chat/message", payload);
  return res.data?.data;
};

export const uploadChatFile = async (
  file: File,
  conversationId: string | null
): Promise<AiApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (conversationId) {
    formData.append("conversationId", conversationId);
  }
  const res = await api.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
};

// ✅ 3. QUẢN LÝ CONVERSATION
export const fetchConversationById = async (id: string) => {
    try { const res = await api.get(`/chat/conversations/${id}`); return res.data?.data?.conversation || null; }
    catch (e) { return null; }
};
export const renameConversation = async (id: string, title: string) => {
    try { await api.patch(`/chat/conversations/${id}`, { title }); return true; } catch { return false; }
};
export const deleteConversation = async (id: string) => {
    try { await api.delete(`/chat/conversations/${id}`); return true; } catch { return false; }
};
export const createPrinterConversation = async (printerId: string) => {
  const res = await api.post(`/chat/conversations/printer/${printerId}`);
  return res.data;
};
export const createPeerConversation = async (userId: string) => {
  const res = await api.post(`/chat/conversations/peer/${userId}`);
  return res.data;
};

export interface CreateGroupParams {
  title: string;
  description?: string;
  members: string[];
  avatarFile?: File | null;
  context?: {
    referenceId: string;
    referenceType: "ORDER" | "DESIGN" | "PRODUCT" | "NONE";
    metadata?: any;
  };
}

export const createGroupConversation = async (params: CreateGroupParams) => {
  const formData = new FormData();

  formData.append("title", params.title);
  if (params.description) formData.append("description", params.description);
  formData.append("members", JSON.stringify(params.members));
  if (params.context) {
    formData.append("context", JSON.stringify(params.context));
  }
  if (params.avatarFile) {
    formData.append("avatar", params.avatarFile);
  }

  const res = await api.post("/chat/conversations/group", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const muteConversation = async (
  conversationId: string,
  isMuted: boolean
): Promise<boolean> => {
  try {
    await api.patch(`/chat/conversations/${conversationId}/mute`, {
      isMuted,
    });
    return true;
  } catch (err) {
    console.error("Error muting conversation:", err);
    return false;
  }
};

export interface UpdateGroupParams {
  conversationId: string;
  title?: string;
  avatarFile?: File | null;
  membersToRemove?: string[];
  membersToAdd?: string[];
}

export const updateGroupConversation = async (params: UpdateGroupParams) => {
  const formData = new FormData();

  if (params.title) formData.append("title", params.title);
  if (params.membersToRemove && params.membersToRemove.length > 0) {
    formData.append("membersToRemove", JSON.stringify(params.membersToRemove));
  }
  if (params.membersToAdd && params.membersToAdd.length > 0) {
    formData.append("membersToAdd", JSON.stringify(params.membersToAdd));
  }
  if (params.avatarFile) {
    formData.append("avatar", params.avatarFile);
  }

  const res = await api.patch(
    `/chat/conversations/group/${params.conversationId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

// ✅ 4. R2 & FILES
export const getR2UploadUrl = async (fileName: string, fileType: string) => {
  const res = await api.post("/chat/r2/upload-url", { fileName, fileType });
  return res.data?.data;
};

export const uploadToR2 = async (
  fileKey: string,
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileKey", fileKey);

  const res = await api.post("/chat/r2/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  
  return res.data?.data;
};

// ✅ 5. UTILS KHÁC
export const postSocialChatMessage = async (
  message: string,
  conversationId: string,
  attachments?: any[]
): Promise<ChatMessage> => {
  const payload = {
    message,
    conversationId,
    attachments,
  };

  const res = await api.post("/chat/message", payload);
  return res.data?.data;
};

export const searchMessages = async (
  conversationId: string,
  query: string
): Promise<any[]> => {
  try {
    const res = await api.get(`/chat/conversations/${conversationId}/search`, {
      params: { q: query },
    });
    return res.data?.data?.messages || [];
  } catch (err) {
    console.error("Error searching messages:", err);
    return [];
  }
};

export const getConversationBusinessContext = async (conversationId: string) => {
  try {
    const res = await api.get(`/chat/conversations/${conversationId}/business-context`);
    return res.data?.data || { activeOrders: [], designFiles: [] };
  } catch (error) {
    console.warn("Failed to fetch business context, using fallback", error);
    return {
      activeOrders: [],
      designFiles: []
    };
  }
};

export const getConversationMedia = async (conversationId: string) => {
  const res = await api.get(`/chat/conversations/${conversationId}/media`);
  return res.data?.data?.media || [];
};

export const getConversationFiles = async (conversationId: string) => {
  const res = await api.get(`/chat/conversations/${conversationId}/files`);
  return res.data?.data?.files || [];
};

export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
  const res = await api.get(`/orders/${orderId}`);
  const order =
    res.data?.data?.order ||
    res.data?.order ||
    res.data?.data ||
    res.data;

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  return order as Order;
};

// ========================================================
// 🔥 FIX QUAN TRỌNG: KHÔNG ĐẢO NGƯỢC MẢNG TIN NHẮN
// ========================================================
export const fetchChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    if (!conversationId || conversationId.startsWith("temp")) return [];
    try {
      const { messages } = await fetchChatHistory(conversationId, 1, 50);
      // ✅ ĐÃ XÓA: .reverse() - UI đã tự xử lý sort
      return messages;
    } catch (err) {
      console.error("[API] Error fetching chat messages:", err);
      return [];
    }
};