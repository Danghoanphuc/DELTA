#!/usr/bin/env node
/**
 * Script to create Novu workflow for delivery-thread-message
 * Run: node scripts/create-novu-workflow.js
 */

import { Novu } from "@novu/node";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const NOVU_API_KEY = process.env.NOVU_API_KEY;

if (!NOVU_API_KEY) {
  console.error("❌ NOVU_API_KEY not found in .env file");
  process.exit(1);
}

const novu = new Novu(NOVU_API_KEY);

async function createDeliveryThreadWorkflow() {
  try {
    console.log("🚀 Creating delivery-thread-message workflow...\n");

    // Create workflow
    const workflow = await novu.notificationTemplates.create({
      name: "Delivery Thread Message",
      description:
        "Notify participants when new message is posted in delivery thread",
      notificationGroupId: process.env.NOVU_NOTIFICATION_GROUP_ID || "default",
      tags: ["delivery", "thread", "message"],
      steps: [
        {
          template: {
            type: "in_app",
            content:
              '{{senderName}} ({{senderRole}}) đã gửi tin nhắn trong đơn hàng {{orderNumber}}:\n\n"{{messagePreview}}"',
            cta: {
              type: "redirect",
              data: {
                url: "{{url}}",
              },
              action: {
                buttons: [
                  {
                    type: "primary",
                    content: "Xem chi tiết",
                  },
                ],
              },
            },
          },
          filters: [],
          active: true,
          shouldStopOnFail: false,
          replyCallback: null,
        },
      ],
      active: true,
      draft: false,
      critical: false,
      preferenceSettings: {
        email: true,
        sms: false,
        in_app: true,
        chat: false,
        push: false,
      },
    });

    console.log("✅ Workflow created successfully!\n");
    console.log("📋 Workflow Details:");
    console.log(`   ID: ${workflow.data._id}`);
    console.log(`   Identifier: ${workflow.data.triggers[0].identifier}`);
    console.log(`   Name: ${workflow.data.name}`);
    console.log(`   Active: ${workflow.data.active}`);
    console.log("\n🎯 Next steps:");
    console.log(
      "   1. Update novu.service.ts to use the new workflow identifier"
    );
    console.log("   2. Restart the server");
    console.log("   3. Test by sending a message in delivery thread");
    console.log("\n💡 Workflow Identifier to use in code:");
    console.log(`   ${workflow.data.triggers[0].identifier}`);

    return workflow;
  } catch (error) {
    console.error("❌ Failed to create workflow:", error.message);

    if (error.response) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    if (error.message.includes("already exists")) {
      console.log("\n💡 Workflow already exists. You can:");
      console.log("   1. Use the existing workflow");
      console.log(
        "   2. Delete it from Novu Dashboard and run this script again"
      );
      console.log("   3. Update the existing workflow manually");
    }

    process.exit(1);
  }
}

// Alternative: Create using Novu Management API
async function createWorkflowViaAPI() {
  try {
    console.log("🚀 Creating workflow via Management API...\n");

    const response = await fetch("https://api.novu.co/v1/workflows", {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${NOVU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Delivery Thread Message",
        description:
          "Notify participants when new message is posted in delivery thread",
        notificationGroupId: "default",
        tags: ["delivery", "thread", "message"],
        steps: [
          {
            name: "In-App Notification",
            template: {
              type: "in_app",
              content:
                '{{senderName}} ({{senderRole}}) đã gửi tin nhắn trong đơn hàng {{orderNumber}}:\n\n"{{messagePreview}}"',
              cta: {
                type: "redirect",
                data: {
                  url: "{{url}}",
                },
              },
            },
          },
        ],
        active: true,
        draft: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error, null, 2));
    }

    const workflow = await response.json();
    console.log("✅ Workflow created successfully!\n");
    console.log("📋 Workflow Details:", JSON.stringify(workflow, null, 2));

    return workflow;
  } catch (error) {
    console.error("❌ Failed to create workflow via API:", error.message);
    process.exit(1);
  }
}

// Main execution
console.log("═══════════════════════════════════════════════════════");
console.log("  Novu Workflow Creator - Delivery Thread Message");
console.log("═══════════════════════════════════════════════════════\n");

console.log("📝 Workflow Configuration:");
console.log("   Identifier: delivery-thread-message");
console.log("   Type: In-App Notification");
console.log("   Payload Variables:");
console.log("     - threadId (string)");
console.log("     - orderNumber (string)");
console.log("     - senderName (string)");
console.log("     - senderRole (string)");
console.log("     - messagePreview (string)");
console.log("     - checkinId (string)");
console.log("     - url (string)");
console.log("\n");

// Try SDK method first, fallback to API if needed
createDeliveryThreadWorkflow()
  .catch(() => {
    console.log("\n⚠️ SDK method failed, trying Management API...\n");
    return createWorkflowViaAPI();
  })
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ All methods failed:", error.message);
    console.log("\n📖 Manual Setup Instructions:");
    console.log("   1. Go to https://web.novu.co");
    console.log("   2. Navigate to Workflows → Create Workflow");
    console.log("   3. Set Identifier: delivery-thread-message");
    console.log("   4. Add In-App step with template above");
    console.log("   5. Activate workflow");
    process.exit(1);
  });
