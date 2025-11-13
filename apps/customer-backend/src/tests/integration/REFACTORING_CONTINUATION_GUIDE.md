# 🚀 PRINTZ BACKEND REFACTORING - CONTINUATION GUIDE

## 📋 PHASE 2.2: PRODUCTS MODULE - DETAILED IMPLEMENTATION

### Step 1: Create Product Repository

```javascript
// src/modules/products/product.repository.js
import { Product } from "../../shared/models/product.model.js";

export class ProductRepository {
  async create(productData) {
    return await Product.create(productData);
  }

  async findById(productId) {
    return await Product.findById(productId);
  }

  async findByIdPopulated(productId) {
    return await Product.findById(productId).populate({
      path: "printerId",
      select: "displayName email avatarUrl printerProfile",
      populate: {
        path: "printerProfile",
        model: "PrinterProfile",
      },
    });
  }

  async findByPrinterId(printerId) {
    return await Product.find({ printerId }).sort({ createdAt: -1 });
  }

  async findWithFilters(filters) {
    const { category, search, sort, isActive = true } = filters;
    
    let query = { isActive };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = {
        $search: search,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { "pricing.0.pricePerUnit": 1 };
    if (sort === "price-desc") sortOption = { "pricing.0.pricePerUnit": -1 };
    if (sort === "popular") sortOption = { totalSold: -1, views: -1 };

    return await Product.find(query)
      .populate("printerId", "displayName avatarUrl")
      .sort(sortOption);
  }

  async update(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(productId) {
    return await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
  }

  async hardDelete(productId) {
    return await Product.findByIdAndDelete(productId);
  }
}
```

### Step 2: Create Product Service

```javascript
// src/modules/products/product.service.js
import { ProductRepository } from "./product.repository.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { cloudinary } from "../../infrastructure/storage/cloudinary.config.js";
import { Logger } from "../../shared/utils/index.js";

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(productData, printerId, files) {
    // Validate files
    if (!files || files.length === 0) {
      throw new ValidationException("Phải có ít nhất 1 ảnh sản phẩm");
    }

    // Validate basic fields
    const { name, category, pricing } = productData;
    const errors = [];

    if (!name || name.trim().length < 5) {
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
    }

    if (!category) {
      errors.push("Danh mục sản phẩm là bắt buộc");
    }

    if (!Array.isArray(pricing) || pricing.length === 0) {
      errors.push("Phải có ít nhất một mức giá");
    } else {
      pricing.forEach((tier, index) => {
        if (tier.minQuantity < 1) {
          errors.push(`Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`);
        }
        if (tier.pricePerUnit < 100) {
          errors.push(`Mức giá ${index + 1}: Giá phải ít nhất 100đ`);
        }
      });
    }

    if (errors.length > 0) {
      // Rollback Cloudinary uploads
      const publicIds = files.map((f) => f.filename);
      await cloudinary.api.delete_resources(publicIds).catch((err) =>
        Logger.error("Failed to rollback Cloudinary uploads", err)
      );

      throw new ValidationException("Dữ liệu không hợp lệ", errors);
    }

    // Process images
    const images = files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0,
    }));

    // Create product
    const product = await this.productRepository.create({
      ...productData,
      printerId,
      images,
      isActive: true,
    });

    Logger.success("Product created", { productId: product._id, printerId });

    return await product.populate("printerId", "displayName avatarUrl");
  }

  async updateProduct(productId, updateData, printerId) {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    if (product.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa sản phẩm này");
    }

    // Validate update data
    const { name, category, pricing } = updateData;
    const errors = [];

    if (name !== undefined && name.trim().length < 5) {
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
    }

    if (category !== undefined && !category) {
      errors.push("Danh mục không được để trống");
    }

    if (pricing !== undefined) {
      if (!Array.isArray(pricing) || pricing.length === 0) {
        errors.push("Phải có ít nhất một mức giá");
      } else {
        pricing.forEach((tier, index) => {
          if (tier.minQuantity < 1) {
            errors.push(`Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`);
          }
          if (tier.pricePerUnit < 100) {
            errors.push(`Mức giá ${index + 1}: Giá phải ít nhất 100đ`);
          }
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationException("Dữ liệu cập nhật không hợp lệ", errors);
    }

    const updatedProduct = await this.productRepository.update(productId, updateData);
    Logger.success("Product updated", { productId });

    return updatedProduct;
  }

  async deleteProduct(productId, printerId) {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Product", productId);
    }

    if (product.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền xóa sản phẩm này");
    }

    // Delete images from Cloudinary
    const publicIds = product.images?.map((img) => img.publicId).filter(Boolean);
    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds).catch((err) =>
        Logger.error("Failed to delete Cloudinary images", err)
      );
    }

    await this.productRepository.softDelete(productId);
    Logger.success("Product deleted", { productId });

    return { message: "Xóa sản phẩm thành công" };
  }

  async getAllProducts(filters) {
    return await this.productRepository.findWithFilters(filters);
  }

  async getProductById(productId) {
    const product = await this.productRepository.findByIdPopulated(productId);

    if (!product || !product.isActive) {
      throw new NotFoundException("Product", productId);
    }

    return product;
  }

  async getMyProducts(printerId) {
    return await this.productRepository.findByPrinterId(printerId);
  }
}
```

