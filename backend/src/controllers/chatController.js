// backend/src/controllers/chatController.js (PHIÊN BẢN CUỐI CÙNG - HỖ TRỢ GEOJSON)

import { Conversation } from "../models/Conversation.js";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import OpenAI from "openai";

// --- CÁC HÀM CŨ (GIỮ NGUYÊN) ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const callOpenAI_API = async (message, printers = []) => {
  try {
    const printerContext =
      printers.length > 0
        ? `Đây là danh sách nhà in phù hợp đã tìm thấy: \n${JSON.stringify(
            printers,
            null,
            2
          )}`
        : "Không tìm thấy nhà in nào phù hợp với các tiêu chí này.";
    const systemPrompt = `Bạn là PrintZ Assistant - trợ lý AI cho nền tảng in ấn PrintZ.
VAI TRÒ:
- Phân tích nhu cầu in ấn của người dùng
- Gợi ý nhà in phù hợp theo khu vực và tiêu chí
- Tư vấn về sản phẩm, giá cả, thời gian sản xuất
${printerContext}
QUY TẮC PHẢN HỒI:
1. Luôn trả lời bằng tiếng Việt, thân thiện, nhiệt tình
2. Nếu ${printerContext} báo "Không tìm thấy nhà in nào", HÃY HỎI LẠI người dùng để làm rõ thông tin.
3. Nếu ${printerContext} CÓ danh sách nhà in, HÃY GIỚI THIỆU TÓM TẮT 1-2 nhà in tốt nhất từ danh sách đó.
4. KHÔNG tự bịa ra nhà in. Chỉ dùng thông tin trong ${printerContext}.
Hãy phân tích và phản hồi phù hợp!`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Lỗi gọi OpenAI API:", error);
    throw error;
  }
};
const analyzeMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  const entities = { product_type: null, location: null, criteria: [] };
  const productKeywords = {
    "áo thun": ["áo thun", "áo phông", "tshirt", "t-shirt"],
    "danh thiếp": ["danh thiếp", "card visit", "namecard"],
    cốc: ["cốc", "ly", "mug"],
    sticker: ["sticker", "decal", "hình dán"],
    banner: ["banner", "poster", "áp phích"],
    "túi giấy": ["túi giấy", "bao bì"],
  };
  for (const [product, keywords] of Object.entries(productKeywords)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      entities.product_type = product;
      break;
    }
  }
  const locations = [
    "thủ dầu một",
    "bình dương",
    "dĩ an",
    "thuận an",
    "tân uyên",
  ];
  for (const location of locations) {
    if (lowerMessage.includes(location)) {
      entities.location = location;
      break;
    }
  }
  if (lowerMessage.includes("rẻ") || lowerMessage.includes("giá tốt"))
    entities.criteria.push("cheap");
  if (lowerMessage.includes("nhanh") || lowerMessage.includes("gấp"))
    entities.criteria.push("fast");
  if (lowerMessage.includes("chất lượng") || lowerMessage.includes("tốt"))
    entities.criteria.push("quality");
  // Thêm 'gần'
  if (lowerMessage.includes("gần") || lowerMessage.includes("nearby")) {
    entities.criteria.push("nearby");
  }
  return entities;
};
const findOrCreateConversation = async (userId) => {
  let conversation = await Conversation.findOne({
    type: "customer-bot",
    "participants.userId": userId,
  });
  if (!conversation) {
    console.log(`Không tìm thấy conversation, tạo mới cho user ${userId}...`);
    conversation = await Conversation.create({
      type: "customer-bot",
      participants: [{ userId: userId, role: "customer" }],
      messages: [],
    });
  }
  return conversation;
};
// --- KẾT THÚC CÁC HÀM CŨ ---

