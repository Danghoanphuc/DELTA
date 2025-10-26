import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "./middleware/authMiddleware.js";
import passport from "passport";
import session from "express-session";
import "./config/passport-setup.js";
import authOAuthRoute from "./routes/authOAuthRoute.js";
import chatRoute from "./routes/chatRoute.js";
import printerRoute from "./routes/printerRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ... (code khác của app)

// 1. Định nghĩa WhiteList
const whiteList = [
  "https://www.printz.vn", // Domain production
  "http://localhost:5173",
  "https://delta-j7qn.onrender.com", // Domain frontend dev (thay 5173 bằng port của bạn)
];

// 2. Tạo Cấu hình CORS
const corsOptions = {
  origin: function (origin, callback) {
    const whiteList = [
      "https://www.printz.vn",
      "http://localhost:5173",
      "https://your-frontend.vercel.app", // Thay bằng domain frontend của bạn
    ];

    // ✅ Cho phép request không có origin (postMessage, popup)
    if (
      !origin ||
      whiteList.some((allowed) =>
        origin.includes(allowed.replace(/^https?:\/\//, ""))
      )
    ) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Blocked: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"], // ✅ Thêm dòng này
};

// 3. Sử dụng các middleware
app.use(cors(corsOptions)); // <-- SỬ DỤNG CẤU HÌNH Ở TRÊN
app.use(express.json());
app.use(cookieParser());

// ... (code các routes của bạn)

// --- (MỚI) Cấu hình Express Session ---
// Passport dùng session để lưu thông tin user giữa các request
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_fallback_session_secret", // 👈 Thêm biến SESSION_SECRET vào Render
    resave: false,
    saveUninitialized: false, // Chỉ lưu session khi có gì đó thay đổi
    cookie: {
      secure: process.env.NODE_ENV === "production", // Chỉ gửi cookie qua HTTPS khi ở production
      httpOnly: true, // Ngăn JavaScript truy cập cookie
      maxAge: REFRESH_TOKEN_TTL, // Có thể dùng lại biến thời gian hết hạn refresh token
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Quan trọng cho cross-site
    },
  })
);

// --- (MỚI) Khởi tạo Passport ---
app.use(passport.initialize()); // Bật Passport
app.use(passport.session()); // Cho Passport dùng session

// --- NGƯỜI ĐƯA TIN CỦA BẾP TRƯỞNG ---
app.use((req, res, next) => {
  console.log(
    `--- Máy chủ: Vừa nhận được 1 yêu cầu ${req.method} đến ${req.path}`
  );
  next();
});

// --- MÓN ĂN THỬ NGHIỆM CHO TRÌNH DUYỆT ---
app.get("/", (req, res) => {
  console.log("--- Máy chủ: Đang xử lý yêu cầu GET /");
  res.status(200).json({ message: "Nhà bếp đang hoạt động!" });
});

// --- Điều phối ---
app.use("/api/auth", authRoute);
app.use("/api/users", isAuthenticated, userRoute); //app.use("tên-khu-vực-VIP", baoVe, boiBanCuaKhuVucDo);
app.use("/api/auth", authOAuthRoute);
app.use("/api/chat", chatRoute);
app.use("/api/printer", printerRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
// --- Khởi động ---
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
  });
});
