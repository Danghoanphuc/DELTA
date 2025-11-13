// apps/admin-backend/src/controllers/admin.product.controller.ts
import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as productService from "../services/admin.product.service.js";
import { ValidationException } from "../shared/exceptions.js";

export const handleGetAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json({ success: true, data: result });
  }
);

export const handleGetProductById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  }
);

export const handleUpdateProductStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, isPublished } = req.body;
    if (!status || isPublished === undefined) {
      throw new ValidationException("Yêu cầu 'status' và 'isPublished'.");
    }
    const product = await productService.updateProductStatus(
      req.params.id,
      status,
      isPublished
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái sản phẩm thành công.",
      data: product,
    });
  }
);
