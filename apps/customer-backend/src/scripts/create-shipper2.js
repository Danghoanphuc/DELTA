// Create shipper with simple password
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function createShipper() {
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.connection.collection("users");
  const email = "shipper2@test.com";
  const password = "123456";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Delete if exists
  await User.deleteOne({ email });

  // Create new
  await User.insertOne({
    email,
    displayName: "Shipper 2",
    username: "shipper2",
    hashedPassword,
    authMethod: "local",
    role: "shipper",
    isVerified: true,
    isActive: true,
    shipperProfile: { isActive: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Created shipper2@test.com / 123456");

  // Verify
  const user = await User.findOne({ email });
  const match = await bcrypt.compare(password, user.hashedPassword);
  console.log("Password verify:", match);

  await mongoose.disconnect();
}

createShipper();
