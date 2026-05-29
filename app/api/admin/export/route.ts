import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const token = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  if (!token || session !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('simulator_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch data.' }, { status: 500 });
  }

  const headers = [
    'Date', 'Email', 'Age', 'Starting Amount', 'Frequency',
    'Contribution', 'Years', 'Risk Profile', 'Projected Value', 'Savings Benchmark',
  ];
  const rows = data.map((s) => [
    new Date(s.created_at).toISOString().split('T')[0],
    s.email,
    s.age,
    s.starting_amount,
    s.frequency,
    s.contribution_amount,
    s.years,
    s.risk_profile,
    s.projected_value,
    s.savings_benchmark,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
