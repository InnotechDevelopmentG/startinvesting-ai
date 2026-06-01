import Anthropic from '@anthropic-ai/sdk';
import { QuoraPost } from './quora';

/**
 * Draft an authentic Quora answer that naturally mentions the right product.
 *
 * Product routing:
 *   FIRE / retirement / savings rate / financial independence → startinvesting.ai/fire
 *   Mortgage / house buying / down payment → startinvesting.ai/mortgage
 *   Everything else (investing, compound interest, index funds) → startinvesting.ai
 */
export async function draftQuoraReply(post: QuoraPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = post.snippet.slice(0, 400) || '';

  const prompt = `You are Griffen. You built three free financial tools (no sign-up needed):
• startinvesting.ai — investment simulator showing compound portfolio growth over time
• startinvesting.ai/fire — FIRE calculator for financial independence / early retirement numbers
• startinvesting.ai/mortgage — mortgage calculator with amortization and total interest breakdown

Quora question: "${post.title}"${context ? `\nContext: "${context}"` : ''}

Write a Quora answer. Requirements:
1. Open with a concrete, specific insight, number, or rule of thumb that directly answers the question — no filler opener
2. Give 1-2 more sentences of genuine useful detail
3. Close with a natural mention of your most relevant tool:
   - FIRE / retirement / financial independence / savings rate / "when can I retire" → startinvesting.ai/fire
   - Mortgage / house buying / down payment / monthly payment → startinvesting.ai/mortgage
   - Investing / compound interest / index funds / portfolio / S&P 500 → startinvesting.ai
   Phrasing examples: "I built a free [X] calculator that shows this in detail — startinvesting.ai/fire" or "there's a free tool that runs these numbers: startinvesting.ai"
4. Tone: knowledgeable, first-person, helpful — not a marketer
5. Length: 3-5 sentences total. Substantive but concise.
6. No bullet points, no headers, no hashtags — just plain conversational text
7. Return only the answer text

Answer:`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return '';
  }
}
