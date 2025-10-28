// src/modules/products/index.js

/**
 * Products Module - Barrel Export
 *
 * This file acts as a central export point for the entire products module.
 * It follows the "Barrel Export" pattern for cleaner imports.
 *
 * Usage:
 * import { ProductController, ProductService, productRoutes } from './modules/products';
 */

export { ProductController } from "./product.controller.js";
export { ProductService } from "./product.service.js";
export { ProductRepository } from "./product.repository.js";
export { default as productRoutes } from "./product.routes.js";