### Step 3: Create Product Controller

```javascript
// src/modules/products/product.controller.js
import { ProductService } from "./product.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (req, res, next) => {
    try {
      const product = await this.productService.createProduct(
        req.body,
        req.user._id,
        req.files
      );

      res.status(API_CODES.CREATED).json(
        ApiResponse.success(
          { product },
          "Tạo sản phẩm thành công!"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const product = await this.productService.updateProduct(
        req.params.id,
        req.body,
        req.user._id
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success(
          { product },
          "Cập nhật sản phẩm thành công!"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const result = await this.productService.deleteProduct(
        req.params.id,
        req.user._id
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success(null, result.message)
      );
    } catch (error) {
      next(error);
    }
  };

  getAllProducts = async (req, res, next) => {
    try {
      const products = await this.productService.getAllProducts(req.query);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({ products })
      );
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const product = await this.productService.getProductById(req.params.id);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({ product })
      );
    } catch (error) {
      next(error);
    }
  };

  getMyProducts = async (req, res, next) => {
    try {
      const products = await this.productService.getMyProducts(req.user._id);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          products,
          count: products.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
```

### Step 4: Create Product Routes

```javascript
// src/modules/products/product.routes.js
import express from "express";
import { ProductController } from "./product.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";
import { uploadMultiple } from "../../shared/middleware/index.js";

const router = express.Router();
const productController = new ProductController();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Private routes (Printer only)
router.get("/my-products", protect, isPrinter, productController.getMyProducts);

router.post(
  "/",
  protect,
  isPrinter,
  uploadMultiple("images", 5),
  productController.createProduct
);

router.put("/:id", protect, isPrinter, productController.updateProduct);

router.delete("/:id", protect, isPrinter, productController.deleteProduct);

export default router;
```

---

## 📋 PHASE 2.3-2.7: REMAINING MODULES

Use the same pattern for:

### **Cart Module**
- Read: `backend/src/controllers/cartController.js`
- Create:
  - `modules/cart/cart.repository.js`
  - `modules/cart/cart.service.js`
  - `modules/cart/cart.controller.js`
  - `modules/cart/cart.routes.js`

### **Orders Module**
- Read: `backend/src/controllers/orderController.js`
- Create:
  - `modules/orders/order.repository.js`
  - `modules/orders/order.service.js`
  - `modules/orders/order.controller.js`
  - `modules/orders/order.routes.js`

### **Printers Module**
- Read: `backend/src/controllers/printerController.js`
- Create:
  - `modules/printers/printer.repository.js`
  - `modules/printers/printer.service.js`
  - `modules/printers/printer.controller.js`
  - `modules/printers/printer.routes.js`

