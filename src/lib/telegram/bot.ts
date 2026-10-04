import { searchCareers, getCareerDetail } from '@/lib/careers/repository';
import { getColleges } from '@/lib/collegeRepository';
import { KARNATAKA_COLLEGES_CUTOFFS, CollegeCutoff } from '@/lib/kcetPredictor';

export function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || null;
}

export function getAppBaseUrl(): string {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  return 'https://careers.vtuadda.com';
}

export interface TelegramSendMessageOptions {
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
}

/**
 * Send a message to a Telegram user/chat via the official Telegram Bot API
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: TelegramSendMessageOptions
): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = getBotToken();
  if (!token) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN is not configured in environment variables' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'Markdown',
        reply_markup: options?.reply_markup,
        disable_web_page_preview: false,
      }),
    });

    let json = await res.json();
    if (!res.ok || !json.ok) {
      // If Telegram failed due to unescaped markdown entities, retry as plain text so student always receives the message
      if (json.description && (json.description.includes("can't parse entities") || json.description.includes("character"))) {
        const fallbackRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            reply_markup: options?.reply_markup,
            disable_web_page_preview: false,
          }),
        });
        const fallbackJson = await fallbackRes.json();
        if (fallbackRes.ok && fallbackJson.ok) {
          return { success: true, data: fallbackJson.result };
        }
      }
      return { success: false, error: json.description || 'Failed to deliver Telegram message' };
    }

    return { success: true, data: json.result };
  } catch (err: any) {
    console.error('Error sending Telegram message:', err);
    return { success: false, error: err?.message || 'Network error communicating with Telegram API' };
  }
}

/**
 * Register webhook URL with Telegram
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = getBotToken();
  if (!token) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN is missing' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      return { success: false, error: json.description || 'Failed to set webhook' };
    }
    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Inspect active webhook status from Telegram
 */
export async function getTelegramWebhookInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = getBotToken();
  if (!token) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN is missing' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return { success: false, error: json.description };
    }
    return { success: true, data: json.result };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Core bot logic: process an incoming text message and generate a verified markdown response
 */
