import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/printz";

async function check() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");

  const userId = "6937d8181cd4c1334e768967";
  const user = await User.findById(userId);

  console.log("\n=== CHECK USER BY ID ===");
  console.log("User ID:", userId);
  console.log("Found:", user ? "YES" : "NO");

  if (user) {
    console.log("Email:", user.email);
    console.log("organizationProfileId:", user.organizationProfileId);
  }

  // Also check by email
  const userByEmail = await User.findOne({ email: "phucdh911@gmail.com" });
  console.log("\n=== CHECK USER BY EMAIL ===");
  console.log("Found:", userByEmail ? "YES" : "NO");
  if (userByEmail) {
    console.log("ID:", userByEmail._id);
  }

  await mongoose.disconnect();
}

check();
