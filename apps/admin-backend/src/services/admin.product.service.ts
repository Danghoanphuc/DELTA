// apps/admin-backend/src/services/admin.product.service.ts
import { Model, Document } from "mongoose";
import { type IPrinterProduct } from "@printz/types";
import { NotFoundException } from "../shared/exceptions.js";

// --- Kỹ thuật import model JS từ project khác ---
// @ts-ignore - Customer backend .js files, no type declarations
import { Product as ProductModelJS } from "../../../customer-backend/src/shared/models/product.model.js";
type IProductModel = Model<IPrinterProduct & Document>;
const ProductModel = ProductModelJS as unknown as IProductModel;
// --- Hết ---

export const getAllProducts = async (query: any) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const { search, healthStatus, isPublished, printerId } = query;

  const filter: any = {};
  if (search) filter.name = new RegExp(search, "i");
  if (healthStatus) filter.healthStatus = healthStatus;
  if (printerId) filter.printerProfileId = printerId;
  if (isPublished !== undefined) filter.isPublished = isPublished === "true";

  const products = await ProductModel.find(filter)
    .populate("printerProfileId", "businessName email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await ProductModel.countDocuments(filter);
  return {
    data: products,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getProductById = async (productId: string) => {
  const product = await ProductModel.findById(productId).populate(
    "printerProfileId"
  );
  if (!product) {
    throw new NotFoundException("Sản phẩm", productId);
  }
  return product;
};

export const updateProductStatus = async (
  productId: string,
  status: "Active" | "Warning" | "Suspended",
  isPublished: boolean
) => {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new NotFoundException("Sản phẩm", productId);
  }
  product.healthStatus = status;
  product.isPublished = isPublished;
  if (status === "Suspended") {
    product.stats.lastSuspensionAt = new Date();
  }
  await product.save();
  return product;
};
