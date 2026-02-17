import LanguageManager from './LanguageManager';
import { createLanguage, deleteLanguage, updateLanguage } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Language {
  id: string;
  name: string;
  label: string;
  level: number | null;
  sort_order: number | null;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function AdminLanguagesPage({
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

  let languageRows: Language[] = [];
  let loadError: string | undefined;
  try {
    const { data: languages, error } = await supabase
      .from('languages')
      .select('*')
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      loadError = `Load languages failed: ${error.message}`;
    } else {
      languageRows = (languages as Language[] | null) ?? [];
    }
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Load languages failed.';
  }

  const successMessage = safeDecode(searchParams?.success);
  const pageErrorMessage = safeDecode(searchParams?.error);
  const errorMessage = pageErrorMessage ?? loadError;

  return (
    <LanguageManager
      languages={languageRows}
      createLanguage={createLanguage}
      updateLanguage={updateLanguage}
      deleteLanguage={deleteLanguage}
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
}

