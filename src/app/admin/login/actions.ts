'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type LoginState = {
  error?: string;
};

const getSupabaseProjectRef = (url: string | undefined | null) => {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0] || null;
  } catch {
    return null;
  }
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Login failed. Check your credentials.' };
  }

  const user = data.user;

  if (!user) {
    return { error: 'Login failed. Please try again.' };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError) {
    console.error('Admin lookup failed:', adminError);
    await supabase.auth.signOut();
    const projectRef = getSupabaseProjectRef(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    const details = [adminError.code, adminError.message].filter(Boolean).join(' — ');
    return {
      error:
        `Admin access is not configured yet${projectRef ? ` (project: ${projectRef})` : ''}. ` +
        'Run the Supabase setup SQL and make sure public.admin_users exists.' +
        (details ? `\n\nDetails: ${details}` : ''),
    };
  }

  if (!adminRow) {
    await supabase.auth.signOut();
    return {
      error:
        'Login succeeded, but this account is not allowed to access admin. Add your user UID to the public.admin_users table in Supabase.',
    };
  }

  redirect('/admin');
}
