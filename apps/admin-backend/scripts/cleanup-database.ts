// apps/admin-backend/scripts/cleanup-database.ts
// Script dọn dẹp database an toàn với nhiều tùy chọn
// Usage: npx ts-node scripts/cleanup-database.ts [options]
// Options:
//   --dry-run         Chỉ hiển thị những gì sẽ bị xóa, không thực sự xóa
//   --all             Xóa TẤT CẢ dữ liệu (nguy hiểm!)
//   --posts           Xóa tất cả bài viết (SupplierPosts)
//   --products        Xóa tất cả sản phẩm (CatalogProducts)
//   --orders          Xóa tất cả đơn hàng
//   --users           Xóa tất cả users (trừ admin)
//   --sessions        Xóa tất cả sessions
//   --notifications   Xóa tất cả notifications
//   --logs            Xóa tất cả logs
//   --test-data       Xóa dữ liệu test (có prefix "test-" hoặc "[TEST]")

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI || "";

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force"); // Bỏ qua xác nhận
const CLEAN_ALL = args.includes("--all");
const CLEAN_POSTS = args.includes("--posts") || CLEAN_ALL;
const CLEAN_PRODUCTS = args.includes("--products") || CLEAN_ALL;
const CLEAN_ORDERS = args.includes("--orders") || CLEAN_ALL;
const CLEAN_USERS = args.includes("--users") || CLEAN_ALL;
const CLEAN_SESSIONS = args.includes("--sessions") || CLEAN_ALL;
const CLEAN_NOTIFICATIONS = args.includes("--notifications") || CLEAN_ALL;
const CLEAN_LOGS = args.includes("--logs") || CLEAN_ALL;
const CLEAN_TEST_DATA = args.includes("--test-data");

// Collections to clean
const COLLECTIONS_CONFIG = {
  // Bài viết
  supplierposts: { enabled: CLEAN_POSTS, label: "Bài viết (SupplierPosts)" },

  // Sản phẩm
  catalogproducts: {
    enabled: CLEAN_PRODUCTS,
    label: "Sản phẩm (CatalogProducts)",
  },
  products: { enabled: CLEAN_PRODUCTS, label: "Sản phẩm (Products - legacy)" },

  // Đơn hàng
  orders: { enabled: CLEAN_ORDERS, label: "Đơn hàng (Orders)" },
  swagorders: { enabled: CLEAN_ORDERS, label: "Swag Orders" },
  carts: { enabled: CLEAN_ORDERS, label: "Giỏ hàng (Carts)" },

  // Users (cẩn thận!)
  users: {
    enabled: CLEAN_USERS,
    label: "Users (trừ admin)",
    preserveAdmin: true,
  },
  customerprofiles: { enabled: CLEAN_USERS, label: "Customer Profiles" },
  organizationprofiles: {
    enabled: CLEAN_USERS,
    label: "Organization Profiles",
  },

  // Sessions & Auth
  sessions: { enabled: CLEAN_SESSIONS, label: "Sessions" },
  refreshtokens: { enabled: CLEAN_SESSIONS, label: "Refresh Tokens" },

  // Notifications
  notifications: { enabled: CLEAN_NOTIFICATIONS, label: "Notifications" },

  // Logs & Analytics
  activitylogs: { enabled: CLEAN_LOGS, label: "Activity Logs" },
  auditlogs: { enabled: CLEAN_LOGS, label: "Audit Logs" },
};

