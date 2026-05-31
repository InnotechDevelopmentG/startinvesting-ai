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
    supabase
      .from('reddit_opportunities')
      .select('*')
      .neq('dismissed', true)
      .neq('addressed', true)
      .order('created_at', { ascending: false })
      .limit(50),
    // Completed: addressed
    supabase
      .from('reddit_opportunities')
      .select('*')
      .eq('addressed', true)
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
