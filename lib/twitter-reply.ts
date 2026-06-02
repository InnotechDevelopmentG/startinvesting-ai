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

  const prompt = `You are Griffen — a personal finance person who built a free tool at ${tool.url} (a ${tool.name}).

Tweet: "${post.title}"${context ? `\nContext: "${context}"` : ''}

Write a short Twitter reply sharing a useful personal finance insight related to this tweet. Rules:
- ALWAYS write the actual reply — never refuse, never explain why you can't, never ask clarifying questions
- Open with one concrete, specific fact or number (e.g. "$500/mo at 25 = ~$1.7M by 65 at 8% — same money at 35 = $750k")
- Add 1 sentence of context or practical takeaway
- End with a casual product mention: "free ${tool.name} → ${tool.url}"
- IMPORTANT: URL must be exactly: ${tool.url}
- Under 260 characters total
- No hashtags, no filler ("Great point!", "Totally agree")
- Sound like a knowledgeable person, not a marketer

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
