import Anthropic from '@anthropic-ai/sdk';
import { RedditPost } from './reddit';

/**
 * Determine the correct tool to mention based on post content.
 * Done in code — not left to Claude — so the URL is always right.
 */
function getToolInfo(text: string): { url: string; name: string } {
  const t = text.toLowerCase();
  if (/fire\b|financial independence|retire early|retirement|when can i retire|savings rate|4% rule|coast fire|lean fire|fat fire/i.test(t)) {
    return { url: 'startinvesting.ai/fire', name: 'FIRE calculator' };
  }
  if (/mortgage|home buy|first home|down payment|monthly payment|afford.*house|house.*afford/i.test(t)) {
    return { url: 'startinvesting.ai/mortgage', name: 'mortgage calculator' };
  }
  return { url: 'startinvesting.ai', name: 'investment calculator' };
}

export async function draftRedditReply(post: RedditPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = post.selftext.slice(0, 600) || '';
  const tool = getToolInfo(post.title + ' ' + body);

  const prompt = `You are a knowledgeable personal finance person replying on Reddit. You also built a free tool at ${tool.url} (a ${tool.name}).

Subreddit: r/${post.subreddit}
Post: "${post.title}"${body ? `\n"${body}"` : ''}

Write a Reddit reply that:
1. Opens with a specific, concrete answer — use a real number, percentage, or rule of thumb (e.g. "at a 7% average return, $400/month turns into ~$480k over 30 years")
2. Adds 2-3 sentences of genuine insight that actually helps them — address their specific situation, not a generic answer
3. Ends with one casual, natural mention of the tool as a soft offer, not a pitch:
   Phrasing: "i made a free ${tool.name} if you want to run your own numbers — ${tool.url}" or "there's a free calculator for this at ${tool.url} if useful"
   IMPORTANT: the URL must be exactly: ${tool.url}
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
