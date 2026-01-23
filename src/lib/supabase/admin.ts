import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './server';

export const requireAdmin = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/admin/login');
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    redirect('/admin/login?error=forbidden');
  }

  return { supabase, user };
});
