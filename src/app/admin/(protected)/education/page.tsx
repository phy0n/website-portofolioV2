import EducationManager from './EducationManager';
import { createEducation, updateEducation, deleteEducation } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  period: string;
  location: string | null;
  description: string | null;
  highlights: string[];
  sort_order: number | null;
  is_published: boolean | null;
  show_on_phion: boolean | null;
  show_on_main: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function AdminEducationPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const safeDecode = (value?: string) => {
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const { data: education, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  const educationRows = (education as Education[] | null) ?? [];
  const successMessage = safeDecode(params?.success);
  const pageErrorMessage = safeDecode(params?.error);
  const errorMessage = pageErrorMessage ?? (error ? `Load education failed: ${error.message}` : undefined);

  return (
    <EducationManager
      education={educationRows}
      createEducation={createEducation}
      updateEducation={updateEducation}
      deleteEducation={deleteEducation}
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
}

