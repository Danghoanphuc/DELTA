import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

async function testAPI() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");

  const user = await User.findOne({ email: "phucdh911@gmail.com" });
  console.log("\n=== USER FROM DB ===");
  console.log("Email:", user.email);
  console.log("organizationProfileId:", user.organizationProfileId);

  // Generate a test token
  const token = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  console.log("\n=== TEST TOKEN ===");
  console.log("Token:", token.substring(0, 50) + "...");

  // Simulate what /users/me returns
  const userFromAPI = await User.findById(user._id)
    .select(
      "_id username displayName avatarUrl bio email printerProfileId organizationProfileId customerProfileId shipperProfileId phone createdAt"
    )
    .lean();

  console.log("\n=== SIMULATED /users/me RESPONSE ===");
  console.log(JSON.stringify(userFromAPI, null, 2));

  await mongoose.disconnect();
}

testAPI();
