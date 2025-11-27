// scripts/test-notification-flow.js
// Script để test luồng notification từ backend đến frontend

import { addNotificationJob } from '../src/infrastructure/queue/notification.queue.js';
import { Logger } from '../src/shared/utils/index.js';

async function testNotificationFlow() {
  console.log('\n🧪 [Test] Bắt đầu kiểm tra luồng notification...\n');

  // Test 1: Kiểm tra Queue có hoạt động không
  console.log('📋 Test 1: Gửi test job vào Queue...');
  try {
    await addNotificationJob('chat-notify', {
      userId: 'test-user-123',
      message: 'Test notification message',
      conversationId: 'test-conv-456',
      senderName: 'Test User'
    });
    console.log('✅ Test 1 PASSED: Job đã được thêm vào Queue\n');
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message);
    console.error('   → Kiểm tra Redis có đang chạy không?\n');
    return;
  }

  // Test 2: Kiểm tra Worker có đang chạy không
  console.log('📋 Test 2: Kiểm tra Worker...');
  console.log('   → Xem logs của server để kiểm tra:');
  console.log('   → Tìm dòng "[Worker] 🚀 Notification Worker started"');
  console.log('   → Nếu không thấy, Worker chưa được khởi động\n');

  // Test 3: Kiểm tra Novu Service
  console.log('📋 Test 3: Kiểm tra Novu Service...');
  console.log('   → Kiểm tra env variable: NOVU_API_KEY');
  console.log('   → Xem logs để tìm: "[Novu] Service initialized"');
  console.log('   → Nếu thấy warning về NOVU_API_KEY, cần set env variable\n');

  // Test 4: Kiểm tra Frontend
  console.log('📋 Test 4: Kiểm tra Frontend...');
  console.log('   → Mở browser console');
  console.log('   → Kiểm tra có lỗi về VITE_NOVU_APPLICATION_IDENTIFIER không');
  console.log('   → Kiểm tra NotificationInbox component có render không\n');

  console.log('✅ [Test] Hoàn tất checklist. Xem logs ở trên để debug.\n');
}

testNotificationFlow().catch(console.error);