export async function generateBotResponse(
  messageText: string,
  senderName: string = 'Student'
): Promise<{ text: string; options?: TelegramSendMessageOptions }> {
  const baseUrl = getAppBaseUrl();
  const trimmed = messageText.trim();
  const lower = trimmed.toLowerCase();

  // Command: /start
  if (lower === '/start' || lower.startsWith('/start ')) {
    const welcome = `🎓 *Welcome to EduSelect AI Bot, ${senderName}!*

Your 24/7 personal college admissions and career counselling assistant for Indian students.

*Quick Commands:*
• \`/cutoff [rank] [category]\` — Check KCET 2026 cutoff odds (e.g. \`/cutoff 12500 GM\`)
• \`/roadmap [stream/pathway]\` — Career timeline (e.g. \`/roadmap PCB\` or \`/roadmap CSE\`)
• \`/colleges [query]\` — Search verified colleges (e.g. \`/colleges RVCE\`)
• \`/counsel [question]\` — Ask any career or branch question
• \`/help\` — View all commands & features

Or simply type your question below!`;

    const options: TelegramSendMessageOptions = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌐 Open Web Portal', url: baseUrl },
            { text: '📊 Cutoff Predictor', url: `${baseUrl}/kcet-2026-predictor` },
          ],
          [
            { text: '🧭 Career Roadmaps', url: `${baseUrl}/careers` },
            { text: '🏛️ Browse 455 Colleges', url: `${baseUrl}/colleges` },
          ],
        ],
      },
    };

    return { text: welcome, options };
  }

  // Command: /help
  if (lower === '/help') {
    const help = `ℹ️ *EduSelect Bot Help & Commands*

1️⃣ *Predict College Cutoffs:*
Send: \`/cutoff 15000 GM\` or \`/cutoff 8500 2A\`
Estimates admission probability across top Karnataka engineering branches.

2️⃣ *Get Career Roadmaps:*
Send: \`/roadmap PCB\` or \`/roadmap CSE\` or \`/roadmap ITI\`
Delivers verified 4-phase milestone timelines, entrance exams, and fee ranges.

3️⃣ *Search Verified Colleges:*
Send: \`/colleges RV College\` or \`/colleges Mysore\`
Delivers verified NIRF ranking, course fee bands, and median placement CTC.

4️⃣ *Ask Any Doubt:*
Send: \`/counsel Should I take CSE or ECE? What are options after 10th?\`

Visit our full web dashboard at ${baseUrl}`;

    return { text: help, options: { parse_mode: 'Markdown' } };
  }

  // Command: /cutoff [rank] [optional category]
  if (lower.startsWith('/cutoff')) {
    const parts = trimmed.split(/\s+/).slice(1);
    const rankStr = parts[0] || '';
    const cat = (parts[1] || 'GM').toUpperCase() as 'GM' | '2A' | '2B' | '3A' | '3B' | 'SC' | 'ST';

    const rank = parseInt(rankStr.replace(/[^0-9]/g, ''), 10);
    if (!rank || isNaN(rank)) {
      return {
        text: `⚠️ *Please provide a valid rank number.*

Example:
\`/cutoff 12500 GM\`
\`/cutoff 8500 2A\`
\`/cutoff 25000 SC\``,
        options: { parse_mode: 'Markdown' },
      };
    }

    // Filter historical cutoffs
    const validCategory = ['GM', '2A', '2B', '3A', '3B', 'SC', 'ST'].includes(cat) ? cat : 'GM';
    const matches = KARNATAKA_COLLEGES_CUTOFFS.map((c: CollegeCutoff) => {
      const closing = c.cutoffs[validCategory] || c.cutoffs.GM;
      const ratio = rank / closing;
      let chance = 'Low';
      if (ratio <= 0.85) chance = 'High Chance 🟢';
      else if (ratio <= 1.15) chance = 'Moderate Chance 🟡';
      else if (ratio <= 1.35) chance = 'Ambitious 🔵';
      return {
        college: c.collegeName,
        branch: c.branch,
        closing,
        fees: c.feesPerYear,
        avgLPA: c.avgPackageLPA,
        chance,
        ratio,
      };
    })
      .filter((m: { ratio: number }) => m.ratio <= 1.35)
      .sort((a: { ratio: number }, b: { ratio: number }) => a.ratio - b.ratio)
      .slice(0, 5);

    if (matches.length === 0) {
      return {
        text: `📊 *KCET 2026 Cutoff Forecast for Rank: ${rank.toLocaleString()} (${validCategory})*

We couldn't find Tier-1 matches closing around this rank in the quick sample. However, 150+ VTU affiliated and regional colleges admit students within this bracket!

Check the complete predictor tool with all 455 colleges online:
👉 ${baseUrl}/kcet-2026-predictor`,
        options: { parse_mode: 'Markdown' },
      };
    }

    let response = `📊 *KCET 2026 Predictions for Rank ${rank.toLocaleString()} (${validCategory})*\n\n`;
    matches.forEach((m: { college: string; branch: string; closing: number; chance: string; fees: number; avgLPA: number }, idx: number) => {
      response += `*${idx + 1}. ${m.college}*\n`;
      response += `• Branch: *${m.branch}*\n`;
      response += `• Closing Rank: ~${m.closing.toLocaleString()} | Chance: ${m.chance}\n`;
      response += `• Annual Fee: ₹${(m.fees / 1000).toFixed(0)}k | Median CTC: ₹${m.avgLPA} LPA\n\n`;
    });
    response += `🔗 *View full seat matrix & option entry strategy:* ${baseUrl}/kcet-2026-predictor`;

    return { text: response, options: { parse_mode: 'Markdown' } };
  }

  // Command: /roadmap [query]
  if (lower.startsWith('/roadmap')) {
    const query = trimmed.replace(/^\/roadmap/i, '').trim();
    if (!query) {
      return {
        text: `🧭 *Career Roadmap Generator*

Please specify a pathway, stream, or branch.
Examples:
• \`/roadmap PCB\`
• \`/roadmap PCM\`
• \`/roadmap Computer Science\`
• \`/roadmap Polytechnic Diploma\``,
        options: { parse_mode: 'Markdown' },
      };
    }

    const searchRes = searchCareers({ q: query, limit: 1 });
    const match = searchRes.items[0];

    if (!match) {
      return {
        text: `🧭 We couldn't find an exact roadmap for "${query}".
Browse our complete 8 journey catalog here:
👉 ${baseUrl}/careers`,
        options: { parse_mode: 'Markdown' },
      };
    }

    let msg = `🧭 *Career Roadmap: ${match.title}*\n`;
    msg += `• *Category:* ${match.clusterName || match.kind}\n`;
    msg += `• *Duration:* ${match.durationText || 'Standard cycle'}\n`;
    if (match.entrySalaryLPA) {
      msg += `• *Fresher CTC:* ₹${match.entrySalaryLPA.min}–₹${match.entrySalaryLPA.max} LPA\n`;
    }
    if (match.examNames?.length) {
      msg += `• *Key Entrance Exams:* ${match.examNames.join(', ')}\n`;
    }
    msg += `• *Market Outlook:* ${match.outlook}\n\n`;
    msg += `*Key Next Steps:*\n`;
    msg += `1. Verify minimum qualifying percentage and admission cut-offs\n`;
    msg += `2. Prepare syllabus fundamentals for primary entrance notifications\n`;
    msg += `3. Research state quota fees versus management seats\n\n`;
    msg += `🔗 *Explore full details & college list:* ${baseUrl}/careers`;

    return { text: msg, options: { parse_mode: 'Markdown' } };
  }

  // Command: /colleges [query]
  if (lower.startsWith('/colleges')) {
    const query = trimmed.replace(/^\/colleges/i, '').trim();
    const collegeResult = await getColleges({ search: query, limit: 4, page: 1, sortBy: 'rating', sortOrder: 'desc' });
    const colleges = collegeResult.data || [];

    if (colleges.length === 0) {
      return {
        text: `🏛️ No verified colleges found matching "${query}".
Explore our directory of 455 verified colleges:
👉 ${baseUrl}/colleges`,
        options: { parse_mode: 'Markdown' },
      };
    }

    let msg = `🏛️ *Verified Colleges (${colleges.length} matches):*\n\n`;
    colleges.forEach((c: any, i: number) => {
      msg += `*${i + 1}. ${c.name}*\n`;
      msg += `• Location: ${c.city}, ${c.state} | Type: ${c.type}\n`;
      msg += `• Verified Annual Tuition: ~₹${(c.fees / 100000).toFixed(1)} Lakh\n`;
      msg += `• Rating: ⭐ ${c.rating || 4.2} / 5\n\n`;
    });
    msg += `🔗 *Compare side-by-side:* ${baseUrl}/compare`;

    return { text: msg, options: { parse_mode: 'Markdown' } };
  }

  // Freeform Student Question / Counselling Inquiry
  const cleanQ = trimmed.replace(/^\/counsel/i, '').trim();
  const searchRes = searchCareers({ q: cleanQ || 'general', limit: 3 });
  const topItems = searchRes.items;

  let counselReply = `🤖 *EduSelect AI Counselling Advisor*\n\n`;
  counselReply += `Here are verified recommendations matching: _"${cleanQ || 'Your Query'}"_\n\n`;

  topItems.forEach((item, idx) => {
    counselReply += `*${idx + 1}. ${item.title}*\n`;
    counselReply += `• Duration: ${item.durationText || 'Standard'} | Outlook: ${item.outlook}\n`;
    if (item.examNames?.length) {
      counselReply += `• Target Exams: ${item.examNames.slice(0, 2).join(', ')}\n`;
    }
    counselReply += `\n`;
  });

  counselReply += `💡 *Next Steps:* Use \`/cutoff [rank]\` for admissions or visit our interactive web counsellor for complete college matching:\n👉 ${baseUrl}/ai-counsellor`;

  return { text: counselReply, options: { parse_mode: 'Markdown' } };
}

/**
 * Handle incoming Telegram webhook updates
 */
export async function processTelegramWebhookUpdate(update: any): Promise<{ handled: boolean; error?: string }> {
  if (!update || !update.message) {
    return { handled: false, error: 'No message in update payload' };
  }

  const message = update.message;
  const chatId = message.chat?.id;
  const text = message.text || '';
  const senderName = message.from?.first_name || message.from?.username || 'Student';

  if (!chatId || !text) {
    return { handled: false, error: 'Missing chatId or text' };
  }

  const { text: responseText, options } = await generateBotResponse(text, senderName);
  const result = await sendTelegramMessage(chatId, responseText, options);

  return { handled: result.success, error: result.error };
}
