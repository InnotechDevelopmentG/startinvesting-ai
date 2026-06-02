import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminPage() {
  const supabase = getSupabaseAdminClient();

  const [
    { data: submissions },
    { data: earlyCaptures },
    { data: subscribers },
    { data: opportunities },
    { data: addressed },
    { data: twitterOpps },
    { data: twitterAddressed },
    { data: quoraOpps },
  ] = await Promise.all([
    // Full simulator completions (contribution_amount is set)
    supabase
      .from('simulator_submissions')
      .select('*')
      .not('contribution_amount', 'is', null)
      .order('created_at', { ascending: false }),
    // Early-capture signups — FIRE/mortgage modal (contribution_amount is null)
    supabase
      .from('simulator_submissions')
      .select('id, email, age, created_at')
      .is('contribution_amount', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('reddit_opportunities')
      .select('*')
      .or('dismissed.is.null,dismissed.eq.false')
      .or('addressed.is.null,addressed.eq.false')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('reddit_opportunities')
      .select('*')
      .or('addressed.eq.true,dismissed.eq.true')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('twitter_opportunities')
      .select('*')
      .limit(400),
    Promise.resolve({ data: [] }),
    // Fetch all quora rows — filter active/completed client-side
    supabase
      .from('quora_opportunities')
      .select('*')
      .limit(400),
  ]);

  return (
    <AdminDashboard
      submissions={submissions || []}
      earlyCaptures={earlyCaptures || []}
      subscribers={subscribers || []}
      opportunities={opportunities || []}
      addressed={addressed || []}
      twitterOpps={twitterOpps || []}
      twitterAddressed={twitterAddressed || []}
      quoraOpps={quoraOpps || []}
    />
  );
}
