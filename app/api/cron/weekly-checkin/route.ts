import { NextRequest, NextResponse } from 'next/server';
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

function frequencyPeriodLabel(freq: string): string {
  const map: Record<string, string> = {
    weekly: 'this week',
    biweekly: 'these past two weeks',
    monthly: 'this month',
    quarterly: 'this quarter',
    annually: 'this year',
  };
  return map[freq] ?? 'this period';
}

function frequencyShortLabel(freq: string): string {
  const map: Record<string, string> = {
    weekly: 'weekly',
    biweekly: 'every two weeks',
    monthly: 'monthly',
    quarterly: 'quarterly',
    annually: 'annually',
  };
  return map[freq] ?? freq;
}

function formatDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function buildCheckinHtml(params: {
  email: string;
  contributionAmount: number;
  frequency: string;
  projectedValue: number;
  weekOf: string;
  encodedEmail: string;
}): string {
  const { contributionAmount, frequency, projectedValue, weekOf, encodedEmail } = params;
  const amountFormatted = formatDollar(contributionAmount);
  const periodLabel = frequencyPeriodLabel(frequency);
  const freqShort = frequencyShortLabel(frequency);
  const projFormatted = formatDollar(projectedValue);

  const baseUrl = 'https://startinvesting.ai';
  const yesUrl = `${baseUrl}/api/track/checkin?email=${encodedEmail}&response=yes&week=${weekOf}`;
  const noUrl = `${baseUrl}/api/track/checkin?email=${encodedEmail}&response=no&week=${weekOf}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <tr><td style="background-color:#111111;padding:20px 32px;">
        <span style="font-size:12px;font-weight:700;color:#00C896;letter-spacing:0.14em;text-transform:uppercase;">startinvesting.ai</span>
      </td></tr>

      <!-- Main content -->
      <tr><td style="padding:36px 32px 28px 32px;">
        <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Weekly Check-In</p>
        <p style="margin:0 0 20px 0;font-size:26px;font-weight:700;color:#111111;line-height:1.2;">Did you invest ${periodLabel}?</p>

        <!-- Amount highlight -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fffe;border:1.5px solid #d0f5ea;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:20px 22px;">
            <p style="margin:0 0 4px 0;font-size:13px;color:#555555;">According to your plan, you should invest</p>
            <p style="margin:0 0 4px 0;font-size:36px;font-weight:700;color:#111111;letter-spacing:-1px;line-height:1;">${amountFormatted}</p>
            <p style="margin:0;font-size:13px;color:#888888;">${freqShort} &middot; on track to reach ${projFormatted}</p>
          </td></tr>
        </table>

        <p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;">
          Consistency is everything. Each contribution — no matter how small — compounds over time. Tap below to let us know how it went.
        </p>

        <!-- Yes/No buttons -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr>
            <td style="padding-right:8px;" width="50%">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="background-color:#00C896;border-radius:10px;">
                  <a href="${yesUrl}" style="display:block;padding:16px 12px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">
                    &#10003;&nbsp; Yes, I invested!
                  </a>
                </td></tr>
              </table>
            </td>
            <td style="padding-left:8px;" width="50%">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="background-color:#f3f4f6;border-radius:10px;">
                  <a href="${noUrl}" style="display:block;padding:16px 12px;font-size:15px;font-weight:700;color:#555555;text-decoration:none;text-align:center;">
                    Not yet
                  </a>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 0 0;font-size:11px;color:#cccccc;text-align:center;">Takes one tap. No login needed.</p>
      </td></tr>

      <!-- Tip box -->
      <tr><td style="padding:0 32px 28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:10px;">
          <tr><td style="padding:18px 22px;">
            <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Quick tip</p>
            <p style="margin:0;font-size:13px;color:#dddddd;line-height:1.6;">
              Set up auto-invest so your contributions happen automatically — no willpower required. Link your bank once and let the math do the work.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:0 32px 28px 32px;">
        <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
          You're receiving this because you created an investing plan at startinvesting.ai &middot; Educational purposes only &middot; Not financial advice.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

interface Submission {
  email: string;
  contribution_amount: number;
  frequency: string;
  projected_value: number;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Get the Saturday date for this week (week_of key)
    const now = new Date();
    const weekOf = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all completed simulator submissions (has contribution_amount)
    const { data: submissions, error } = await supabase
      .from('simulator_submissions')
      .select('email, contribution_amount, frequency, projected_value, created_at')
      .not('contribution_amount', 'is', null)
      .not('frequency', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No completed submissions' });
    }

    // Deduplicate: keep only latest submission per email
    const seen = new Set<string>();
    const unique: Submission[] = [];
    for (const s of submissions) {
      if (!seen.has(s.email)) {
        seen.add(s.email);
        unique.push(s as Submission);
      }
    }

    // Send emails
    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;

    for (const sub of unique) {
      const encodedEmail = encodeURIComponent(sub.email);
      const subject = `Did you invest this ${sub.frequency === 'weekly' ? 'week' : sub.frequency === 'monthly' ? 'month' : sub.frequency === 'biweekly' ? 'two weeks' : 'period'}? (${formatDollar(sub.contribution_amount)} check-in)`;
      const html = buildCheckinHtml({
        email: sub.email,
        contributionAmount: sub.contribution_amount,
        frequency: sub.frequency,
        projectedValue: sub.projected_value,
        weekOf,
        encodedEmail,
      });

      try {
        await resend.emails.send({
          from: 'hello@startinvesting.ai',
          to: sub.email,
          subject,
          html,
        });
        sent++;
      } catch (emailErr) {
        console.error(`[weekly-checkin] Failed to send to ${sub.email}:`, emailErr);
      }
    }

    console.log(`[weekly-checkin] Sent to ${sent}/${unique.length} subscribers`);
    return NextResponse.json({ success: true, sent, total: unique.length, weekOf });
  } catch (err) {
    console.error('[weekly-checkin] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
