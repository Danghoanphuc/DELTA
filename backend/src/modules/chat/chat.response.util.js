// src/modules/chat/chat.response.util.js (NEW FILE)

/**
 * Lớp tiện ích tĩnh để tạo các phản hồi chat
 */
export class ChatResponseUtil {
  /**
   * Tạo response trả về Card Sản phẩm
   */
  static createProductResponse(products, searchTerm) {
    if (products.length === 0) {
      return {
        type: "text",
        content: {
          text: `Rất tiếc, tôi không tìm thấy sản phẩm nào với từ khóa "${searchTerm}".`,
        },
      };
    }
    return {
      type: "product_selection",
      content: {
        text: `Tôi tìm thấy ${products.length} sản phẩm cho "${searchTerm}":`,
        products: products.slice(0, 5),
      },
    };
  }

  /**
   * Tạo response trả về Card Đơn hàng
   */
  static createOrderResponse(orders) {
    if (orders.length === 0) {
      return {
        type: "text",
        content: { text: "Bạn chưa có đơn hàng nào." },
      };
    }
    return {
      type: "order_selection",
      content: {
        text: "Đây là các đơn hàng gần nhất của bạn:",
        orders: orders.slice(0, 3),
      },
    };
  }

  /**
   * Tạo response yêu cầu đăng nhập
   */
  static createGuestRedirectResponse(message) {
    return {
      type: "text",
      content: { text: message },
      quickReplies: [{ text: "Đăng nhập", payload: "redirect_login" }],
    };
  }

  /**
   * Lấy các quick replies mặc định
   */
  static getDefaultQuickReplies() {
    return [
      { text: "Tìm card visit", payload: "tìm card visit" },
      { text: "Xem đơn hàng cũ", payload: "xem đơn hàng của tôi" },
      { text: "Tìm nhà in gần đây", payload: "tìm nhà in áo thun gần đây" },
    ];
  }

  /**
   * Tạo một phản hồi văn bản đơn giản
   */
  static createTextResponse(text, withDefaultReplies = false) {
    return {
      type: "text",
      content: { text: text },
      quickReplies: withDefaultReplies ? this.getDefaultQuickReplies() : [],
    };
  }

  /**
   * Chuẩn bị lịch sử cho OpenAI
   */
  static prepareHistoryForOpenAI(history = []) {
    return history
      .slice(-10) // Lấy 10 tin nhắn gần nhất
      .map((msg) => ({
        role: msg.senderType === "AI" ? "assistant" : "user",
        content: msg.content && msg.content.text ? msg.content.text : "",
      }))
      .filter((msg) => msg.content); // Lọc ra các tin nhắn không có content
  }
}
