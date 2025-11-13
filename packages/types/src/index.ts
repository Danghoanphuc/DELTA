// packages/types/src/index.ts
// ✅ BẢN VÁ: Dọn dẹp export trùng lặp

export * from "./admin.types.js";
export * from "./asset.js";
export * from "./infraction.types.js";
export * from "./ledger.types.js"; // (Từ GĐ 5.R1)

// (Các file vừa sửa)
export * from "./user.types.js";
export * from "./order.types.js";
export * from "./printer.types.js"; // <-- Đã chứa bản vá TS2305
export * from "./tier.types.js";
export * from "./product.types.js";

// (Thêm các file .js khác nếu có, ví dụ: cart.types.js, chat.js, v.v...)
