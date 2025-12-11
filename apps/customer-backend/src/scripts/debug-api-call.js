import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

async function debug() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");

  // Find all users with gmail
  const gmailUsers = await User.find({ email: { $regex: /gmail\.com$/ } });

  console.log("\n=== GMAIL USERS ===");
  gmailUsers.forEach((u) => {
    console.log(`\n${u.email}:`);
    console.log(`  ID: ${u._id}`);
    console.log(`  googleId: ${u.googleId || "null"}`);
    console.log(
      `  organizationProfileId: ${u.organizationProfileId || "null"}`
    );
    console.log(`  shipperProfileId: ${u.shipperProfileId || "null"}`);
  });

  // Generate test tokens for each gmail user
  console.log("\n=== TEST TOKENS ===");
  console.log("Use these tokens to test API /users/me:");
  gmailUsers.forEach((u) => {
    const token = jwt.sign({ userId: u._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    console.log(`\n${u.email}:`);
    console.log(
      `  curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/users/me`
    );
  });

  await mongoose.disconnect();
}

debug();
