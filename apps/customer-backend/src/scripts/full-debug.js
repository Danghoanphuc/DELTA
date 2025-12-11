// apps/customer-backend/src/scripts/full-debug.js
/**
 * Full debug - check everything
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function fullDebug() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected\n");

    const { User } = await import("../shared/models/user.model.js");
    const { MasterOrder } = await import("../shared/models/master-order.model.js");
    const { DeliveryCheckin } = await import("../modules/delivery-checkin/delivery-checkin.model.js");

    console.log("=".repeat(70));
    co