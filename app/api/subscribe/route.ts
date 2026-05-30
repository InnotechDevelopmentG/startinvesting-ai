import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/resend';
import { formatCurrencyFull } from '@/lib/finance';

interface SubscribeBody {
  email: string;
  age: number;
  startingAmount: number;
  frequency: string;
  contributionAmount: number;
  years: number;
  riskProfile: string;
  projectedValue: number;
  savingsBenchmark: number;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const body: SubscribeBody = await req.json();

    const {
      email: rawEmail,
      age,
      startingAmount,
      frequency,
      contributionAmount,
      years,
      riskProfile,
      projectedValue,
      savingsBenchmark,
    } = body;

    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Rate limit: one submission per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('simulator_submissions')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      // Silent success — don't reveal whether email exists
      return NextResponse.json({ success: true });
    }

    const { error: dbError } = await supabase.from('simulator_submissions').insert({
      email,
      age,
      starting_amount: startingAmount,
      frequency,
      contribution_amount: contributionAmount,
      years,
      risk_profile: riskProfile,
      projected_value: projectedValue,
      savings_benchmark: savingsBenchmark,
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save submission.' }, { status: 500 });
    }

    // Also add to newsletter subscribers so they get daily market emails
    await supabase
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    const retirementAge = Math.max((age || 0) + (years || 0), 65);
    const formattedProjectedValue = formatCurrencyFull(projectedValue);

    try {
      await sendWelcomeEmail({
        email,
        age,
        startingAmount,
        contributionAmount,
        frequency,
        years,
        riskProfile,
        projectedValue,
        retirementAge,
        formattedProjectedValue,
      });
    } catch (emailError) {
      console.error('Resend email error:', emailError);
      // DB insert succeeded — don't fail the request
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
