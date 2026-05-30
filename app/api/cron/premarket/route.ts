import { NextRequest, NextResponse } from 'next/server';
import { generatePreMarketEmail } from '@/lib/market-email-generator';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { Resend } from 'resend';

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');
  return isVercelCron || authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Generate email content
    const { subject, html } = await generatePreMarketEmail();

    // 2. Get all newsletter subscribers
    const supabase = getSupabaseAdminClient();
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email');

    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscribers yet' });
    }

    // 3. Send in batches of 50
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emails = subscribers.map((s) => s.email as string);
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await Promise.all(
        batch.map((to) =>
          resend.emails.send({
            from: 'markets@startinvesting.ai',
            to,
            subject,
            html,
          })
        )
      );
      sent += batch.length;
    }

    console.log(`[premarket-cron] Sent to ${sent} subscribers`);
    return NextResponse.json({ success: true, sent, subject });
  } catch (err) {
    console.error('[premarket-cron] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
