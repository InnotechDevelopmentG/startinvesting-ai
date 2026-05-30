import Anthropic from '@anthropic-ai/sdk';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export interface GeneratedArticle {
  title: string;
  slug: string;
  seo_description: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
}

interface FinnhubNewsItem {
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
}

interface FinnhubQuote {
  c: number;  // current price
  d: number;  // change
  dp: number; // change percent
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

async function getMarketData(): Promise<string> {
  const [spyQuote, qqqQuote, diaQuote] = await Promise.all([
    fetchFinnhub<FinnhubQuote>('/quote?symbol=SPY'),
    fetchFinnhub<FinnhubQuote>('/quote?symbol=QQQ'),
    fetchFinnhub<FinnhubQuote>('/quote?symbol=DIA'),
  ]);

  const fmt = (q: FinnhubQuote | null, label: string) => {
    if (!q || !q.c) return '';
    const sign = q.dp >= 0 ? '+' : '';
    return `${label}: $${q.c.toFixed(2)} (${sign}${q.dp.toFixed(2)}%)`;
  };

  return [
    fmt(spyQuote, 'S&P 500 (SPY)'),
    fmt(qqqQuote, 'NASDAQ (QQQ)'),
    fmt(diaQuote, 'DOW (DIA)'),
  ]
    .filter(Boolean)
    .join(' | ');
}

async function getTopNews(): Promise<FinnhubNewsItem[]> {
  const news = await fetchFinnhub<FinnhubNewsItem[]>('/news?category=general&minId=0');
  if (!news || !Array.isArray(news)) return [];
  // Return top 10 most recent items
  return news.slice(0, 10);
}

function formatNewsForPrompt(items: FinnhubNewsItem[]): string {
  return items
    .map((n, i) => `${i + 1}. ${n.headline}\n   ${n.summary?.slice(0, 200) ?? ''}`)
    .join('\n\n');
}

function slugify(title: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '');
  return `${base}-${dateStr}`;
}

function getTimeLabel(date: Date): string {
  const pstHour = (date.getUTCHours() - 8 + 24) % 24;
  if (pstHour < 7) return 'Pre-Market';
  if (pstHour < 12) return 'Morning';
  if (pstHour < 16) return 'Midday';
  return 'Afternoon';
}

export async function generateNewsArticle(): Promise<GeneratedArticle> {
  const [marketData, newsItems] = await Promise.all([
    getMarketData(),
    getTopNews(),
  ]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeLabel = getTimeLabel(now);

  const prompt = `You are a financial writer for startinvesting.ai — a site that helps everyday people start investing. Write a brief, engaging market update article based on today's real news and market data.

TODAY: ${dateStr} (${timeLabel} Update)

MARKET DATA:
${marketData || 'Market data unavailable — focus on news.'}

TOP FINANCIAL NEWS:
${formatNewsForPrompt(newsItems)}

INSTRUCTIONS:
- Write for beginners who are learning to invest — no jargon, no fluff
- Length: 350-500 words total
- Tone: clear, direct, slightly conversational — like a smart friend explaining the news
- Include SEO keywords naturally: "stock market today", "investing news", "S&P 500", "market update", the date
- Do NOT make up numbers or data not provided above
- Do NOT give specific buy/sell advice
- End with 1 sentence connecting to why this matters for long-term investors

Return ONLY valid JSON in this exact format (no markdown code blocks, just raw JSON):
{
  "title": "SEO-optimized headline including date and key topic (max 65 chars)",
  "seo_description": "Meta description 150-160 chars with keywords",
  "summary": "2-sentence summary for article listing cards",
  "content": "Full article as plain paragraphs separated by \\n\\n. No markdown. 4-5 paragraphs.",
  "category": "market-update",
  "tags": ["stock market today", "investing news", "S&P 500", "market update", "up to 3 more relevant tags"]
}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  // Strip any accidental markdown code fences
  const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(jsonStr) as Omit<GeneratedArticle, 'slug'>;

  return {
    ...parsed,
    slug: slugify(parsed.title, now),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
  };
}
