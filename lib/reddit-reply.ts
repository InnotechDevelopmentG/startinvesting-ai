import Anthropic from '@anthropic-ai/sdk';
import { RedditPost } from './reddit';

/**
 * Draft an authentic, impactful Reddit reply with a natural product mention.
 *
 * Product routing:
 *   FIRE / retirement / financial independence → startinvesting.ai/fire
 *   Mortgage / home buying → startinvesting.ai/mortgage
 *   Everything else → startinvesting.ai
 */
export async function draftRedditReply(post: RedditPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = post.selftext.slice(0, 600) || '';

  const prompt = `You are a knowledgeable personal finance person replying on Reddit. You also built three free tools:
• startinvesting.ai — investment portfolio simulator (shows compound growth over time)
• startinvesting.ai/fire — FIRE calculator (financial independence number + timeline)
• startinvesting.ai/mortgage — mortgage calculator (monthly payment + amortization)

Subreddit: r/${post.subreddit}
Post: "${post.title}"${body ? `\n"${body}"` : ''}

Write a Reddit reply that:
1. Opens with a specific, concrete answer — use a real number, percentage, or rule of thumb (e.g. "at a 7% average return, $400/month turns into ~$480k over 30 years")
2. Adds 2-3 sentences of genuine insight that actually helps them — address their specific situation, not a generic answer
3. Ends with one casual, natural mention of the most relevant tool as a soft offer, not a pitch:
   - FIRE / retirement / financial independence / savings rate → startinvesting.ai/fire
   - Mortgage / home buying / down payment → startinvesting.ai/mortgage
   - Investing / compound interest / portfolio / index funds → startinvesting.ai
   Phrasing: "i made a free [X] if you want to run your own numbers — startinvesting.ai" or "there's a free calculator for this at startinvesting.ai/fire if useful"
4. 4-5 sentences total — enough to be genuinely helpful, not a wall of text
5. Tone: smart, direct friend who knows this stuff — not a financial advisor, not a marketer, not a bot
6. Reddit-natural: lowercase is fine, contractions are fine, slightly informal is fine
7. Never start with: "Great question", "Absolutely", "As someone who", "It's worth noting", or any filler
8. No bullet points, no bold text, no em dashes used as filler

Return only the reply text.`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return '';
  }
}
