# strike while it's hot

Real-time dashboard showing the top 20 most-watched US stocks with AI-generated explanations of why each one is moving.

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Recharts** for sparklines
- **Finnhub** for live quote data
- **Anthropic Claude** for AI summaries
- **Upstash KV** for caching
- **Clerk** for auth
- **Vercel** for hosting

## Env Vars

Create a `.env.local` file (never commit this):

```bash
FINNHUB_API_KEY=        # finnhub.io — free tier
ANTHROPIC_API_KEY=      # console.anthropic.com
CLERK_SECRET_KEY=       # clerk.com
DATABASE_URL=           # Vercel Postgres or Supabase
KV_REST_API_URL=        # upstash.com
KV_REST_API_TOKEN=      # upstash.com
```

## Dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
