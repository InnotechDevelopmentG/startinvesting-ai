import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendFIREReportEmail } from '@/lib/resend';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    await supabase
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    try {
      await sendFIREReportEmail({
        email,
        fireNumber: body.fireNumber ?? 0,
        yearsToFIRE: body.yearsToFIRE ?? null,
        fireAge: body.fireAge ?? null,
        monthlyContribution: body.monthlyContribution ?? 0,
        annualSpending: body.annualSpending ?? 0,
        currentAge: body.currentAge ?? 0,
        currentSavings: body.currentSavings ?? 0,
        withdrawalRate: body.withdrawalRate ?? 4,
        realAnnualReturnPct: body.realAnnualReturnPct ?? 0,
        progressPercent: body.progressPercent ?? 0,
        coastFireNumber: body.coastFireNumber ?? 0,
      });
    } catch (emailErr) {
      console.error('FIRE report email error:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('FIRE report route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
