// apps/admin-backend/src/features/chat/services/chat.tools.service.js
import { tool } from "ai";
import { z } from "zod";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { productRepository } from "../products/product.repository.js";
import { OrderRepository } from "../orders/order.repository.js";
import { embeddingService } from "../../shared/services/embedding.service.js";
import { algoliaService } from "../../infrastructure/search/algolia.service.js"; 
import { Product } from "../../shared/models/product.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { getUrlPreviewQueue } from "../../infrastructure/queue/url-preview.queue.js";
import { socketService } from "../../infrastructure/realtime/pusher.service.js";

const VAS_MAP = {
  designer: [{ name: "Mockup 3D preview", price: 50000 }, { name: "File nguồn AI/PSD", price: 100000 }],
  business_owner: [{ name: "Giao hỏa tốc 2h", price: 150000 }, { name: "Đóng gói cao cấp", price: 80000 }],
  customer: [{ name: "Bảo hành 1 năm", price: 30000 }, { name: "Giao miễn phí", price: 0 }]
};

export class ChatToolService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  getToolDefinitions() {
    return []; 
  }

  _emitThinking(userId, data) {
    if (!userId) return;
    try {
      socketService.emitFromWorker(userId.toString(), 'ai:thinking:update', data);
    } catch (err) {
      Logger.warn(`[ChatTool] Socket emit failed: ${err.message}`);
    }
  }

  getVercelTools(context, services = {}) {
    const { chatRepository } = services;

    return {
      browse_page: tool({
        description: "Truy cập link, chụp ảnh website và phân tích thiết kế từ URL (dùng cho Canva, Web design...). Chỉ gọi tool này và đợi kết quả, không tự trả lời.",
        parameters: z.object({
          url: z.string().url().describe("Đường link cần phân tích"),
        }),
        execute: async ({ url }) => {
          const queue = await getUrlPreviewQueue();
          if (!queue) {
            return JSON.stringify({ 
              type: 'error',
              message: 'Hệ thống đang bận, không thể kết nối dịch vụ phân tích.'
            });
          }

          const userId = context.actorId?.toString();
          const conversationIdStr = typeof context.conversationId === 'string' 
            ? context.conversationId 
            : String(context.conversationId || '');
          
          if (!conversationIdStr) {
            return JSON.stringify({ type: 'error', message: 'Missing conversation ID' });
          }

          try {
            // 1. Emit tín hiệu "Bắt đầu" ngay lập tức qua Socket
            this._emitThinking(userId, { 
              icon: '🔍', 
              text: `Đang chuẩn bị phân tích ${url}...`,
              progress: 5
            });

            // 2. Thêm vào hàng đợi xử lý ngầm (Worker sẽ tiếp quản từ đây)
            await queue.add('url-preview', {
              url,
              conversationId: conversationIdStr,
              userId,
            });
            
            // 3. QUAN TRỌNG: Trả về JSON status để Frontend ẩn đi, 
            // chặn Vercel AI tự bịa ra câu trả lời.
            return JSON.stringify({
              type: "HIDDEN_PROCESSING",
              status: "async_job_started",
              message: "Job sent to worker"
            });

          } catch (error) {
            Logger.error(`[ChatToolService] browse_page failed:`, error.message);
            this._emitThinking(userId, { type: 'thinking_done', icon: '❌', text: 'Có lỗi xảy ra' });
            return JSON.stringify({ type: 'error', message: `Lỗi: ${error.message}` });
          }
        },
      }),

      find_products: tool({
        description: "Tìm kiếm sản phẩm in ấn (áo thun, card visit, tờ rơi...).",
        parameters: z.object({ search_query: z.string().describe("Tên sản phẩm cần tìm") }),
        execute: async ({ search_query }) => {
          const result = await this._find_products({ search_query });
          return typeof result === "string" ? result : JSON.stringify(result);
        },
      }),

      find_printers: tool({
        description: "Tìm kiếm nhà in, tiệm in theo tên hoặc địa điểm.",
        parameters: z.object({ search_query: z.string().describe("Từ khóa") }),
        execute: async ({ search_query }) => {
          const result = await this._find_printers({ search_query }, context);
          return typeof result === "string" ? result : JSON.stringify(result);
        },
      }),

      get_recent_orders: tool({
        description: "Lấy danh sách đơn hàng gần đây của user.",
        parameters: z.object({}), 
        execute: async () => {
          const result = await this._get_recent_orders(context);
          return typeof result === "string" ? result : JSON.stringify(result);
        },
      }),

      suggest_value_added_services: tool({
        description: "Gợi ý dịch vụ gia tăng (VAS).",
        parameters: z.object({ role: z.enum(["designer", "business_owner", "customer"]) }),
        execute: async ({ role }) => {
          const result = await this._suggest_value_added_services({ role });
          return typeof result === "string" ? result : JSON.stringify(result);
        },
      }),
    };
  }

  // ... (Giữ nguyên các hàm private _find_products, _find_printers, _get_recent_orders...)
  async _find_products({ search_query }) {
    if (!search_query) return "Vui lòng cung cấp từ khóa tìm kiếm.";
    try {
      const hits = await algoliaService.searchProducts(search_query);
      if (hits && hits.length > 0) {
        const products = hits.map(h => ({
          _id: h.objectID, name: h.name, pricing: [{ pricePerUnit: h.price }],
          images: [{ url: h.image }], category: h.category, printerProfileId: null,
        }));
        return ChatResponseUtil.createProductResponse(products, search_query);
      }
    } catch (e) { Logger.error("[ChatToolSvc] Algolia search failed", e); }

    if (embeddingService.isAvailable()) {
      try {
        const queryVector = await embeddingService.generateEmbedding(search_query);
        const vectorResults = await Product.aggregate([
          { $vectorSearch: { index: "vector_index", path: "embedding", queryVector: queryVector, numCandidates: 50, limit: 5, filter: { isActive: { $ne: false } } } }
        ]);
        if (vectorResults.length > 0) return ChatResponseUtil.createProductResponse(this._formatProducts(vectorResults), search_query);
      } catch (e) {}
    }

    const products = await Product.find({
      $or: [{ name: { $regex: search_query, $options: "i" } }, { category: { $regex: search_query, $options: "i" } }],
      isActive: true
    }).limit(5).lean();

    if (products.length === 0) {
       const popular = await Product.find({ isActive: true }).sort({ views: -1 }).limit(3).lean();
       return { type: "product_selection", content: { text: `Không tìm thấy "${search_query}". Dưới đây là các sản phẩm phổ biến:`, products: this._formatProducts(popular), isNoResults: true, originalQuery: search_query } };
    }
    return ChatResponseUtil.createProductResponse(this._formatProducts(products), search_query);
  }

  _formatProducts(products) {
    return products.map(p => ({
      _id: p._id.toString(), name: p.name, pricing: p.pricing || [],
      images: p.images || [], printerId: p.printerProfileId?.toString() || "", category: p.category || ""
    }));
  }

  async _find_printers({ search_query }, context) {
    const regex = new RegExp(search_query, "i");
    let printers = await PrinterProfile.find({
      $or: [{ businessName: regex }, { "shopAddress.city": regex }, { specialties: regex }],
      isActive: true, isVerified: true
    }).sort({ rating: -1 }).limit(5).lean();

    if (printers.length === 0) {
      printers = await PrinterProfile.find({ isActive: true, isVerified: true }).sort({ rating: -1 }).limit(3).lean();
      return { type: "printer_selection", content: { text: `Không tìm thấy nhà in "${search_query}". Gợi ý các nhà in uy tín:`, printers: printers, isNoResults: true, originalQuery: search_query } };
    }
    return ChatResponseUtil.createPrinterResponse(printers, search_query);
  }

  async _get_recent_orders(context) {
    if (context.actorType === "Guest") return "Vui lòng đăng nhập để xem đơn hàng.";
    const orders = await this.orderRepository.findByCustomerId(context.actorId, { limit: 5, sort: "-createdAt" });
    const formattedOrders = orders.map(o => ({
      _id: o._id.toString(), orderNumber: o.orderNumber, status: o.masterStatus,
      total: o.totalAmount, items: o.printerOrders?.[0]?.items || []
    }));
    return { type: "order_selection", content: { orders: formattedOrders }, isTerminal: true };
  }

  async _suggest_value_added_services({ role }) {
    const suggestions = VAS_MAP[role] || VAS_MAP.customer;
    return `Gợi ý dịch vụ: ${suggestions.map(s => s.name).join(", ")}`;
  }
}