/**
 * Reddit RSS-based reader — no credentials needed.
 * Reddit's RSS feeds are publicly accessible without OAuth.
 */

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  permalink: string;
  created_utc: number;
}

function extractId(url: string): string {
  // permalink like /r/personalfinance/comments/abc123/title/
  const match = url.match(/\/comments\/([a-z0-9]+)\//i);
  return match ? match[1] : url;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchRss(url: string): Promise<RedditPost[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; startinvesting.ai reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const posts: RedditPost[] = [];
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

    for (const item of items) {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ??
                         item.match(/<title>(.*?)<\/title>/);
      const linkMatch  = item.match(/<link>(.*?)<\/link>/) ??
                         item.match(/<guid[^>]*>(.*?)<\/guid>/);
      const descMatch  = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ??
                         item.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch  = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const subMatch   = item.match(/\/r\/([^/]+)\//);

      if (!titleMatch || !linkMatch) continue;

      const title = titleMatch[1].trim();
      const permalink = linkMatch[1].trim();
      const selftext = descMatch ? stripHtml(descMatch[1]).slice(0, 500) : '';
      const subreddit = subMatch ? subMatch[1] : '';
      const created_utc = dateMatch ? new Date(dateMatch[1]).getTime() / 1000 : Date.now() / 1000;
      const id = extractId(permalink);

      // Skip non-post links, deleted, and announcements
      if (!permalink.includes('/comments/')) continue;
      if (title === '[deleted]' || title === '[removed]') continue;

      posts.push({ id, subreddit, title, selftext, permalink, created_utc });
    }

    return posts;
  } catch {
    return [];
  }
}

export async function searchSubreddit(subreddit: string, query: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(query)}&restrict_sr=on&sort=new&t=week`;
  return fetchRss(url);
}

export async function getSubredditNew(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.rss?limit=25`;
  return fetchRss(url);
}
