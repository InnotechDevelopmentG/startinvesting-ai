import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendMortgageReportEmail } from '@/lib/resend';

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
      await sendMortgageReportEmail({
        email,
        homePrice: body.homePrice ?? 0,
        downPayment: body.downPayment ?? 0,
        annualRate: body.annualRate ?? 0,
        termYears: body.termYears ?? 30,
        totalMonthly: body.totalMonthly ?? 0,
        monthlyPI: body.monthlyPI ?? 0,
        monthlyTax: body.monthlyTax ?? 0,
        monthlyInsurance: body.monthlyInsurance ?? 0,
        monthlyPMI: body.monthlyPMI ?? 0,
        totalInterest: body.totalInterest ?? 0,
        totalCost: body.totalCost ?? 0,
        principal: body.principal ?? 0,
        requiresPMI: body.requiresPMI ?? false,
      });
    } catch (emailErr) {
      console.error('Mortgage report email error:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mortgage report route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
