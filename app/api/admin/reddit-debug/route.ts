import { NextRequest, NextResponse } from 'next/server';

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // Test 1: RSS feed
  try {
    const r = await fetch(
      'https://www.reddit.com/r/personalfinance/search.rss?q=invest&restrict_sr=on&sort=new&t=week',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; startinvesting.ai)' } }
    );
    const text = await r.text();
    results.rss = { status: r.status, bodyPreview: text.slice(0, 300), itemCount: (text.match(/<item>/g) ?? []).length };
  } catch (e) {
    results.rss = { error: String(e) };
  }

  // Test 2: JSON API (no auth)
  try {
    const r = await fetch(
      'https://www.reddit.com/r/personalfinance/new.json?limit=3',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; startinvesting.ai)' } }
    );
    const text = await r.text();
    results.jsonApi = { status: r.status, bodyPreview: text.slice(0, 300) };
  } catch (e) {
    results.jsonApi = { error: String(e) };
  }

  // Test 3: OAuth (if creds present)
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (clientId && clientSecret) {
    try {
      const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const r = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'startinvesting.ai/1.0 by startinvesting_bot',
        },
        body: 'grant_type=client_credentials',
      });
      const data = await r.json();
      results.oauth = { status: r.status, response: data };
    } catch (e) {
      results.oauth = { error: String(e) };
    }
  } else {
    results.oauth = { skipped: 'No REDDIT_CLIENT_ID/SECRET env vars set' };
  }

  return NextResponse.json(results, { status: 200 });
}
