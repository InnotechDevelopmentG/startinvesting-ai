import Anthropic from '@anthropic-ai/sdk';
import { TwitterPost } from './twitter';

/**
 * Draft an authentic reply to a tweet that naturally mentions the right product.
 *
 * Product routing:
 *   FIRE / retirement / savings rate / financial independence → startinvesting.ai/fire
 *   Mortgage / house buying / down payment → startinvesting.ai/mortgage
 *   Everything else (investing, compound interest, index funds) → startinvesting.ai
 */
export async function draftReply(post: TwitterPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = post.snippet.slice(0, 400) || '';

  const prompt = `You are Griffen. You built three free financial tools (no sign-up needed):
• startinvesting.ai — investment simulator: enter age, contributions, timeline and risk to see compound portfolio growth
• startinvesting.ai/fire — FIRE calculator: find your financial independence number and when you can retire early
• startinvesting.ai/mortgage — mortgage calculator: monthly payment, amortization, and total interest breakdown

Tweet from ${post.handle}: "${post.title}"${context ? `\nContext: "${context}"` : ''}

Write a Twitter reply. Requirements:
1. Open with one concrete, useful insight or number that directly helps the person — no filler ("Great question!", "Totally!", etc.)
2. Close with a natural, low-key mention of the most relevant tool:
   - FIRE / retirement / financial independence / savings rate / "when can I retire" → startinvesting.ai/fire
   - Mortgage / buying a house / down payment / monthly payment → startinvesting.ai/mortgage
   - Investing / compound interest / index funds / portfolio / S&P 500 → startinvesting.ai
   Format: "I built a free [X] calculator if it helps — [url]" or "there's a free [X] tool at [url]" or similar natural phrasing
3. Tone: direct, knowledgeable friend — not a marketer. First person. Conversational.
4. Strictly under 240 characters total (Twitter limit — count carefully)
5. No hashtags
6. Return only the reply text, no quotes

Reply:`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return '';
  }
}
