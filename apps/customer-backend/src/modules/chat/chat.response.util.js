export class ChatResponseUtil {
  static createTextResponse(text, withDefaults = false) {
    return {
      type: "text",
      content: { text },
      quickReplies: withDefaults ? this.getDefaultQuickReplies() : [],
    };
  }

  static createProductResponse(products, query) {
    if (!products?.length) return this.createTextResponse(`Không tìm thấy sản phẩm nào cho "${query}".`);
    return {
      type: "product_selection",
      content: {
        text: `Tìm thấy ${products.length} sản phẩm phù hợp:`,
        products: products.slice(0, 5),
      },
    };
  }

  static createPrinterResponse(printers, query) {
    if (!printers?.length) return this.createTextResponse(`Không tìm thấy nhà in nào cho "${query}".`);
    return {
      type: "printer_selection",
      content: {
        text: `Tìm thấy ${printers.length} nhà in:`,
        printers: printers.slice(0, 5),
      },
    };
  }

  static createToolResponse(toolName, message) {
    return {
      type: "text", // Trả về text để hiển thị log nếu cần
      content: { text: message || `Đã chạy xong ${toolName}` }
    };
  }

  static getDefaultQuickReplies() {
    return [
      { text: "Tìm card visit", payload: "tìm card visit" },
      { text: "Đơn hàng gần đây", payload: "xem đơn hàng của tôi" },
      { text: "Tìm nhà in gần đây", payload: "tìm nhà in gần đây" },
    ];
  }

  // Helper quan trọng: Format lịch sử chat cho OpenAI
  static prepareHistoryForOpenAI(history = []) {
    if (!Array.isArray(history)) return [];

    return history
      .slice(-10) // Lấy 10 tin gần nhất
      .map(msg => {
        if (!msg || !msg.content) return null;
        
        const role = msg.senderType === "AI" ? "assistant" : "user";
        let content = "";

        // Xử lý các loại tin nhắn đặc biệt thành text mô tả cho AI hiểu
        if (msg.type === "product_selection") {
            content = `[System: Đã hiển thị danh sách sản phẩm cho user]`;
        } else if (msg.type === "image" || msg.content.fileUrl) {
            content = `[User gửi ảnh/file]`;
        } else if (typeof msg.content === "string") {
            content = msg.content;
        } else if (msg.content.text) {
            content = msg.content.text;
        }

        if (!content) return null;
        return { role, content };
      })
      .filter(Boolean); // Lọc bỏ null
  }
}