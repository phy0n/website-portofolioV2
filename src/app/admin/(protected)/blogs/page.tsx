import BlogManager from './BlogManager';
import { createBlog, updateBlog, updateBlogStatus, deleteBlog } from '../actions';
import { requireAdmin } from '@/lib/supabase/admin';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[] | null;
  image: string | null;
  featured: boolean;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
}

export default async function AdminBlogsPage({
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

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('date', { ascending: false });

  const blogRows = (blogs as Blog[] | null) ?? [];
  const successMessage = safeDecode(params?.success);
  const errorMessage = safeDecode(params?.error);

  return (
    <BlogManager
      blogs={blogRows}
      createBlog={createBlog}
      updateBlog={updateBlog}
      updateBlogStatus={updateBlogStatus}
      deleteBlog={deleteBlog}
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
}

