import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60;

type CertificateRow = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  image?: string | null;
  icon?: string | null;
  sort_order?: number | null;
};

const normalizeCertificate = (value: any): CertificateRow | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const issuer = String(value?.issuer ?? '').trim();
  const date = String(value?.date ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const image = typeof value?.image === 'string' ? value.image : null;
  const iconRaw = typeof value?.icon === 'string' ? value.icon : '';
  const icon = iconRaw.trim() ? iconRaw.trim() : null;
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;

  if (!id || !title || !issuer || !date || !status || !description) return null;
  return { id, title, issuer, date, status, description, image, icon, sort_order };
};

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { certificates: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('certificates')
      .select(
        'id, title, issuer, date, status, description, image, icon, sort_order, is_published, show_on_phion'
      )
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json(
        { certificates: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const certificates = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeCertificate)
      .filter((row): row is CertificateRow => Boolean(row));

    return NextResponse.json(
      { certificates },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { certificates: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
