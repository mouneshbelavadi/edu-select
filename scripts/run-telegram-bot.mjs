import fs from 'fs';
import path from 'path';

// 1. Read token from .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
let token = process.env.TELEGRAM_BOT_TOKEN;

if (!token && fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('TELEGRAM_BOT_TOKEN=')) {
      token = trimmed.split('=')[1]?.replace(/["']/g, '').trim();
      break;
    }
  }
}

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment or .env.local');
  process.exit(1);
}

console.log(`🤖 Starting EduSelect Telegram Bot Runner...`);
console.log(`🔑 Using token: ${token.substring(0, 8)}...${token.slice(-4)}`);

async function main() {
  // 1. Remove existing webhook so we can receive pending & live updates via polling
  try {
    const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
    const delJson = await delRes.json();
    console.log('🔄 Webhook status:', delJson.description || 'Webhook removed for local live testing');
  } catch (err) {
    console.warn('⚠️ Could not delete webhook:', err.message);
  }

  let offset = 0;
  console.log('✅ Listening for live Telegram messages from students...\nPress Ctrl+C to stop.\n');

  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          console.log(`📩 Received message from @${msg.from?.username || msg.from?.first_name || 'User'} (${msg.chat.id}): "${msg.text}"`);

          // Send update to local webhook endpoint
          try {
            const hookRes = await fetch('http://localhost:3000/api/telegram/webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(update),
            });
            const hookJson = await hookRes.json();
            if (hookJson.handled) {
              console.log(`  ↪️ Replied successfully to chat ${msg.chat.id}`);
            } else {
              console.log(`  ⚠️ Handler returned:`, hookJson);
            }
          } catch (postErr) {
            console.error(`  ❌ Error delivering update to local endpoint:`, postErr.message);
          }
        }
      }
    } catch (loopErr) {
      console.error('⚠️ Polling error:', loopErr.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

main().catch(console.error);
