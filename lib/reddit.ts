/**
 * Reddit OAuth client using the "client_credentials" grant (read-only, no user login needed).
 * Requires REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET env vars.
 *
 * To get credentials:
 *   1. Go to https://www.reddit.com/prefs/apps
 *   2. Click "create another app" → choose "script"
 *   3. Name: "startinvesting monitor", redirect uri: http://localhost
 *   4. Copy the client_id (under the app name) and client_secret
 */

interface TokenCache {
  token: string;
  expiresAt: number;
}

let _tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'startinvesting.ai/1.0 by startinvesting_bot',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit auth failed ${res.status}: ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  _tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
}

export async function searchSubreddit(subreddit: string, query: string, limit = 10): Promise<RedditPost[]> {
  try {
    const token = await getAccessToken();
    const url = `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=true&sort=new&t=week&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'startinvesting.ai/1.0 by startinvesting_bot',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { children?: { data: RedditPost }[] } };
    return data?.data?.children?.map((c) => c.data) ?? [];
  } catch {
    return [];
  }
}

export async function getSubredditNew(subreddit: string, limit = 15): Promise<RedditPost[]> {
  try {
    const token = await getAccessToken();
    const url = `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'startinvesting.ai/1.0 by startinvesting_bot',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { children?: { data: RedditPost }[] } };
    return data?.data?.children?.map((c) => c.data) ?? [];
  } catch {
    return [];
  }
}
