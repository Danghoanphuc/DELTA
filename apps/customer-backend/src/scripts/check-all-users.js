import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function check() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");

  // Find all users
  const users = await User.find({});

  console.log("\n=== ALL USERS ===");
  console.log("Total:", users.length);

  users.forEach((u, i) => {
    console.log(`\n--- User ${i + 1} ---`);
    console.log("ID:", u._id);
    console.log("Email:", u.email);
    console.log("displayName:", u.displayName);
    console.log("googleId:", u.googleId || "null");
    console.log("organizationProfileId:", u.organizationProfileId || "null");
    console.log("customerProfileId:", u.customerProfileId || "null");
    console.log("shipperProfileId:", u.shipperProfileId || "null");
    console.log("isActive:", u.isActive);
    console.log("createdAt:", u.createdAt);
  });

  await mongoose.disconnect();
}

check();
