// src/modules/chat/chat.tools.service.js (✅ UPDATED - TOOL DESCRIPTION)
import { ProductRepository } from "../products/product.repository.js";
import { OrderRepository } from "../orders/order.repository.js";
import { ChatRepository } from "./chat.repository.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { Logger } from "../../shared/utils/index.js";

/**
 * 🔥 ĐịNH NGHĨA CÁC CÔNG CỤ MÀ AI CÓ THỂ SỮ DỤNG
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
      // ✅ SỬA LỖI: Làm rõ mô tả, bỏ chữ "đặt lại"
      description:
        "Lấy lịch sử đơn hàng gần đây của người dùng. Dùng khi người dùng yêu cầu 'xem lại đơn hàng', 'đơn hàng cũ của tôi' hoặc 'tôi đã mua gì'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "reorder_from_template",
      description:
        "🎯 [MỤC TIÊU 2: GIẢM MA SÁT] Tạo đơn hàng nhanh dựa trên thông tin đơn hàng cũ (reorder). Dùng khi user nói 'đặt lại giống lần trước' hoặc 'in lại'.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "ID của đơn hàng cũ cần sao chép.",
          },
          quantity: {
            type: "number",
            description: "Số lượng mới (nếu khác đơn cũ).",
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
        "🧠 [MỤC TIÊU 3: LỢI NHUẬN TỪ NGỮ CẢNH] Đề xuất dịch vụ giá trị gia tăng (VAS) dựa trên vai trò user và ngữ cảnh. Ví dụ: mockup 3D, giao hỏa tốc, thiết kế miễn phí.",
      parameters: {
        type: "object",
        properties: {
          user_role: {
            type: "string",
            description:
              "Vai trò của user (designer, business_owner, customer).",
          },
          product_type: {
            type: "string",
            description: "Loại sản phẩm đang quan tâm.",
          },
        },
        required: ["user_role"],
      },
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
   * @param {object} context - Ngữ cảnh (actorId, actorType, user, latitude, longitude)
   * @returns {object} { response: (Payload cho AI hoặc Frontend), isTerminal: (bool) }
   */
  async executeTool(toolCall, context) {
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);

    // 🔥 SỬA LỖI: Đọc context object đã được chuẩn hóa
    const { actorId, actorType, latitude, longitude } = context;

    Logger.debug(`[ChatToolSvc] Executing tool: ${functionName}`, functionArgs);
    Logger.debug(
      `[ChatToolSvc] Context: actorId=${actorId}, actorType=${actorType}`
    );

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
          // ✅ LỖI ĐÃ ĐƯỢC SỬA: actorType và actorId giờ đã đúng
          if (actorType === "Guest" || !actorId) {
            return {
              response: ChatResponseUtil.createGuestRedirectResponse(
                "Vui lòng đăng nhập để xem đơn hàng."
              ),
              isTerminal: true,
            };
          }
          const orders = await this.orderRepository.findByCustomerId(actorId);
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

        // --- 🎯 CÔNG CỤ 4: REORDER NHANH (MỤC TIÊU 2) ---
        case "reorder_from_template":
          // ✅ LỖI ĐÃ ĐƯỢC SỬA: actorType và actorId giờ đã đúng
          if (actorType === "Guest" || !actorId) {
            return {
              response: ChatResponseUtil.createGuestRedirectResponse(
                "Vui lòng đăng nhập để đặt lại đơn hàng."
              ),
              isTerminal: true,
            };
          }

          const oldOrder = await this.orderRepository.findById(
            functionArgs.order_id
          );

          if (!oldOrder) {
            return {
              response: ChatResponseUtil.createTextResponse(
                "Không tìm thấy đơn hàng này. Vui lòng kiểm tra lại.",
                false
              ),
              isTerminal: true,
            };
          }

          // (Logic này có thể cần populate product, tạm thời giữ nguyên)
          const reorderTemplate = {
            productId: oldOrder.items[0]?.productId,
            productName: oldOrder.items[0]?.productName,
            oldQuantity: oldOrder.items[0]?.quantity,
            newQuantity: functionArgs.quantity || oldOrder.items[0]?.quantity,
            oldPrice: oldOrder.total,
            // (Cần logic tính giá mới chính xác hơn)
            estimatedNewPrice:
              (oldOrder.total / (oldOrder.items[0]?.quantity || 1)) *
              (functionArgs.quantity || oldOrder.items[0]?.quantity || 1),
          };

          return {
            response: {
              tool_call_id: toolCall.id,
              role: "tool",
              content: JSON.stringify({
                success: true,
                reorderTemplate: reorderTemplate,
                message: `Đã chuẩn bị thông tin đặt lại: ${reorderTemplate.productName}, SL: ${reorderTemplate.newQuantity}`,
              }),
            },
            isTerminal: false, // Trả lại AI để tổng hợp
          };

        // --- 🧠 CÔNG CỤ 5: GỢI Ý VAS (MỤC TIÊU 3) ---
        case "suggest_value_added_services":
          const userRole = functionArgs.user_role || "customer";
          const productType = functionArgs.product_type || "general";

          // Logic đơn giản: Map role -> VAS
          const vasMap = {
            designer: [
              "Mockup 3D preview (+50.000đ)",
              "File nguồn AI/PSD (+100.000đ)",
              "Tư vấn màu sắc miễn phí",
            ],
            business_owner: [
              "Giao hỏa tốc 2h (+150.000đ)",
              "Đóng gói cao cấp (+80.000đ)",
              "Thiết kế logo đơn giản miễn phí",
            ],
            customer: [
              "Bảo hành 1 năm (+30.000đ)",
              "Giao hàng miễn phí (đơn >500k)",
              "Tích điểm thành viên",
            ],
          };

          const suggestedVAS = vasMap[userRole] || vasMap.customer;

          return {
            response: {
              tool_call_id: toolCall.id,
              role: "tool",
              content: JSON.stringify({
                user_role: userRole,
                product_type: productType,
                suggested_services: suggestedVAS,
              }),
            },
            isTerminal: false, // Trả lại AI để chào hàng
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
