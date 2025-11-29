// Quick test script to verify tool definitions
import { ChatToolService } from "./src/modules/chat/chat.tools.service.js";

const toolService = new ChatToolService();
const tools = toolService.getToolDefinitions();

console.log("✅ Tool Definitions Loaded:");
console.log(`📊 Total tools: ${tools.length}\n`);

tools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.function.name}`);
  console.log(`   Description: ${tool.function.description}`);
  console.log(
    `   Parameters:`,
    Object.keys(tool.function.parameters.properties)
  );
  console.log("");
});

if (tools.length === 0) {
  console.error("❌ ERROR: No tools defined!");
  process.exit(1);
}

console.log("✅ All tools loaded successfully!");
console.log("\n🧪 Test prompts:");
console.log('- "Tìm nhà in ở Hà Nội"');
console.log('- "Tôi muốn in card visit"');
console.log('- "Đơn hàng của tôi"');
