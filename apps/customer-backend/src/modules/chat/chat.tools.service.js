import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { productRepository } from "../products/product.repository.js";
import { OrderRepository } from "../orders/order.repository.js";
import { embeddingService } from "../../shared/services/embedding.service.js";
import { algoliaService } from "../../infrastructure/search/algolia.service.js"; // ✅ Import Algolia
import { Product } from "../../shared/models/product.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

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
    return [
      {
        type: "function",
        function: {
          name: "find_products",
          description: "Tìm kiếm sản phẩm in ấn (áo thun, card visit, tờ rơi...).",
          parameters: {
            type: "object",
            properties: {
              search_query: { type: "string", description: "Tên sản phẩm cần tìm" },
            },
            required: ["search_query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "find_printers",
          description: "Tìm kiếm nhà in, tiệm in theo tên hoặc địa điểm.",
          parameters: {
            type: "object",
            properties: {
              search_query: { type: "string", description: "Từ khóa (tên nhà in, địa điểm)" },
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
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "suggest_value_added_services",
          description: "Gợi ý dịch vụ gia tăng (VAS).",
          parameters: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["designer", "business_owner", "customer"] },
            },
            required: ["role"],
          },
        },
      },
    ];
  }

  async executeTool(toolCall, context) {
    const toolName = toolCall.function.name;
    let args = {};
    try { args = JSON.parse(toolCall.function.arguments); } catch (e) {}
    
    Logger.info(`[ChatToolSvc] 🔧 Executing: ${toolName}`, args);

    try {
      switch (toolName) {
        case "find_products":
          return await this._find_products(args);
        case "find_printers":
          return await this._find_printers(args, context);
        case "get_recent_orders":
          return await this._get_recent_orders(context); // Terminal action
        case "suggest_value_added_services":
          return await this._suggest_value_added_services(args);
        default:
          return "Tool không tồn tại.";
      }
    } catch (error) {
      Logger.error(`[ChatToolSvc] Error ${toolName}:`, error);
      return `Lỗi khi thực hiện ${toolName}: ${error.message}`;
    }
  }

  // --- IMPLEMENTATION ---

  async _find_products({ search_query }) {
    if (!search_query) return "Vui lòng cung cấp từ khóa tìm kiếm.";

    // ✅ 1. DÙNG ALGOLIA THAY CHO MONGO/VECTOR (Ưu tiên)
    try {
      const hits = await algoliaService.searchProducts(search_query);
      
      if (hits && hits.length > 0) {
        // Map lại cấu trúc dữ liệu từ Algolia về format chat cần
        const products = hits.map(h => ({
          _id: h.objectID, // Algolia dùng objectID thay vì _id
          name: h.name,
          pricing: [{ pricePerUnit: h.price }], // Giả lập cấu trúc pricing
          images: [{ url: h.image }],
          category: h.category,
          printerProfileId: null, // Algolia không lưu printerProfileId, có thể thêm sau
        }));
        
        return ChatResponseUtil.createProductResponse(products, search_query);
      }
    } catch (e) {
      Logger.error("[ChatToolSvc] Algolia search failed, fallback to MongoDB", e);
    }

    // ⬇️ 2. FALLBACK: Vector Search (nếu Algolia fail)
    if (embeddingService.isAvailable()) {
      try {
        const queryVector = await embeddingService.generateEmbedding(search_query);
        const vectorResults = await Product.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 50,
              limit: 5,
              filter: { isActive: { $ne: false } }
            }
          }
        ]);

        if (vectorResults.length > 0) {
          return ChatResponseUtil.createProductResponse(this._formatProducts(vectorResults), search_query);
        }
      } catch (e) { 
        Logger.warn("[ChatToolSvc] Vector search failed, falling back to regex", e); 
      }
    }

    // ⬇️ 3. FALLBACK: Regex Search (MongoDB)
    const products = await Product.find({
      $or: [
        { name: { $regex: search_query, $options: "i" } },
        { category: { $regex: search_query, $options: "i" } }
      ],
      isActive: true
    }).limit(5).lean();

    // Xử lý không tìm thấy -> Tìm sản phẩm phổ biến
    if (products.length === 0) {
       const popular = await Product.find({ isActive: true }).sort({ views: -1 }).limit(3).lean();
       return {
         type: "product_selection",
         content: {
           text: `Không tìm thấy "${search_query}". Dưới đây là các sản phẩm phổ biến:`,
           products: this._formatProducts(popular),
           isNoResults: true,
           originalQuery: search_query
         }
       };
    }

    return ChatResponseUtil.createProductResponse(this._formatProducts(products), search_query);
  }

  _formatProducts(products) {
    return products.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      pricing: p.pricing || [],
      images: p.images || [],
      printerId: p.printerProfileId?.toString() || "",
      category: p.category || ""
    }));
  }

  async _find_printers({ search_query }, context) {
    // Logic tìm nhà in (giữ nguyên logic query, bỏ log rườm rà)
    const regex = new RegExp(search_query, "i");
    let printers = await PrinterProfile.find({
      $or: [
        { businessName: regex },
        { "shopAddress.city": regex },
        { specialties: regex }
      ],
      isActive: true,
      isVerified: true
    }).sort({ rating: -1 }).limit(5).lean();

    if (printers.length === 0) {
      // Fallback: Top rated
      printers = await PrinterProfile.find({ isActive: true, isVerified: true })
        .sort({ rating: -1 }).limit(3).lean();
        
      return {
          type: "printer_selection",
          content: {
              text: `Không tìm thấy nhà in "${search_query}". Gợi ý các nhà in uy tín:`,
              printers: printers,
              isNoResults: true,
              originalQuery: search_query
          }
      };
    }

    return ChatResponseUtil.createPrinterResponse(printers, search_query);
  }

  async _get_recent_orders(context) {
    if (context.actorType === "Guest") return "Vui lòng đăng nhập để xem đơn hàng.";
    
    const orders = await this.orderRepository.findByCustomerId(context.actorId, { limit: 5, sort: "-createdAt" });
    
    // Transform nhẹ nhàng
    const formattedOrders = orders.map(o => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      status: o.masterStatus,
      total: o.totalAmount,
      items: o.printerOrders?.[0]?.items || []
    }));

    return { 
      type: "order_selection", 
      content: { orders: formattedOrders },
      isTerminal: true // Dừng flow AI, trả về UI luôn
    };
  }

  async _suggest_value_added_services({ role }) {
    const suggestions = VAS_MAP[role] || VAS_MAP.customer;
    return `Gợi ý dịch vụ: ${suggestions.map(s => s.name).join(", ")}`;
  }
}