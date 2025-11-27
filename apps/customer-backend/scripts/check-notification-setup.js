// scripts/check-notification-setup.js
// Script để kiểm tra setup notification system

import { notificationQueue } from '../src/infrastructure/queue/notification.queue.js';
import { Logger } from '../src/shared/utils/index.js';

async function checkNotificationSetup() {
  console.log('\n🔍 [Check] Kiểm tra Notification System Setup...\n');

  // Check 1: Redis Connection
  console.log('📋 Check 1: Redis Connection...');
  try {
    const queueHealth = await notificationQueue.getJobCounts();
    console.log('✅ Redis connected!');
    console.log(`   - Waiting: ${queueHealth.waiting}`);
    console.log(`   - Active: ${queueHealth.active}`);
    console.log(`   - Completed: ${queueHealth.completed}`);
    console.log(`   - Failed: ${queueHealth.failed}\n`);
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.error('   → Kiểm tra Redis có đang chạy không?\n');
    return;
  }

  // Check 2: Environment Variables
  console.log('📋 Check 2: Environment Variables...');
  const novuApiKey = process.env.NOVU_API_KEY;
  if (novuApiKey) {
    console.log('✅ NOVU_API_KEY: Set');
    console.log(`   - Length: ${novuApiKey.length} characters\n`);
  } else {
    console.error('❌ NOVU_API_KEY: Missing');
    console.error('   → Thêm NOVU_API_KEY vào .env file\n');
  }

  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || '6379';
  console.log(`✅ Redis Config: ${redisHost}:${redisPort}\n`);

  // Check 3: Queue Status
  console.log('📋 Check 3: Queue Status...');
  try {
    const jobs = await notificationQueue.getJobs(['waiting', 'active', 'failed'], 0, 10);
    if (jobs.length > 0) {
      console.log(`⚠️  Có ${jobs.length} job(s) trong queue:`);
      jobs.forEach((job, idx) => {
        console.log(`   ${idx + 1}. Job ${job.id} - ${job.name} - State: ${job.queue.name}`);
      });
    } else {
      console.log('✅ Queue trống (không có job đang chờ)\n');
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra queue:', error.message);
  }

  console.log('\n✅ [Check] Hoàn tất kiểm tra!\n');
  console.log('📝 Next steps:');
  console.log('   1. Kiểm tra logs server để xem Worker có khởi động không');
  console.log('   2. Gửi một tin nhắn test để kiểm tra end-to-end');
  console.log('   3. Xem logs: [Queue], [Worker], [Novu]\n');
}

checkNotificationSetup().catch(console.error);

