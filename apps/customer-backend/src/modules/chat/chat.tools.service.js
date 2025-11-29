// apps/admin-backend/src/features/chat/services/chat.tools.service.js
import { tool } from "ai";
import { z } from "zod";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { OrderRepository } from "../orders/order.repository.js";
import { embeddingService } from "../../shared/services/embedding.service.js";
import { algoliaService } from "../../infrastructure/search/algolia.service.js";
import { Product } from "../../shared/models/product.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { getUrlPreviewQueue } from "../../infrastructure/queue/url-preview.queue.js";
// import { socketService } from "../../infrastructure/realtime/pusher.service.js"; // Có thể bỏ import này nếu không dùng ở nơi khác trong file

const VAS_MAP = {
  designer: [
    { name: "Mockup 3D preview", price: 50000 },
    { name: "File nguồn AI/PSD", price: 100000 },
  ],
  business_owner: [
    { name: "Giao hỏa tốc 2h", price: 150000 },
    { name: "Đóng gói cao cấp", price: 80000 },
  ],
  customer: [
    { name: "Bảo hành 1 năm", price: 30000 },
    { name: "Giao miễn phí", price: 0 },
  ],
};

export class ChatToolService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  getToolDefinitions() {
    // ✅ Return OpenAI function calling format
    return [
      {
        type: "function",
        function: {
          name: "find_printers",
          description: "Tìm kiếm nhà in, tiệm in theo tên hoặc địa điểm.",
          parameters: {
            type: "object",
            properties: {
              search_query: {
                type: "string",
                description: "Từ khóa tìm kiếm (tên nhà in, địa điểm...)",
              },
            },
            required: ["search_query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "find_products",
          description:
            "Tìm kiếm sản phẩm in ấn (áo thun, card visit, tờ rơi, banner...).",
          parameters: {
            type: "object",
            properties: {
              search_query: {
                type: "string",
                description: "Tên sản phẩm cần tìm",
              },
            },
            required: ["search_query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_recent_orders",
          description: "Lấy danh sách đơn hàng gần đây của user.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "browse_page",
          description:
            "Truy cập link, chụp ảnh website và phân tích thiết kế từ URL (dùng cho Canva, Web design...).",
          parameters: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "Đường link cần phân tích",
              },
            },
            required: ["url"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "suggest_value_added_services",
          description: "Gợi ý dịch vụ gia tăng (VAS) cho khách hàng.",
          parameters: {
            type: "object",
            properties: {
              role: {
                type: "string",
                enum: ["designer", "business_owner", "customer"],
                description: "Vai trò của khách hàng",
              },
            },
            required: ["role"],
          },
        },
      },
    ];
  }

  // Hàm này không còn dùng nữa, có thể xóa hoặc để đó cũng vô hại
  // _emitThinking(userId, data) { ... }

  async executeTool(toolCall, context) {
    const toolName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    Logger.info(`[ChatToolService] Executing tool: ${toolName}`, args);

    try {
      let result;
      switch (toolName) {
        case "find_printers":
          result = await this._find_printers(args, context);
          break;
        case "find_products":
          result = await this._find_products(args);
          break;
        case "get_recent_orders":
          result = await this._get_recent_orders(context);
          break;
        case "browse_page":
          result = await this._browse_page(args, context);
          break;
        case "suggest_value_added_services":
          result = await this._suggest_value_added_services(args);
          break;
        default:
          result = `Tool "${toolName}" không tồn tại.`;
      }

      const isTerminal =
        typeof result === "object" &&
        ["product_selection", "printer_selection", "order_selection"].includes(
          result.type
        );

      return {
        response: result,
        isTerminal,
      };
    } catch (error) {
      Logger.error(`[ChatToolService] Tool execution failed:`, error);
      return {
        response: `Lỗi khi thực thi tool: ${error.message}`,
        isTerminal: false,
      };
    }
  }

  getVercelTools(context, services = {}) {
    const { chatRepository } = services;

    return {
      browse_page: tool({
        description:
          "Truy cập link, chụp ảnh website và phân tích thiết kế từ URL (dùng cho Canva, Web design...). Chỉ gọi tool này và đợi kết quả, không tự trả lời.",
        parameters: z.object({
          url: z.string().url().describe("Đường link cần phân tích"),
        }),
        execute: async ({ url }) => {
          const queue = await getUrlPreviewQueue();
          if (!queue) {
            return JSON.stringify({
              type: "error",
              message:
                "Hệ thống đang bận, không thể kết nối dịch vụ phân tích.",
            });
          }

          const conversationIdStr =
            typeof context.conversationId === "string"
              ? context.conversationId
              : String(context.conversationId || "");

          if (!conversationIdStr) {
            return JSON.stringify({
              type: "error",
              message: "Missing conversation ID",
            });
          }

          const userId = context.actorId?.toString();

          try {
            // ❌ ĐÃ XÓA: Logic gửi socket thinking (this._emitThinking)

            // 1. Thêm vào hàng đợi xử lý ngầm (Worker sẽ tiếp quản từ đây)
            await queue.add("url-preview", {
              url,
              conversationId: conversationIdStr,
              userId,
            });

            // 2. Trả về JSON status để Frontend ẩn đi
            return JSON.stringify({
              type: "HIDDEN_PROCESSING",
              status: "async_job_started",
              message: "Job sent to worker",
            });
          } catch (error) {
            Logger.error(
              `[ChatToolService] browse_page failed:`,
              error.message
            );
            // ❌ ĐÃ XÓA: Logic gửi socket báo lỗi thinking
            return JSON.stringify({
              type: "error",
              message: `Lỗi: ${error.message}`,
            });
          }
        },
      }),

      find_products: tool({
        description:
          "Tìm kiếm sản phẩm in ấn (áo thun, card visit, tờ rơi...).",
        parameters: z.object({
          search_query: z.string().describe("Tên sản phẩm cần tìm"),
        }),
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
        parameters: z.object({
          role: z.enum(["designer", "business_owner", "customer"]),
        }),
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
        const products = hits.map((h) => ({
          _id: h.objectID,
          name: h.name,
          pricing: [{ pricePerUnit: h.price }],
          images: [{ url: h.image }],
          category: h.category,
          printerProfileId: null,
        }));
        return ChatResponseUtil.createProductResponse(products, search_query);
      }
    } catch (e) {
      Logger.error("[ChatToolSvc] Algolia search failed", e);
    }

    if (embeddingService.isAvailable()) {
      try {
        const queryVector = await embeddingService.generateEmbedding(
          search_query
        );
        const vectorResults = await Product.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 50,
              limit: 5,
              filter: { isActive: { $ne: false } },
            },
          },
        ]);
        if (vectorResults.length > 0)
          return ChatResponseUtil.createProductResponse(
            this._formatProducts(vectorResults),
            search_query
          );
      } catch (e) {}
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: search_query, $options: "i" } },
        { category: { $regex: search_query, $options: "i" } },
      ],
      isActive: true,
    })
      .limit(5)
      .lean();

    if (products.length === 0) {
      const popular = await Product.find({ isActive: true })
        .sort({ views: -1 })
        .limit(3)
        .lean();
      return {
        type: "product_selection",
        content: {
          text: `Không tìm thấy "${search_query}". Dưới đây là các sản phẩm phổ biến:`,
          products: this._formatProducts(popular),
          isNoResults: true,
          originalQuery: search_query,
        },
      };
    }
    return ChatResponseUtil.createProductResponse(
      this._formatProducts(products),
      search_query
    );
  }

  _formatProducts(products) {
    return products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      pricing: p.pricing || [],
      images: p.images || [],
      printerId: p.printerProfileId?.toString() || "",
      category: p.category || "",
    }));
  }

  async _find_printers({ search_query }, context) {
    const regex = new RegExp(search_query, "i");
    let printers = await PrinterProfile.find({
      $or: [
        { businessName: regex },
        { "shopAddress.city": regex },
        { specialties: regex },
      ],
      isActive: true,
      isVerified: true,
    })
      .sort({ rating: -1 })
      .limit(5)
      .lean();

    if (printers.length === 0) {
      printers = await PrinterProfile.find({ isActive: true, isVerified: true })
        .sort({ rating: -1 })
        .limit(3)
        .lean();
      return {
        type: "printer_selection",
        content: {
          text: `Không tìm thấy nhà in "${search_query}". Gợi ý các nhà in uy tín:`,
          printers: printers,
          isNoResults: true,
          originalQuery: search_query,
        },
      };
    }
    return ChatResponseUtil.createPrinterResponse(printers, search_query);
  }

  async _get_recent_orders(context) {
    if (context.actorType === "Guest")
      return "Vui lòng đăng nhập để xem đơn hàng.";
    const orders = await this.orderRepository.findByCustomerId(
      context.actorId,
      { limit: 5, sort: "-createdAt" }
    );
    const formattedOrders = orders.map((o) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      status: o.masterStatus,
      total: o.totalAmount,
      items: o.printerOrders?.[0]?.items || [],
    }));
    return {
      type: "order_selection",
      content: { orders: formattedOrders },
      isTerminal: true,
    };
  }

  async _suggest_value_added_services({ role }) {
    const suggestions = VAS_MAP[role] || VAS_MAP.customer;
    return `Gợi ý dịch vụ: ${suggestions.map((s) => s.name).join(", ")}`;
  }

  async _browse_page({ url }, context) {
    const queue = await getUrlPreviewQueue();
    if (!queue) {
      return {
        type: "error",
        content: {
          text: "Hệ thống đang bận, không thể kết nối dịch vụ phân tích.",
        },
      };
    }

    const conversationIdStr =
      typeof context.conversationId === "string"
        ? context.conversationId
        : String(context.conversationId || "");

    if (!conversationIdStr) {
      return {
        type: "error",
        content: { text: "Missing conversation ID" },
      };
    }

    const userId = context.actorId?.toString();

    try {
      await queue.add("url-preview", {
        url,
        conversationId: conversationIdStr,
        userId,
      });

      return {
        type: "HIDDEN_PROCESSING",
        content: {
          text: "Đang phân tích link...",
          status: "async_job_started",
        },
      };
    } catch (error) {
      Logger.error(`[ChatToolService] browse_page failed:`, error.message);
      return {
        type: "error",
        content: { text: `Lỗi: ${error.message}` },
      };
    }
  }
}
