import {express} from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Không cần auth)
// ============================================
router.route("/").get(getAllProducts);        // GET /api/products
router.route("/:id").get(getProductById);     // GET /api/products/:id

// ============================================
// PRIVATE ROUTES (Cần auth - Phải đặt TRƯỚC)
// ============================================
router.use(isAuthenticated);

router.route("/").post(createProduct);              // POST /api/products
router.route("/my-products").get(getMyProducts);    // GET /api/products/my-products

export default router;
EOF
cat /mnt/user-data/outputs/FIXES_productRoute.js
Ra

// backend/src/routes/productRoute.js (FIXED VERSION)
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Không cần auth)
// ============================================
router.route("/").get(getAllProducts);        // GET /api/products
router.route("/:id").get(getProductById);     // GET /api/products/:id

// ============================================
// PRIVATE ROUTES (Cần auth - Phải đặt TRƯỚC)
// ============================================
router.use(isAuthenticated);

router.route("/").post(createProduct);              // POST /api/products
router.route("/my-products").get(getMyProducts);    // GET /api/products/my-products

export default router;