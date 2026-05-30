import Anthropic from '@anthropic-ai/sdk';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

interface FinnhubQuote {
  c: number;   // current price
  d: number;   // change
  dp: number;  // change percent
  pc: number;  // previous close
}

interface FinnhubNewsItem {
  headline: string;
  summary: string;
  source: string;
  datetime: number;
}

async function fetchFinnhub<T>(path: string): Promise<T | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error('Missing FINNHUB_API_KEY');
  try {
    const res = await fetch(`${FINNHUB_BASE}${path}&token=${key}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function getQuotes(): Promise<string> {
  const symbols = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX'];
  const labels: Record<string, string> = {
    SPY: 'S&P 500', QQQ: 'Nasdaq', DIA: 'Dow', IWM: 'Russell 2000', VIX: 'VIX (fear index)',
  };

  const quotes = await Promise.all(
    symbols.map(async (sym) => {
      const q = await fetchFinnhub<FinnhubQuote>(`/quote?symbol=${sym}`);
      if (!q || !q.c) return null;
      const sign = q.dp >= 0 ? '+' : '';
      return `${labels[sym]}: $${q.c.toFixed(2)} (${sign}${q.dp.toFixed(2)}%)`;
    })
  );
  return quotes.filter(Boolean).join('\n');
}

async function getTopNews(limit = 8): Promise<FinnhubNewsItem[]> {
  const news = await fetchFinnhub<FinnhubNewsItem[]>('/news?category=general&minId=0');
  if (!news || !Array.isArray(news)) return [];
  return news.slice(0, limit);
}

function formatNews(items: FinnhubNewsItem[]): string {
  return items
    .map((n, i) => `${i + 1}. ${n.headline}\n   ${n.summary?.slice(0, 180) ?? ''}`)
    .join('\n\n');
}

export async function generatePreMarketEmail(): Promise<{ subject: string; html: string }> {
  const [quotes, newsItems] = await Promise.all([getQuotes(), getTopNews(8)]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You write a pre-market briefing email for startinvesting.ai. Recipients are everyday investors learning the market — not finance professionals.

DATE: ${today}

CURRENT MARKET DATA (pre-market / futures):
${quotes || 'Market data unavailable'}

OVERNIGHT & MORNING NEWS:
${formatNews(newsItems)}

WRITE a pre-market briefing email with this EXACT structure:

1. Subject line: punchy, specific, includes date. Something like "☀️ Pre-Market May 30 — [key story in 5 words]"
2. Opening line: 1 energetic sentence about what kind of morning it is
3. "THE BIG 3 THINGS TO WATCH" — exactly 3 bullet points, each 1-2 sentences, what matters today and why
4. "NUMBERS CHECK" — paste the market data cleanly
5. "BOTTOM LINE FOR YOU" — 2 sentences, what this means if you're a regular investor just building wealth
6. Closing: fun sign-off, 1 sentence

TONE: Like a smart, slightly funny friend texting you before work. No jargon. No fluff. Direct. Conversational. Occasional light humor is good.
DO NOT give buy/sell advice. Add "Not financial advice" at the very end.

Return ONLY valid JSON (no markdown): {"subject": "...", "body": "full email body as plain text with \\n for line breaks"}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(jsonStr) as { subject: string; body: string };

  return {
    subject: parsed.subject,
    html: buildEmailHtml(parsed.subject, parsed.body, 'pre-market'),
  };
}

export async function generatePostMarketEmail(): Promise<{ subject: string; html: string }> {
  const [quotes, newsItems] = await Promise.all([getQuotes(), getTopNews(10)]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You write a post-market recap email for startinvesting.ai. Recipients are everyday investors learning the market.

DATE: ${today}

TODAY'S CLOSING MARKET DATA:
${quotes || 'Market data unavailable'}

TODAY'S TOP NEWS:
${formatNews(newsItems)}

WRITE a post-market recap email with this EXACT structure:

1. Subject line: punchy recap of the day. E.g. "📊 Market Recap May 30 — [what happened in 5 words]"
2. Opening: 1 line — was it a good day, bad day, boring day?
3. "WHAT HAPPENED TODAY" — 3-4 sentences, the key moves and why. Plain English.
4. "THE WINNERS & LOSERS" — 2-3 bullet points, what sectors/stocks stood out
5. "WHAT IT MEANS FOR YOU" — 2 sentences for a long-term investor. Zoom out perspective.
6. "LOOKING AHEAD" — 1-2 sentences on what to watch tomorrow
7. Fun sign-off

TONE: Casual, smart, like a friend who actually understands markets but doesn't take themselves too seriously. Use light humor. Zero jargon.
DO NOT give buy/sell advice. Add "Not financial advice" at the very end.

Return ONLY valid JSON (no markdown): {"subject": "...", "body": "full email body as plain text with \\n for line breaks"}`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(jsonStr) as { subject: string; body: string };

  return {
    subject: parsed.subject,
    html: buildEmailHtml(parsed.subject, parsed.body, 'post-market'),
  };
}

function buildEmailHtml(subject: string, body: string, type: 'pre-market' | 'post-market'): string {
  const label = type === 'pre-market' ? '☀️ Pre-Market Briefing' : '📊 Market Recap';
  const accent = type === 'pre-market' ? '#00C896' : '#111111';

  const paragraphs = body
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return `<tr><td style="padding:3px 0 3px 16px;font-size:14px;color:#333333;line-height:1.6;">• ${trimmed.replace(/^[•\-]\s*/, '')}</td></tr>`;
      }
      // Section headers (ALL CAPS lines)
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !/^\$/.test(trimmed)) {
        return `<tr><td style="padding:16px 0 6px 0;font-size:11px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:0.1em;">${trimmed}</td></tr>`;
      }
      return `<tr><td style="padding:4px 0;font-size:14px;color:#333333;line-height:1.7;">${trimmed}</td></tr>`;
    })
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
  <tr><td align="center" style="padding:28px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;">

      <!-- Header -->
      <tr><td style="background-color:#111111;padding:18px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><span style="font-size:12px;font-weight:700;color:#00C896;letter-spacing:0.14em;text-transform:uppercase;">startinvesting.ai</span></td>
            <td align="right"><span style="font-size:11px;color:#555555;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">${label}</span></td>
          </tr>
        </table>
      </td></tr>

      <!-- Subject as hero -->
      <tr><td style="padding:24px 28px 8px 28px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0;font-size:20px;font-weight:700;color:#111111;line-height:1.3;">${subject.replace(/^[☀️📊🔔]\s*/, '')}</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:20px 28px 8px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${paragraphs}
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:16px 28px 0 28px;">
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#00C896;border-radius:8px;">
            <a href="https://startinvesting.ai" style="display:inline-block;padding:11px 20px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">See your investment projection →</a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 28px 24px 28px;">
        <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
          You're receiving this because you subscribed at startinvesting.ai &middot;
          Not financial advice &middot; Educational purposes only &middot;
          <a href="https://startinvesting.ai" style="color:#bbbbbb;">Unsubscribe</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
