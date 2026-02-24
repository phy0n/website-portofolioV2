import { requireAdmin } from '@/lib/supabase/admin';
import { signOut } from './actions';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <AdminShell email={user.email ?? 'admin'} signOutAction={signOut}>
      {children}
    </AdminShell>
  );
}
