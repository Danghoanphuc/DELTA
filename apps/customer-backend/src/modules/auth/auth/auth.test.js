// src/modules/auth/auth.test.js
import supertest from "supertest";
import mongoose from "mongoose";
// Import 'app' từ file server chính của anh
import app from "../../server.js";
// Import model để dọn dẹp (cleanup)
import { User } from "../../shared/models/user.model.js";
import Session from "../../shared/models/session.model.js";

// Tạo một "request client" bọc app Express của anh
const request = supertest(app);

// 1. Tắt server và ngắt kết nối DB sau khi chạy xong tất cả test
afterAll(async () => {
  await mongoose.connection.close();
  // (Chúng ta không cần app.close() vì supertest tự quản lý)
});

// 2. Dọn dẹp User và Session sau mỗi bài test
afterEach(async () => {
  await User.deleteMany({ email: /@test.com/ });
  await Session.deleteMany({});
});

// === BỘ TEST CHO MODULE AUTH ===
describe("Auth Module (/api/auth)", () => {
  /**
   * ⭐️ BÀI TEST NÀY SẼ PHÁT HIỆN LỖI CỦA ANH ⭐️
   * Nó kiểm tra xem endpoint /api/auth/google có CHUYỂN HƯỚNG (302)
   * đến trang đăng nhập Google hay không.
   *
   * NẾU THIẾU import passport.config.js -> Lỗi 500 (Internal Server Error)
   * NẾU ĐỦ import passport.config.js -> 302 Found (Redirect)
   */
  it("GET /auth/google - (TEST PHÁT HIỆN LỖI) - Phải trả về 302 Redirect đến Google", async () => {
    // Gọi API
    const res = await request.get("/api/auth/google");

    // Kiểm tra kết quả
    expect(res.statusCode).toBe(302); // Mong đợi redirect
    expect(res.headers.location).toContain("accounts.google.com"); // Phải chứa link Google
  });

  it("POST /auth/signup - Phải trả về 400 (Bad Request) nếu thiếu thông tin", async () => {
    const res = await request.post("/api/auth/signup").send({
      email: "test@test.com",
      // Cố tình thiếu password và displayName
    });

    expect(res.statusCode).toBe(400); // Mong đợi lỗi ValidationException
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Thiếu thông tin");
  });

  it("POST /auth/signup - Phải trả về 201 (Created) khi đăng ký thành công", async () => {
    const res = await request.post("/api/auth/signup").send({
      email: "phuc.test@test.com",
      password: "password123",
      displayName: "Phuc Test",
    });

    expect(res.statusCode).toBe(201); // Mong đợi Created
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Đăng ký thành công");

    // Kiểm tra DB
    const user = await User.findOne({ email: "phuc.test@test.com" });
    expect(user).toBeDefined();
    expect(user.displayName).toBe("Phuc Test");
  });

  it("GET /users/me - (TEST MIDDLEWARE) - Phải trả về 401 (Unauthorized) nếu không có token", async () => {
    const res = await request.get("/api/users/me");

    expect(res.statusCode).toBe(401); // Mong đợi lỗi từ middleware 'protect'
    expect(res.body.message).toContain("Không có token");
  });

  // (Anh có thể thêm test cho /signin, /refresh, v.v...)
});
