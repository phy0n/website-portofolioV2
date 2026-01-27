import { requireAdmin } from '@/lib/supabase/admin';
import { signOut } from './actions';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f16] to-[#151525] text-white">
      <AdminSidebar email={user.email ?? 'admin'} signOutAction={signOut} />
      <main data-page-content className="min-h-screen pl-80 pr-6 py-10 lg:pr-12">
        {children}
      </main>
    </div>
  );
}
