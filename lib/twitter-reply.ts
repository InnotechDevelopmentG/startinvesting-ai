import Anthropic from '@anthropic-ai/sdk';
import { TwitterPost } from './twitter';

/**
 * Draft an authentic, impactful Twitter reply with a natural product mention.
 *
 * Product routing:
 *   FIRE / retirement / financial independence → startinvesting.ai/fire
 *   Mortgage / home buying → startinvesting.ai/mortgage
 *   Everything else → startinvesting.ai
 */
export async function draftReply(post: TwitterPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = post.snippet.slice(0, 400) || '';

  const prompt = `You are Griffen — knowledgeable about personal finance. You built three free tools:
• startinvesting.ai — investment simulator showing compound portfolio growth
• startinvesting.ai/fire — FIRE calculator for financial independence / early retirement
• startinvesting.ai/mortgage — mortgage calculator with amortization breakdown

Tweet from ${post.handle}: "${post.title}"${context ? `\nContext: "${context}"` : ''}

Write a Twitter reply that:
1. Opens with a striking, specific number or insight that stops someone scrolling — make it concrete (e.g. "Starting at 25 vs 35 with $500/month means ~$400k more at 65, even at the same total contribution")
2. Adds 1-2 sentences of context that makes the insight land — explain the "why" briefly
3. Closes with a single very casual, light product mention — almost an afterthought, not a pitch:
   - FIRE / retirement / financial independence / savings rate → startinvesting.ai/fire
   - Mortgage / home buying / down payment → startinvesting.ai/mortgage
   - Investing / compound interest / portfolio / index funds → startinvesting.ai
   Phrasing: "built a free [X] calculator for this → startinvesting.ai" or "free tool if you want to see your numbers: startinvesting.ai/fire"
4. Feels like a real person with genuine expertise sharing something useful — not promotional
5. Strictly under 260 characters total (count every character — Twitter's limit is 280, keep buffer)
6. No hashtags, no filler openers ("Great point!", "Totally!", etc.)

Return only the reply text.`;

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
