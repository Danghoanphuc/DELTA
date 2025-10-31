// src/modules/chat/chat.tools.service.js (NEW FILE)
import { ProductRepository } from "../products/product.repository.js";
import { OrderRepository } from "../orders/order.repository.js";
import { ChatRepository } from "./chat.repository.js";
import { ChatResponseUtil } from "./chat.response.util.js"; // Sẽ tạo ở bước 3
import { Logger } from "../../shared/utils/index.js";

/**
 * Định nghĩa các công cụ mà AI có thể sử dụng.
 */
const tools = [
  {
    type: "function",
    function: {
      name: "find_printers",
      description:
        "Tìm kiếm nhà in dựa trên tiêu chí, loại sản phẩm, và vị trí (nếu có).",
      parameters: {
        type: "object",
        properties: {
          product_type: {
            type: "string",
            description: "Loại sản phẩm, ví dụ: 't-shirt', 'business-card'.",
          },
          criteria: {
            type: "array",
            items: { type: "string" },
            description: "Tiêu chí: 'cheap', 'fast', 'nearby', 'quality'.",
          },
          location: {
            type: "string",
            description: "Địa điểm, ví dụ 'hà nội', 'thủ dầu một'.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_products",
      description:
        "Tìm kiếm sản phẩm trong cửa hàng (ví dụ: card visit, áo thun) dựa trên từ khóa.",
      parameters: {
        type: "object",
        properties: {
          search_term: {
            type: "string",
            description: "Từ khóa người dùng muốn tìm.",
          },
        },
        required: ["search_term"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_orders",
      description:
        "Lấy lịch sử đơn hàng gần đây của người dùng đã đăng nhập. Dùng khi người dùng yêu cầu 'xem lại đơn hàng' hoặc 'đặt lại'.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export class ChatToolService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.orderRepository = new OrderRepository();
    this.chatRepository = new ChatRepository();
  }

  /**
   * Trả về định nghĩa các công cụ
   */
  getToolDefinitions() {
    return tools;
  }

  /**
   * Thực thi một công cụ được AI yêu cầu
   * @param {object} toolCall - Object tool_call từ OpenAI
   * @param {object} context - Thông tin bổ sung (userId, isGuest, v.v.)
   * @returns {object} { response: (Payload cho AI hoặc Frontend), isTerminal: (bool) }
   */
  async executeTool(toolCall, context) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);
    const { userId, isGuest, latitude, longitude } = context;

    Logger.debug(`[ChatToolSvc] Executing tool: ${functionName}`, functionArgs);

    try {
      switch (functionName) {
        // --- CÔNG CỤ 1: TÌM SẢN PHẨM (Terminal) ---
        case "find_products":
          const products = await this.productRepository.findWithFilters({
            search: functionArgs.search_term || "sản phẩm",
            isActive: true,
          });
          return {
            response: ChatResponseUtil.createProductResponse(
              products,
              functionArgs.search_term
            ),
            isTerminal: true, // true: Trả về cho frontend, không gọi lại AI
          };

        // --- CÔNG CỤ 2: XEM ĐƠN HÀNG (Terminal) ---
        case "get_recent_orders":
          if (isGuest || !userId) {
            return {
              response: ChatResponseUtil.createGuestRedirectResponse(
                "Vui lòng đăng nhập để xem đơn hàng."
              ),
              isTerminal: true,
            };
          }
          const orders = await this.orderRepository.findByCustomerId(userId);
          return {
            response: ChatResponseUtil.createOrderResponse(orders),
            isTerminal: true,
          };

        // --- CÔNG CỤ 3: TÌM NHÀ IN (RAG) ---
        case "find_printers":
          const searchContext = {
            entities: {
              product_type: functionArgs.product_type || null,
              location: functionArgs.location || null,
              criteria: functionArgs.criteria || [],
            },
            coordinates: null,
          };
          if (
            functionArgs.criteria?.includes("nearby") &&
            latitude &&
            longitude
          ) {
            searchContext.coordinates = [
              parseFloat(longitude),
              parseFloat(latitude),
            ];
          }
          const printers = await this.chatRepository.findPrinters(
            searchContext
          );

          return {
            response: {
              // Đây là payload để gửi lại cho AI
              tool_call_id: toolCall.id,
              role: "tool",
              content: JSON.stringify({
                printers: printers,
                count: printers.length,
              }),
            },
            isTerminal: false, // false: Cần gọi lại AI với dữ liệu này
          };

        default:
          Logger.warn(
            `[ChatToolSvc] AI gọi công cụ không xác định: ${functionName}`
          );
          return this._createToolError(
            toolCall.id,
            `Công cụ ${functionName} không xác định.`
          );
      }
    } catch (execError) {
      Logger.error(
        `[ChatToolSvc] Lỗi thực thi công cụ ${functionName}:`,
        execError
      );
      return this._createToolError(toolCall.id, "Lỗi khi chạy công cụ.");
    }
  }

  /**
   * Helper tạo payload lỗi cho công cụ
   */
  _createToolError(toolCallId, errorMessage) {
    return {
      response: {
        tool_call_id: toolCallId,
        role: "tool",
        content: JSON.stringify({ error: errorMessage }),
      },
      isTerminal: false, // Báo cho AI biết là đã có lỗi
    };
  }
}
