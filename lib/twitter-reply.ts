import Anthropic from '@anthropic-ai/sdk';
import { TwitterPost } from './twitter';

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

export async function draftReply(post: TwitterPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = post.snippet.slice(0, 400) || '';
  const tool = getToolInfo(post.title + ' ' + context);

  const prompt = `You are Griffen — knowledgeable about personal finance. You built a free tool at ${tool.url} (a ${tool.name}).

Tweet from ${post.handle}: "${post.title}"${context ? `\nContext: "${context}"` : ''}

Write a Twitter reply that:
1. Opens with a striking, specific number or insight that stops someone scrolling — make it concrete (e.g. "Starting at 25 vs 35 with $500/month means ~$400k more at 65, even at the same total contribution")
2. Adds 1-2 sentences of context that makes the insight land — explain the "why" briefly
3. Closes with a single very casual, light product mention — almost an afterthought:
   Phrasing: "built a free ${tool.name} for this → ${tool.url}" or "free tool if you want to see your numbers: ${tool.url}"
   IMPORTANT: the URL must be exactly: ${tool.url}
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