// Prompt for confirmation
async function confirm(message: string): Promise<boolean> {
  if (DRY_RUN || FORCE) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

async function cleanupDatabase() {
  console.log("\n" + "=".repeat(60));
  console.log("🧹 DATABASE CLEANUP SCRIPT");
  console.log("=".repeat(60));

  if (DRY_RUN) {
    console.log("⚠️  DRY RUN MODE - Không có dữ liệu nào bị xóa thực sự\n");
  }

  // Show what will be cleaned
  console.log("\n📋 Các collection sẽ được dọn dẹp:");
  let hasAnyEnabled = false;
  for (const [name, config] of Object.entries(COLLECTIONS_CONFIG)) {
    if (config.enabled) {
      console.log(`   ✓ ${config.label}`);
      hasAnyEnabled = true;
    }
  }

  if (!hasAnyEnabled && !CLEAN_TEST_DATA) {
    console.log("\n❌ Không có tùy chọn nào được chọn!");
    console.log("\nSử dụng:");
    console.log("  --dry-run         Chỉ hiển thị, không xóa");
    console.log("  --all             Xóa TẤT CẢ (nguy hiểm!)");
    console.log("  --posts           Xóa bài viết");
    console.log("  --products        Xóa sản phẩm");
    console.log("  --orders          Xóa đơn hàng");
    console.log("  --users           Xóa users (trừ admin)");
    console.log("  --sessions        Xóa sessions");
    console.log("  --notifications   Xóa notifications");
    console.log("  --logs            Xóa logs");
    console.log("  --test-data       Xóa dữ liệu test");
    process.exit(1);
  }

  if (CLEAN_TEST_DATA) {
    console.log("   ✓ Dữ liệu test (prefix 'test-' hoặc '[TEST]')");
  }

  try {
    // Connect to MongoDB
    console.log("\n🔌 Đang kết nối MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Đã kết nối!\n");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Không thể kết nối database");
    }

    // Get current counts
    console.log("📊 Thống kê hiện tại:");
    const stats: Record<string, number> = {};

    for (const [name, config] of Object.entries(COLLECTIONS_CONFIG)) {
      if (config.enabled) {
        try {
          const count = await db.collection(name).countDocuments();
          stats[name] = count;
          console.log(`   ${config.label}: ${count} documents`);
        } catch {
          console.log(`   ${config.label}: (collection không tồn tại)`);
        }
      }
    }

    // Confirm before proceeding
    if (!DRY_RUN) {
      console.log("\n" + "⚠️".repeat(30));
      console.log("⚠️  CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!");
      console.log("⚠️".repeat(30) + "\n");

      const confirmed = await confirm("Bạn có chắc chắn muốn tiếp tục?");
      if (!confirmed) {
        console.log("\n❌ Đã hủy bỏ.");
        process.exit(0);
      }

      // Double confirm for --all
      if (CLEAN_ALL) {
        const doubleConfirmed = await confirm(
          '⚠️  Bạn đang xóa TẤT CẢ dữ liệu! Gõ "yes" để xác nhận lần cuối:'
        );
        if (!doubleConfirmed) {
          console.log("\n❌ Đã hủy bỏ.");
          process.exit(0);
        }
      }
    }

    // Perform cleanup
    console.log("\n🧹 Đang dọn dẹp...\n");
    const results: Record<string, number> = {};

    for (const [name, config] of Object.entries(COLLECTIONS_CONFIG)) {
      if (!config.enabled) continue;

      try {
        const collection = db.collection(name);
        let filter: any = {};

        // Special handling for users - preserve admin
        if (name === "users" && (config as any).preserveAdmin) {
          filter = { role: { $ne: "admin" } };
        }

        if (DRY_RUN) {
          const count = await collection.countDocuments(filter);
          results[name] = count;
          console.log(
            `   [DRY RUN] ${config.label}: ${count} documents sẽ bị xóa`
          );
        } else {
          const result = await collection.deleteMany(filter);
          results[name] = result.deletedCount;
          console.log(
            `   ✅ ${config.label}: Đã xóa ${result.deletedCount} documents`
          );
        }
      } catch (error: any) {
        console.log(`   ⚠️  ${config.label}: ${error.message}`);
      }
    }

    // Clean test data if requested
    if (CLEAN_TEST_DATA) {
      console.log("\n🧪 Dọn dẹp dữ liệu test...");

      const testCollections = [
        "supplierposts",
        "catalogproducts",
        "products",
        "suppliers",
        "users",
        "orders",
      ];

      for (const collName of testCollections) {
        try {
          const collection = db.collection(collName);
          const testFilter = {
            $or: [
              { name: { $regex: /^test-/i } },
              { name: { $regex: /^\[TEST\]/i } },
              { title: { $regex: /^test-/i } },
              { title: { $regex: /^\[TEST\]/i } },
              { email: { $regex: /^test/i } },
              { slug: { $regex: /^test-/i } },
            ],
          };

          if (DRY_RUN) {
            const count = await collection.countDocuments(testFilter);
            if (count > 0) {
              console.log(
                `   [DRY RUN] ${collName}: ${count} test documents sẽ bị xóa`
              );
            }
          } else {
            const result = await collection.deleteMany(testFilter);
            if (result.deletedCount > 0) {
              console.log(
                `   ✅ ${collName}: Đã xóa ${result.deletedCount} test documents`
              );
            }
          }
        } catch {
          // Collection might not exist
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 KẾT QUẢ:");
    console.log("=".repeat(60));

    let totalDeleted = 0;
    for (const [name, count] of Object.entries(results)) {
      if (count > 0) {
        totalDeleted += count;
      }
    }

    if (DRY_RUN) {
      console.log(`\n🔍 Tổng cộng ${totalDeleted} documents SẼ bị xóa`);
      console.log("💡 Chạy lại không có --dry-run để thực sự xóa");
    } else {
      console.log(`\n✅ Tổng cộng đã xóa ${totalDeleted} documents`);
    }
  } catch (error) {
    console.error("\n❌ Lỗi:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Đã ngắt kết nối MongoDB");
  }
}

// Run
cleanupDatabase();
