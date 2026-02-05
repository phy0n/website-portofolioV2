import CertificateManager from './CertificateManager';
import { createCertificate, updateCertificate, deleteCertificate } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  image: string | null;
  icon: string | null;
  sort_order: number | null;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const { supabase } = await requireAdmin();
  const safeDecode = (value?: string) => {
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const { data: certificates, error } = await supabase
    .from('certificates')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  const certificateRows = (certificates as Certificate[] | null) ?? [];
  const successMessage = safeDecode(searchParams?.success);
  const pageErrorMessage = safeDecode(searchParams?.error);
  const errorMessage =
    pageErrorMessage ?? (error ? `Load certificates failed: ${error.message}` : undefined);

  return (
    <CertificateManager
      certificates={certificateRows}
      createCertificate={createCertificate}
      updateCertificate={updateCertificate}
      deleteCertificate={deleteCertificate}
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
}

