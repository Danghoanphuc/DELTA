import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/printz";

async function setGoogleId() {
  await mongoose.connect(MONGODB_URI);

  const { User } = await import("../shared/models/user.model.js");

  // Update user to have googleId
  // Note: You need to get the actual googleId from Google OAuth
  // For now, we'll set a placeholder that matches what Google returns

  const user = await User.findOne({ email: "phucdh911@gmail.com" });

  if (!user) {
    console.log("User not found!");
    await mongoose.disconnect();
    return;
  }

  console.log("\n=== BEFORE ===");
  console.log("Email:", user.email);
  console.log("googleId:", user.googleId);
  console.log("organizationProfileId:", user.organizationProfileId);

  // The googleId should match what Google OAuth returns
  // This is typically a numeric string like "123456789012345678901"
  // For testing, we'll use a placeholder
  // In production, the user needs to login via Google first to get the real googleId

  console.log("\n⚠️  NOTE: To properly link Google OAuth:");
  console.log("1. User needs to login via Google OAuth first");
  console.log("2. System will create a new user with googleId");
  console.log(
    "3. Then we need to merge the accounts or transfer organizationProfileId"
  );

  console.log("\n📝 SOLUTION OPTIONS:");
  console.log(
    "A) Delete the current user and let Google OAuth create a new one, then seed data again"
  );
  console.log(
    "B) Find the Google-created user and transfer organizationProfileId to it"
  );
  console.log(
    "C) Update the current user with the correct googleId from Google"
  );

  // Let's check if there's another user created by Google OAuth
  const allUsers = await User.find({}).select(
    "email googleId organizationProfileId createdAt"
  );

  console.log("\n=== ALL USERS ===");
  allUsers.forEach((u) => {
    console.log(
      `${u.email} | googleId: ${u.googleId || "null"} | orgId: ${
        u.organizationProfileId || "null"
      }`
    );
  });

  await mongoose.disconnect();
}

setGoogleId();
