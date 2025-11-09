// src/modules/chat/chat.tools.service.js (✅ NÂNG CẤP - SỬ DỤNG PRICING UTIL)
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { ProductRepository } from "../products/product.repository.js";
import { OrderRepository } from "../orders/order.repository.js";
import { NotFoundException } from "../../shared/exceptions/index.js";
// ✅ ĐÍCH 2: Import hàm pricing-util dùng chung
import { findBestPriceTier } from "../../shared/utils/pricing.util.js";

// (vasMap giữ nguyên)
const vasMap = {
  designer: [
    { name: "Mockup 3D preview", price: 50000 },
    { name: "File nguồn AI/PSD", price: 100000 },
    { name: "Tư vấn màu sắc miễn phí", price: 0 },
  ],
  business_owner: [
    { name: "Giao hỏa tốc 2h", price: 150000 },
    { name: "Đóng gói cao cấp (hộp cứng)", price: 80000 },
  ],
  customer: [
    { name: "Bảo hành 1 năm (1 đổi 1)", price: 30000 },
    { name: "Giao miễn phí (cho đơn > 500k)", price: 0 },
  ],
};

export class ChatToolService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.orderRepository = new OrderRepository();
  }

  /**
   * (getToolDefinitions giữ nguyên)
   */
  getToolDefinitions() {
    return [
      {
        type: "function",
        function: {
          name: "find_products",
          description:
            "Tìm kiếm sản phẩm trong cửa hàng dựa trên từ khóa và gợi ý (ví dụ: 'áo thun', 'card visit').",
          parameters: {
            type: "object",
            properties: {
              search_query: {
                type: "string",
                description:
                  "Từ khóa tìm kiếm (ví dụ: 'áo', 'nón', 'logo công ty')",
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
          description:
            "Lấy 5 đơn hàng gần đây nhất của user. Dùng khi user hỏi 'đơn hàng của tôi', 'đặt lại đơn cũ'.",
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
          name: "reorder_from_template",
          description:
            "Tạo một bản tóm tắt ĐƠN HÀNG NHÁP (template) dựa trên ID của một đơn hàng cũ. Dùng khi user đã CHỈ ĐỊNH rõ một đơn hàng cũ.",
          parameters: {
            type: "object",
            properties: {
              order_id: {
                type: "string",
                description: "ID (MongoDB) của đơn hàng cũ cần đặt lại.",
              },
              new_quantity: {
                type: "number",
                description:
                  "Số lượng MỚI. Nếu không cung cấp, dùng số lượng cũ.",
              },
            },
            required: ["order_id"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "suggest_value_added_services",
          description:
            "Đề xuất các dịch vụ giá trị gia tăng (VAS) phù hợp dựa trên vai trò của người dùng (designer, business_owner, customer).",
          parameters: {
            type: "object",
            properties: {
              role: {
                type: "string",
                enum: ["designer", "business_owner", "customer"],
                description: "Vai trò của người dùng từ context.",
              },
            },
            required: ["role"],
          },
        },
      },
    ];
  }

  /**
   * (executeTool giữ nguyên)
   */
  async executeTool(toolCall, context) {
    const toolName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    Logger.info(`[ChatToolSvc] Executing tool: ${toolName}`, args);

    let response;
    let isTerminal = false;

    try {
      switch (toolName) {
        case "find_products":
          response = await this._find_products(args, context);
          break;
        case "get_recent_orders":
          response = await this._get_recent_orders(args, context);
          isTerminal = true;
          break;
        case "reorder_from_template":
          response = await this._reorder_from_template(args, context);
          break;
        case "suggest_value_added_services":
          response = await this._suggest_value_added_services(args, context);
          break;
        default:
          Logger.warn(`[ChatToolSvc] Unknown tool: ${toolName}`);
          response = ChatResponseUtil.createToolResponse(
            toolName,
            "Lỗi: Tool không tồn tại."
          );
      }
    } catch (error) {
      Logger.error(`[ChatToolSvc] Error executing tool ${toolName}:`, error);
      response = ChatResponseUtil.createToolResponse(
        toolName,
        `Lỗi thực thi tool: ${error.message}`
      );
    }

    return { response, isTerminal };
  }

  // --- LOGIC THỰC THI CÁC TOOL ---

  /**
   * (Tool _find_products giữ nguyên)
   */
  async _find_products(args, context) {
    const { search_query } = args;
    try {
      const products = await this.productRepository.search(
        { name: search_query, status: "published" },
        1,
        5
      );
      const simplifiedProducts = products.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.pricing[0]?.pricePerUnit || "N/A",
        minQuantity: p.pricing[0]?.minQuantity || 1,
      }));
      const jsonResult = JSON.stringify(simplifiedProducts);
      return ChatResponseUtil.createToolResponse(
        "find_products",
        `Kết quả tìm kiếm cho "${search_query}": ${jsonResult}`
      );
    } catch (error) {
      return ChatResponseUtil.createToolResponse(
        "find_products",
        `Lỗi khi tìm sản phẩm: ${error.message}`
      );
    }
  }

  /**
   * (Tool _get_recent_orders giữ nguyên)
   */
  async _get_recent_orders(args, context) {
    if (context.actorType === "Guest") {
      return ChatResponseUtil.createNeedsAuthResponse(
        "Vui lòng đăng nhập để xem đơn hàng."
      );
    }
    const orders = await this.orderRepository.findByCustomerId(
      context.actorId,
      { limit: 5, sort: "-createdAt" }
    );
    if (!orders || orders.length === 0) {
      return ChatResponseUtil.createTextResponse("Bạn chưa có đơn hàng nào.");
    }
    return ChatResponseUtil.createOrderCarouselResponse(orders);
  }

  /**
   * ✅ Tool (Goal 2): Nâng cấp với TÍNH GIÁ BẬC THANG CHÍNH XÁC
   */
  async _reorder_from_template(args, context) {
    const { order_id, new_quantity } = args;
    if (context.actorType === "Guest") {
      return ChatResponseUtil.createNeedsAuthResponse(
        "Vui lòng đăng nhập để đặt lại đơn."
      );
    }
    // 1. Lấy đơn hàng cũ
    const oldOrder = await this.orderRepository.findById(order_id);
    if (!oldOrder || oldOrder.customerId.toString() !== context.actorId) {
      throw new NotFoundException("Không tìm thấy đơn hàng cũ.");
    }

    // 2. Lấy sản phẩm (để check giá MỚI)
    // (Giả sử 1 đơn hàng cũ chỉ có 1 item, theo logic reorder)
    const oldItem = oldOrder.items[0];
    const product = await this.productRepository.findById(oldItem.productId);
    if (!product || product.status !== "published") {
      throw new Error(`Sản phẩm "${oldItem.productName}" không còn tồn tại.`);
    }

    // 3. Tính toán (ĐÃ NÂNG CẤP)
    const quantity = new_quantity || oldItem.quantity;

    // ✅ ĐÍCH 2: SỬ DỤNG HÀM TỪ UTIL DÙNG CHUNG
    const priceTier = findBestPriceTier(product.pricing, quantity);

    if (!priceTier) {
      throw new Error(
        `Sản phẩm "${product.name}" không có bậc giá hợp lệ cho số lượng ${quantity}.`
      );
    }

    const pricePerUnit = priceTier.pricePerUnit; // <-- Giá chính xác 100%
    const estimatedPrice = quantity * pricePerUnit;

    const summary = {
      productName: product.name,
      oldQuantity: oldItem.quantity,
      newQuantity: quantity,
      estimatedPrice: estimatedPrice,
      // Gửi lại thông tin sản phẩm và số lượng
      // để AI có thể gọi tool "add_to_cart" sau khi user xác nhận
      payload: {
        productId: product._id,
        quantity: quantity,
        pricePerUnit: pricePerUnit, // Gửi giá đã được xác thực
        customization: oldItem.customization,
      },
    };

    // Trả về JSON tóm tắt cho AI (để AI xác nhận với user)
    return ChatResponseUtil.createToolResponse(
      "reorder_from_template",
      `Đã tạo tóm tắt đơn hàng nháp: ${JSON.stringify(summary)}`
    );
  }

  /**
   * (Tool _suggest_value_added_services giữ nguyên)
   */
  async _suggest_value_added_services(args, context) {
    const { role } = args;
    const suggestions = vasMap[role] || vasMap.customer;

    const formattedSuggestions = suggestions.map(
      (s) => `${s.name} (+${s.price.toLocaleString("vi-VN")}đ)`
    );

    const resultText = `Dựa trên vai trò '${role}', đây là các gợi ý VAS: ${formattedSuggestions.join(
      ", "
    )}`;

    return ChatResponseUtil.createToolResponse(
      "suggest_value_added_services",
      resultText
    );
  }
}
