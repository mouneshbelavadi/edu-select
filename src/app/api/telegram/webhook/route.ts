import { NextRequest, NextResponse } from 'next/server';
import {
  getBotToken,
  setTelegramWebhook,
  getTelegramWebhookInfo,
  processTelegramWebhookUpdate,
  generateBotResponse,
} from '@/lib/telegram/bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await processTelegramWebhookUpdate(body);

    return NextResponse.json({
      ok: true,
      handled: result.handled,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error handling Telegram webhook POST:', error);
    // Telegram requires a 200 response to prevent retry loops on bad payloads
    return NextResponse.json({ ok: false, error: error?.message || 'Internal server error' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = getBotToken();
  const isConfigured = Boolean(token);

  const action = searchParams.get('action');
  const simulateQuery = searchParams.get('simulate');
  const webhookUrl = searchParams.get('url');

  // 1. Simulate command without needing live Telegram connection
  if (simulateQuery) {
    const simResult = await generateBotResponse(simulateQuery, 'Student');
    return NextResponse.json({
      success: true,
      simulation: {
        input: simulateQuery,
        response: simResult.text,
        options: simResult.options,
      },
    });
  }

  // 2. Set Webhook action
  if (action === 'setWebhook' && webhookUrl) {
    const res = await setTelegramWebhook(webhookUrl);
    return NextResponse.json(res);
  }

  // 3. Get Webhook info from Telegram
  if (action === 'getInfo' && isConfigured) {
    const info = await getTelegramWebhookInfo();
    return NextResponse.json({ success: true, webhookInfo: info });
  }

  // Default Status Check
  return NextResponse.json({
    status: 'online',
    service: 'EduSelect Telegram Bot Integration Service',
    tokenConfigured: isConfigured,
    maskedToken: isConfigured && token ? `${token.substring(0, 6)}...${token.slice(-4)}` : null,
    instructions: {
      step1: 'Create bot with @BotFather on Telegram',
      step2: 'Add TELEGRAM_BOT_TOKEN to .env.local',
      step3: 'Call this endpoint with ?action=setWebhook&url=https://your-domain/api/telegram/webhook',
    },
  });
}
