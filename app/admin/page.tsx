import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = getSupabaseAdminClient();
  const { data: submissions, error } = await supabase
    .from('simulator_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin fetch error:', error);
  }

  return <AdminDashboard submissions={submissions || []} />;
}
