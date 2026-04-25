import { mockStocks, type StockCard } from "./mock";

// TODO: Replace with live Finnhub + Anthropic API calls
// Required env vars:
//   FINNHUB_API_KEY    - for real-time quote data
//   ANTHROPIC_API_KEY  - for AI-generated why summaries
//   CLERK_SECRET_KEY   - for auth
//   DATABASE_URL       - for storing user emails / preferences
//   KV_REST_API_URL    - for caching AI summaries (Upstash KV)
//   KV_REST_API_TOKEN  - for Upstash KV auth

export async function getStocks(): Promise<StockCard[]> {
  // TODO: fetch quotes from Finnhub, generate summaries with claude-sonnet-4-6,
  // cache in Upstash KV for 60s, store emails in DB via Clerk
  return mockStocks;
}