### **Chat Module**
- Read: `backend/src/controllers/chatController.js`
- Create:
  - `modules/chat/chat.repository.js`
  - `modules/chat/chat.service.js`
  - `modules/chat/chat.controller.js`
  - `modules/chat/chat.routes.js`

### **Users Module**
- Read: `backend/src/controllers/userController.js`
- Create:
  - `modules/users/user.repository.js`
  - `modules/users/user.service.js`
  - `modules/users/user.controller.js`
  - `modules/users/user.routes.js`

---

## 🔧 PHASE 3: SERVER.JS & CONFIG

### Step 1: Create new server.js

```javascript
// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

dotenv.config();

// Infrastructure
import { connectDB } from "./infrastructure/database/connection.js";
import "./infrastructure/auth/passport.config.js";

// Middleware
import { errorHandler } from "./shared/middleware/index.js";
import { Logger } from "./shared/utils/index.js";

// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import authOAuthRoutes from "./modules/auth/auth-oauth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import printerRoutes from "./modules/printers/printer.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "https://www.printz.vn",
    ];
    
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    Logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "PrintZ API v2.0 - Clean Architecture",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authOAuthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/printers", printerRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Global error handler (MUST BE LAST)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      Logger.success(`Server running on port ${PORT}`, {
        env: process.env.NODE_ENV || "development",
        port: PORT,
      });
    });
  } catch (error) {
    Logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
```

### Step 2: Create config files

```javascript
// src/config/env.config.js
import dotenv from "dotenv";
import { Logger } from "../shared/utils/index.js";

dotenv.config();

const requiredEnvVars = [
  "MONGODB_CONNECTIONSTRING",
  "ACCESS_TOKEN_SECRET",
  "SESSION_SECRET",
  "CLIENT_URL",
  "RESEND_API_KEY",
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    Logger.error(`Missing required environment variables: ${missing.join(", ")}`);
    throw new Error("Environment validation failed");
  }

  Logger.success("Environment variables validated");
};

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5001", 10),
  
  database: {
    url: process.env.MONGODB_CONNECTIONSTRING,
  },
  
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL || "30m",
    refreshTokenTTL: 14 * 24 * 60 * 60 * 1000, // 14 days
  },
  
  session: {
    secret: process.env.SESSION_SECRET,
  },
  
  client: {
    url: process.env.CLIENT_URL,
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  email: {
    apiKey: process.env.RESEND_API_KEY,
    domain: process.env.RESEND_DOMAIN || "printz.vn",
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
};
```

---

## ✅ VALIDATION CHECKLIST

After refactoring each module, run through this checklist:

### **1. Import Path Validation**
```bash
# Search for old import patterns
grep -r "from \"..\/models\/" src/
grep -r "from \"..\/libs\/" src/
grep -r "from \"..\/middleware\/authMiddleware" src/
grep -r "from \"..\/config\/" src/

# Should return NO results (all should use new paths)
```

### **2. Functionality Testing**
Test each endpoint:

```bash
# Auth
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/verify-email
POST /api/auth/refresh
POST /api/auth/signout

# Products
GET  /api/products
GET  /api/products/:id
GET  /api/products/my-products (authenticated)
POST /api/products (authenticated + files)
PUT  /api/products/:id (authenticated)
DELETE /api/products/:id (authenticated)

# Cart
GET  /api/cart (authenticated)
POST /api/cart/add (authenticated)
PUT  /api/cart/update (authenticated)
DELETE /api/cart/remove/:id (authenticated)
DELETE /api/cart/clear (authenticated)

# Orders
POST /api/orders (authenticated)
GET  /api/orders/my-orders (authenticated)
GET  /api/orders/:id (authenticated)
GET  /api/orders/printer/my-orders (authenticated + printer)
PUT  /api/orders/printer/:id/status (authenticated + printer)

# Printers
GET  /api/printers/my-profile (authenticated + printer)
PUT  /api/printers/profile (authenticated + printer)

# Chat
POST /api/chat/message (authenticated)
GET  /api/chat/history (authenticated)

# Users
GET  /api/users/me (authenticated)
```

