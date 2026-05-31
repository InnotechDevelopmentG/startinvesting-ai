import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendEarlyWelcomeEmail } from '@/lib/resend';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, age } = await req.json();
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Rate limit: one submission per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('simulator_submissions')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true });
    }

    await supabase.from('simulator_submissions').insert({
      email,
      age: age ?? null,
      starting_amount: null,
      frequency: null,
      contribution_amount: null,
      years: null,
      risk_profile: null,
      projected_value: null,
      savings_benchmark: null,
    });

    // Add to newsletter subscribers for daily market emails
    await supabase
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    try {
      await sendEarlyWelcomeEmail(email);
    } catch (emailErr) {
      console.error('Early capture email error:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Early capture error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
