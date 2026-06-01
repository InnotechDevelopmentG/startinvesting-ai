import Anthropic from '@anthropic-ai/sdk';
import { QuoraPost } from './quora';

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

export async function draftQuoraReply(post: QuoraPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = post.snippet.slice(0, 400) || '';
  const tool = getToolInfo(post.title + ' ' + context);

  const prompt = `You are Griffen — a personal finance enthusiast who genuinely loves helping people understand money. You built a free tool at ${tool.url} (a ${tool.name}).

Quora question: "${post.title}"${context ? `\nContext: "${context}"` : ''}

Write a Quora answer that:
1. Opens with the most impactful, specific answer to their question — include a concrete number, percentage, or rule of thumb. Make the first sentence genuinely surprising or clarifying.
2. Adds a concrete example that brings it to life: "for example, someone investing $400/month starting at 28 vs 38 ends up with roughly $340k more at 65 — even with the same total dollars invested"
3. Gives 1-2 more sentences of honest nuance or context — what actually matters, what people get wrong, or a practical next step
4. Closes with one natural, low-pressure mention of the tool:
   Phrasing: "I built a free ${tool.name} that walks through this in detail if you want to see your own numbers — ${tool.url}"
   IMPORTANT: the URL must be exactly: ${tool.url}
5. Tone: smart, direct, genuinely helpful — like a knowledgeable friend, not a financial advisor or product promoter
6. 5-7 sentences total — substantive enough to be the best answer on the page, concise enough to actually be read
7. No bullet points, no bold headers, no markdown — plain conversational paragraphs

Return only the answer text.`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 450,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return '';
  }
}
