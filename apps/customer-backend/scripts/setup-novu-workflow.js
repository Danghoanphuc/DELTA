#!/usr/bin/env node
/**
 * Complete setup script for Novu delivery-thread-message workflow
 * Run: node scripts/setup-novu-workflow.js
 */

import dotenv from "dotenv";

dotenv.config();

const NOVU_API_KEY = process.env.NOVU_API_KEY;

if (!NOVU_API_KEY) {
  console.error("❌ NOVU_API_KEY not found in .env file");
  process.exit(1);
}

console.log("═══════════════════════════════════════════════════════");
console.log("  Novu Workflow Setup - Delivery Thread Message");
console.log("═══════════════════════════════════════════════════════\n");

async function getOrCreateNotificationGroup() {
  try {
    console.log("📋 Step 1: Fetching notification groups...\n");

    const response = await fetch("https://api.novu.co/v1/notification-groups", {
      method: "GET",
      headers: {
        Authorization: `ApiKey ${NOVU_API_KEY}`,
      },
    });

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} group(s)`);
      console.log(`   Using: ${result.data[0].name} (${result.data[0]._id})\n`);
      return result.data[0]._id;
    }

    console.log("⚠️ No groups found, creating default group...\n");

    const createResponse = await fetch(
      "https://api.novu.co/v1/notification-groups",
      {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${NOVU_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "General" }),
      }
    );

    const newGroup = await createResponse.json();
    console.log(
      `✅ Created group: ${newGroup.data.name} (${newGroup.data._id})\n`
    );

    return newGroup.data._id;
  } catch (error) {
    console.error("❌ Failed to get/create notification group:", error.message);
    throw error;
  }
}

async function createWorkflow(groupId) {
  try {
    console.log("📝 Step 2: Creating workflow...\n");

    const workflowData = {
      name: "Delivery Thread Message",
      description:
        "Notify participants when new message is posted in delivery thread",
      notificationGroupId: groupId,
      tags: ["delivery", "thread", "message"],
      steps: [
        {
          name: "In-App",
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
    };

    const response = await fetch("https://api.novu.co/v1/workflows", {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${NOVU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workflowData),
    });

    if (!response.ok) {
      const error = await response.json();

      if (error.message && error.message.includes("already exists")) {
        console.log(
          "⚠️ Workflow already exists, fetching existing workflow...\n"
        );
        return await getExistingWorkflow();
      }

      throw new Error(JSON.stringify(error, null, 2));
    }

    const workflow = await response.json();
    console.log("✅ Workflow created successfully!\n");

    return workflow.data;
  } catch (error) {
    console.error("❌ Failed to create workflow:", error.message);
    throw error;
  }
}

async function getExistingWorkflow() {
  try {
    const response = await fetch("https://api.novu.co/v1/workflows", {
      method: "GET",
      headers: {
        Authorization: `ApiKey ${NOVU_API_KEY}`,
      },
    });

    const result = await response.json();
    const workflow = result.data.find(
      (w) =>
        w.name === "Delivery Thread Message" ||
        w.triggers?.[0]?.identifier === "delivery-thread-message"
    );

    if (workflow) {
      console.log("✅ Found existing workflow\n");
      return workflow;
    }

    throw new Error("Workflow not found");
  } catch (error) {
    console.error("❌ Failed to get existing workflow:", error.message);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Get or create notification group
    const groupId = await getOrCreateNotificationGroup();

    // Step 2: Create workflow
    const workflow = await createWorkflow(groupId);

    // Step 3: Display results
    console.log("═══════════════════════════════════════════════════════");
    console.log("  ✨ Setup Complete!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("📋 Workflow Details:");
    console.log(`   ID: ${workflow._id}`);
    console.log(`   Name: ${workflow.name}`);
    console.log(
      `   Identifier: ${workflow.triggers?.[0]?.identifier || "N/A"}`
    );
    console.log(`   Active: ${workflow.active}`);
    console.log(`   Steps: ${workflow.steps?.length || 0}`);

    console.log("\n🎯 Next Steps:");
    console.log("   1. ✅ Workflow is ready to use");
    console.log("   2. Update novu.service.ts if needed:");
    console.log('      const workflowId = "delivery-thread-message";');
    console.log("   3. Restart the server");
    console.log("   4. Test by sending a message in delivery thread");

    console.log("\n💡 Workflow Identifier:");
    console.log(`   ${workflow.triggers?.[0]?.identifier || workflow._id}`);

    console.log("\n✨ Done!\n");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    console.log("\n📖 Manual Setup Instructions:");
    console.log("   1. Go to https://web.novu.co");
    console.log("   2. Navigate to Workflows → Create Workflow");
    console.log("   3. Set Name: Delivery Thread Message");
    console.log("   4. Add In-App step with the template");
    console.log("   5. Activate workflow");
    console.log("\n   Or use fallback workflow (already working):");
    console.log('   const workflowId = "chat-notification-fct4";');
    process.exit(1);
  }
}

main();
