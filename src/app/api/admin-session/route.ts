import { NextResponse } from 'next/server';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

const supabaseUnavailableResponse = () => {
  const response = NextResponse.json(
    { ok: false, isAdmin: false, error: 'Supabase not configured' },
    { status: 503 }
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

export async function GET() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return supabaseUnavailableResponse();
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return supabaseUnavailableResponse();
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    const response = NextResponse.json({ ok: true, isAdmin: false });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const response = NextResponse.json({ ok: true, isAdmin: !adminError && !!adminRow });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

