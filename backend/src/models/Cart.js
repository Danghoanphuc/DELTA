// backend/src/models/Cart.js

import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  // Store selected price tier at time of adding to cart
  selectedPrice: {
    minQuantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
  },
  // Store customization options
  customization: {
    hasFileUpload: Boolean,
    fileUrl: String,
    notes: String,
  },
  // Auto-calculated subtotal
  subtotal: {
    type: Number,
    required: true,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [CartItemSchema],

    // Totals (updated by helper method)
    totalItems: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to calculate totals
CartSchema.methods.calculateTotals = function () {
  let totalItems = 0;
  let totalAmount = 0;

  this.items.forEach((item) => {
    totalItems += item.quantity;
    totalAmount += item.subtotal;
  });

  this.totalItems = totalItems;
  this.totalAmount = totalAmount;
};

export const Cart = mongoose.model("Cart", CartSchema);
