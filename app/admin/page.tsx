import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminPage() {
  const supabase = getSupabaseAdminClient();

  const [
    { data: submissions },
    { data: subscribers },
    { data: opportunities },
    { data: addressed },
    { data: twitterOpps },
    { data: twitterAddressed },
  ] = await Promise.all([
    supabase
      .from('simulator_submissions')
      .select('*')
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
      .or('dismissed.is.null,dismissed.eq.false')
      .or('addressed.is.null,addressed.eq.false')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('twitter_opportunities')
      .select('*')
      .or('addressed.eq.true,dismissed.eq.true')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  return (
    <AdminDashboard
      submissions={submissions || []}
      subscribers={subscribers || []}
      opportunities={opportunities || []}
      addressed={addressed || []}
      twitterOpps={twitterOpps || []}
      twitterAddressed={twitterAddressed || []}
    />
  );
}
