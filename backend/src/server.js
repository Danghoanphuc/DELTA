import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
dotenv.config();
import cors from "cors";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import { protect } from "./middleware/authMiddleware.js";
import passport from "passport";
import session from "express-session";
import "./config/passport-setup.js";
import authOAuthRoute from "./routes/authOAuthRoute.js";
import chatRoute from "./routes/chatRoute.js";
import printerRoute from "./routes/printerProfileRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
import cartRoute from "./routes/cartRoute.js";

const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days
// --- Lấy __dirname trong ES Module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ---
const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
const whiteList = [
  "https://www.printz.vn",
  "http://localhost:5173",
  "https://delta-j7qn.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in whitelist
    const isAllowed = whiteList.some((allowed) => {
      const normalizedOrigin = origin.replace(/^https?:\/\//, "");
      const normalizedAllowed = allowed.replace(/^https?:\/\//, "");
      return normalizedOrigin === normalizedAllowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Blocked: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Express Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_fallback_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: REFRESH_TOKEN_TTL,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!", status: "healthy" });
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", protect, userRoute);
app.use("/api/auth", authOAuthRoute);
app.use("/api/chat", chatRoute);
app.use("/api/printer", protect, printerRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/cart", cartRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
});
