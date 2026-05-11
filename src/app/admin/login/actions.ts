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

const getAuthErrorMessage = (message: string | undefined, status?: number) => {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return (
      'Supabase Auth rejected this email/password. Make sure the email exists in Authentication > Users ' +
      'for this Supabase project, then reset/set the password from Supabase Auth. A row in public.admin_users alone is not enough.'
    );
  }

  if (normalized.includes('email not confirmed')) {
    return 'This Auth user exists, but the email is not confirmed yet. Confirm the user in Supabase Auth or disable email confirmations for this project.';
  }

  const suffix = message ? `\n\nSupabase Auth says: ${message}${status ? ` (${status})` : ''}` : '';
  return `Login failed at Supabase Auth.${suffix}`;
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
    return { error: getAuthErrorMessage(error.message, error.status) };
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
