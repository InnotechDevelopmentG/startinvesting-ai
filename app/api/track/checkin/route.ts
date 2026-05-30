import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get('email');
  const response = searchParams.get('response'); // 'yes' | 'no'
  const week = searchParams.get('week'); // YYYY-MM-DD

  if (!email || !response || !week) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const invested = response === 'yes';

  try {
    const supabase = getSupabaseAdminClient();

    await supabase.from('checkins').upsert(
      {
        email: email.toLowerCase(),
        week_of: week,
        invested,
      },
      { onConflict: 'email,week_of' }
    );
  } catch (err) {
    console.error('[track-checkin] DB error:', err);
    // Don't fail the redirect — still take them to the confirmation page
  }

  const redirectUrl = new URL(`/checkin/${response}`, req.url);
  return NextResponse.redirect(redirectUrl);
}
