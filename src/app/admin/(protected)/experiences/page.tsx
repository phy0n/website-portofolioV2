import ExperienceManager from './ExperienceManager';
import { createExperience, updateExperience, deleteExperience } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  status: string;
  sort_order: number | null;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function AdminExperiencesPage({
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

  const { data: experiences, error } = await supabase
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  const experienceRows = (experiences as Experience[] | null) ?? [];
  const successMessage = safeDecode(searchParams?.success);
  const pageErrorMessage = safeDecode(searchParams?.error);
  const errorMessage = pageErrorMessage ?? (error ? `Load experiences failed: ${error.message}` : undefined);

  return (
    <ExperienceManager
      experiences={experienceRows}
      createExperience={createExperience}
      updateExperience={updateExperience}
      deleteExperience={deleteExperience}
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
}

