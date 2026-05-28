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

export async function POST(req: NextRequest) {
  try {
    const body: SubscribeBody = await req.json();

    const {
      email,
      age,
      startingAmount,
      frequency,
      contributionAmount,
      years,
      riskProfile,
      projectedValue,
      savingsBenchmark,
    } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
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

    const retirementAge = Math.max(age + years, 65);
    const formattedProjectedValue = formatCurrencyFull(projectedValue);

    try {
      await sendWelcomeEmail({
        email,
        projectedValue,
        retirementAge,
        formattedProjectedValue,
      });
    } catch (emailError) {
      console.error('Resend email error:', emailError);
      // Don't fail the request if email fails — DB insert succeeded
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
