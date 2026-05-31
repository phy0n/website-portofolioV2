import ProjectManager from './ProjectManager';
import { createProject, updateProject, deleteProject } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
  link: string;
  status: string;
  icon: string | null;
  sort_order: number | null;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function AdminProjectsPage({
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

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  const projectRows = (projects as Project[] | null) ?? [];
  const successMessage = safeDecode(searchParams?.success);
  const pageErrorMessage = safeDecode(searchParams?.error);
  const errorMessage = pageErrorMessage ?? (error ? `Load projects failed: ${error.message}` : undefined);

  return (
    <ProjectManager
      projects={projectRows}
      createProject={createProject}
      updateProject={updateProject}
      deleteProject={deleteProject}
      successMessage={successMessage}
      errorMessage={errorMessage}/>
  );
}

