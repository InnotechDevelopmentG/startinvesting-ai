import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = getSupabaseAdminClient();

  const [{ data: submissions }, { data: subscribers }, { data: opportunities }, { data: addressed }] = await Promise.all([
    supabase
      .from('simulator_submissions')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false }),
    // Active: not dismissed, not addressed — newest first
    // Use 'or' to handle both false and null values
    supabase
      .from('reddit_opportunities')
      .select('*')
      .or('dismissed.is.null,dismissed.eq.false')
      .or('addressed.is.null,addressed.eq.false')
      .order('created_at', { ascending: false })
      .limit(50),
    // Completed: addressed=true OR dismissed=true
    supabase
      .from('reddit_opportunities')
      .select('*')
      .or('addressed.eq.true,dismissed.eq.true')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return (
    <AdminDashboard
      submissions={submissions || []}
      subscribers={subscribers || []}
      opportunities={opportunities || []}
      addressed={addressed || []}
    />
  );
}
