import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = getSupabaseAdminClient();

  const [{ data: submissions }, { data: subscribers }] = await Promise.all([
    supabase
      .from('simulator_submissions')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <AdminDashboard
      submissions={submissions || []}
      subscribers={subscribers || []}
    />
  );
}
