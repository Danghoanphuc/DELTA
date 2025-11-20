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
   * ✅ FIX: Tạo response yêu cầu đăng nhập
   */
  static createNeedsAuthResponse(message) {
    return {
      type: "text",
      content: { text: message },
      quickReplies: [
        { text: "Đăng nhập", payload: "/signin" },
        { text: "Tìm sản phẩm", payload: "tìm card visit" },
      ],
    };
  }

  /**
   * ✅ FIX: Tạo response trả về Card Đơn hàng (carousel)
   */
  static createOrderCarouselResponse(orders) {
    if (!orders || orders.length === 0) {
      return {
        type: "text",
        content: { text: "Bạn chưa có đơn hàng nào." },
      };
    }
    return {
      type: "order_selection",
      content: {
        text: `Bạn có ${orders.length} đơn hàng gần đây:`,
        orders: orders.slice(0, 5),
      },
      quickReplies: [
        { text: "Đặt lại đơn này", payload: "/reorder" },
        { text: "Tìm sản phẩm khác", payload: "tìm card visit" },
      ],
    };
  }

  /**
   * ✅ FIX: Tạo response khi tool thực thi lỗi hoặc không tồn tại
   */
  static createToolResponse(toolName, message) {
    return {
      type: "text",
      content: {
        text: message || `Tool "${toolName}" đã được thực thi.`,
      },
      quickReplies: this.getDefaultQuickReplies(),
    };
  }

  /**
   * ✅ ZERO-EXIT PAYMENT: Tạo payment request message với QR code
   * @param {object} order - Master order object
   * @param {object} paymentData - PayOS payment link data
   * @returns {object} Payment request message
   */
  static createPaymentRequestResponse(order, paymentData) {
    // Calculate mini invoice details
    const allItems = order.printerOrders?.flatMap(po => po.items) || [];
    const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0);
    const itemsCount = allItems.length;
    
    // Generate product name summary
    let productName = "Sản phẩm";
    if (allItems.length > 0) {
      const firstProduct = allItems[0].productName;
      if (allItems.length === 1) {
        productName = firstProduct;
      } else {
        productName = `${firstProduct} + ${allItems.length - 1} sản phẩm khác`;
      }
    }

    return {
      type: "payment_request",
      content: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        description: `Thanh toán ${order.orderNumber}`,
        qrCode: paymentData.qrCode, // Raw QR string from PayOS
        checkoutUrl: paymentData.checkoutUrl, // Fallback link
        paymentLinkId: paymentData.paymentLinkId,
        status: "pending", // Initial status
        
        // ✅ NEW: Mini invoice context
        productName: productName,
        quantity: totalQuantity,
        itemsCount: itemsCount,
      },
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
