// backend/src/models/Order.js

import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Customer and Printer
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order items
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        quantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
        specifications: Object, // Snapshot of product specifications
        customization: {
          notes: String,
          designFiles: [{ url: String, fileName: String }],
        },
        subtotal: Number,
      },
    ],

    // Pricing
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Shipping address
    shippingAddress: {
      recipientName: String,
      phone: String,
      street: String,
      ward: String,
      district: String,
      city: String,
      notes: String,
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending", // Awaiting confirmation
        "confirmed", // Confirmed
        "designing", // Design in progress
        "printing", // Printing
        "ready", // Ready for delivery
        "shipping", // In transit
        "completed", // Completed
        "cancelled", // Cancelled
        "refunded", // Refunded
      ],
      default: "pending",
    },

    // Status history
    statusHistory: [
      {
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Payment information
    payment: {
      method: {
        type: String,
        enum: ["cod", "bank-transfer", "momo", "zalopay"],
        default: "cod",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
      },
      paidAt: Date,
      transactionId: String,
    },

    // Timestamps
    estimatedDelivery: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient queries
OrderSchema.index({ customerId: 1, status: 1 });
OrderSchema.index({ printerId: 1, status: 1 });

export const Order = mongoose.model("Order", OrderSchema);