// *** HÀM FINDPRINTERS (ĐÃ NÂNG CẤP GEOJSON) ***
const findPrinters = async (searchContext) => {
  try {
    const { entities, coordinates } = searchContext;
    console.log("Đang tìm nhà in thật với context:", searchContext);

    let printers = [];

    // --- KỊCH BẢN 1: TÌM KIẾM "GẦN TÔI" (Ưu tiên) ---
    // Nếu user muốn "gần" (nearby) VÀ đã cung cấp tọa độ
    if (entities.criteria.includes("nearby") && coordinates) {
      console.log("...Đang chạy truy vấn GEO $nearSphere (GẦN TÔI)...");

      // 1. Xây dựng điều kiện lọc cơ bản (filter)
      let geoFilter = {
        role: "printer",
        isActive: true,
      };

      // Lọc theo SẢN PHẨM (nếu có)
      if (entities.product_type) {
        geoFilter.specialties = { $in: [entities.product_type] };
      }
      // Lọc theo GIÁ (nếu có)
      if (entities.criteria.includes("cheap")) {
        geoFilter.priceTier = "cheap";
      }
      // Lọc theo TỐC ĐỘ (nếu có)
      if (entities.criteria.includes("fast")) {
        geoFilter.productionSpeed = "fast";
      }

      // 2. Thực thi truy vấn $nearSphere
      // Nó sẽ tự động sắp xếp từ gần đến xa
      printers = await User.find({
        "address.location": {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: coordinates, // [long, lat]
            },
            $maxDistance: 10000, // Tối đa 10km (10,000 mét)
          },
        },
        ...geoFilter, // Áp dụng các bộ lọc (sản phẩm, giá, tốc độ)
      })
        .limit(5)
        .select(
          "displayName rating address specialties priceTier productionSpeed"
        );
    } else {
      // --- KỊCH BẢN 2: TÌM KIẾM THEO TÊN (Giống hệt code cũ) ---
      // Nếu user không tìm "gần", hoặc không cung cấp tọa độ
      console.log("...Đang chạy truy vấn $text (THEO TÊN ĐỊA ĐIỂM)...");

      let queryConditions = [{ role: "printer" }, { isActive: true }];

      // Lọc SẢN PHẨM
      if (entities.product_type) {
        queryConditions.push({ specialties: { $in: [entities.product_type] } });
      }

      // Lọc ĐỊA ĐIỂM (bằng $text) - Chỉ lọc nếu user KHÔNG đòi "gần"
      if (entities.location) {
        queryConditions.push({
          $text: {
            $search: entities.location,
            $caseSensitive: false,
            $diacriticSensitive: false,
          },
        });
      }

      // Lọc TIÊU CHÍ (Rẻ, Nhanh)
      if (entities.criteria.includes("cheap")) {
        queryConditions.push({ priceTier: "cheap" });
        console.log("...Đang lọc theo tiêu chí: RẺ");
      }
      if (entities.criteria.includes("fast")) {
        queryConditions.push({ productionSpeed: "fast" });
        console.log("...Đang lọc theo tiêu chí: NHANH");
      }

      // Thực thi truy vấn $text
      printers = await User.find({ $and: queryConditions })
        .limit(5)
        .select(
          "displayName rating address specialties priceTier productionSpeed"
        );
    }

    console.log(`Tìm thấy ${printers.length} nhà in thật.`);
    return printers;
  } catch (error) {
    console.error("Lỗi khi tìm nhà in:", error);
    return [];
  }
};

// *** HÀM CONTROLLER CHÍNH (ĐÃ NÂNG CẤP GEOJSON) ***
export const handleChatMessage = async (req, res) => {
  try {
    // 1. Lấy thêm tọa độ từ body
    const { message, latitude, longitude } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Tin nhắn không được để trống" });
    }

    console.log(`🤖 Chat từ user ${userId}: ${message}`);

    // 2. Phân tích entities (Giữ nguyên)
    const entities = analyzeMessage(message);

    // 3. Xây dựng "Context tìm kiếm"
    // Gộp tất cả thông tin lại
    const searchContext = {
      entities: entities,
      coordinates: null,
    };

    // 4. Nếu user muốn tìm "gần" VÀ đã cung cấp tọa độ
    if (entities.criteria.includes("nearby") && latitude && longitude) {
      console.log(`...User cung cấp tọa độ: [${longitude}, ${latitude}]`);
      // Lưu tọa độ theo chuẩn GeoJSON [longitude, latitude]
      searchContext.coordinates = [parseFloat(longitude), parseFloat(latitude)];
    }

    // 5. Tìm nhà in TRƯỚC (Gửi toàn bộ context)
    const printers = await findPrinters(searchContext);

    // 6. Gọi AI (Gửi printers cho AI biết)
    const aiResponse = await callOpenAI_API(message, printers);

    // 7. LƯU TRỮ (Giữ nguyên)
    console.log("Bắt đầu lưu trữ tin nhắn...");
    const conversation = await findOrCreateConversation(userId);
    const userMessage = await Message.create({
      conversationId: conversation._id,
      sender: userId,
      senderType: "User",
      content: { text: message },
    });
    const aiMessage = await Message.create({
      conversationId: conversation._id,
      sender: null,
      senderType: "AI",
      content: { text: aiResponse },
    });
    conversation.messages.push(userMessage._id);
    conversation.messages.push(aiMessage._id);
    conversation.lastMessageAt = Date.now();
    await conversation.save();
    console.log("Đã lưu tin nhắn vào CSDL.");

    // 8. TẠO RESPONSE (Giữ nguyên)
    const response = {
      type: "ai_response",
      content: {
        text: aiResponse,
        entities: entities,
        printers: printers,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Lỗi xử lý chat:", error);
    res.status(500).json({
      type: "ai_response",
      content: {
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau! 🛠️",
        entities: {},
        printers: [],
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// *** HÀM LỊCH SỬ CHAT (GIỮ NGUYÊN) ***
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      "participants.userId": userId,
      type: "customer-bot",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "messages",
        options: { sort: { createdAt: 1 } },
      });

    if (!conversation) {
      return res.json({ messages: [] });
    }

    res.json({ messages: conversation.messages });
  } catch (error) {
    console.error("Lỗi lấy lịch sử chat:", error);
    res.json({ messages: [] });
  }
};