### **3. Error Handling Validation**
Verify all errors return consistent format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["error detail 1", "error detail 2"],
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### **4. Database Connection Test**
```javascript
// Run this in Node.js REPL
import { connectDB } from "./src/infrastructure/database/connection.js";
await connectDB();
// Should see: ✅ Kết nối MongoDB thành công
```

### **5. Middleware Chain Test**
```bash
# Test authentication middleware
curl -X GET http://localhost:5001/api/users/me
# Should return 401 Unauthorized

# Test with valid token
curl -X GET http://localhost:5001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return user data
```

---

## 🎯 IMPORT MAPPING REFERENCE

Use this table when updating imports:

| Old Import | New Import |
|------------|------------|
| `../models/User.js` | `../../shared/models/user.model.js` |
| `../models/Product.js` | `../../shared/models/product.model.js` |
| `../models/Cart.js` | `../../shared/models/cart.model.js` |
| `../models/Order.js` | `../../shared/models/order.model.js` |
| `../models/PrinterProfile.js` | `../../shared/models/printer-profile.model.js` |
| `../models/session.js` | `../../shared/models/index.js` (Session) |
| `../models/Conversation.js` | `../../shared/models/index.js` (Conversation) |
| `../models/Message.js` | `../../shared/models/index.js` (Message) |
| `../libs/db.js` | `../../infrastructure/database/connection.js` |
| `../libs/email.js` | `../../infrastructure/email/email.service.js` (EmailService) |
| `../config/cloudinary.js` | `../../infrastructure/storage/cloudinary.config.js` |
| `../config/passport-setup.js` | `../../infrastructure/auth/passport.config.js` |
| `../middleware/authMiddleware.js` | `../../shared/middleware/index.js` (protect, isPrinter) |

---

## 🚀 QUICK START FOR NEW SESSION

When starting a new conversation to continue this work:

1. **Copy this entire prompt** into the new chat
2. **Specify which module** you want to work on:
   - "Continue with Products Module (Phase 2.2)"
   - "Start Cart Module (Phase 2.3)"
   - "Create server.js (Phase 3)"
3. **Reference the code templates** above
4. **Follow the validation checklist** after each module

---

## 💡 TIPS FOR ASSISTANT

- Always read the old controller file first to understand the logic
- Preserve business logic exactly - only refactor the structure
- Use the repository → service → controller pattern consistently
- Remember to handle Cloudinary cleanup on errors
- Add proper logging using `Logger` utility
- Use exceptions from `shared/exceptions` instead of manual res.status()
- Always use `ApiResponse` utility for consistent responses
- Test each module's routes after creation

---

## 📦 FINAL DELIVERABLE

When all modules are complete:

```
src/
├── shared/          ✅ (100% Complete)
├── infrastructure/  ✅ (100% Complete)
├── modules/
│   ├── auth/        ✅ (100% Complete)
│   ├── products/    🚧 (In Progress)
│   ├── cart/        ⬜ (TODO)
│   ├── orders/      ⬜ (TODO)
│   ├── printers/    ⬜ (TODO)
│   ├── chat/        ⬜ (TODO)
│   └── users/       ⬜ (TODO)
├── config/          ⬜ (TODO)
├── server.js        ⬜ (TODO)
└── package.json     ✅ (No changes needed)
```

**Success criteria:**
- ✅ All old controllers/routes deleted
- ✅ All imports using new paths
- ✅ All tests passing
- ✅ Consistent error handling
- ✅ Clean separation of concerns
- ✅ No code duplication

---

**END OF CONTINUATION GUIDE**

You can now use this document to continue the refactoring work in any new conversation. Just reference the specific phase you want to work on!
