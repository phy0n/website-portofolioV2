'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const allowedRedirects = new Set(['/admin', '/admin/blogs', '/admin/quotes']);

const resolveRedirectPath = (formData: FormData) => {
  const target = String(formData.get('redirect_to') || '').trim();
  return allowedRedirects.has(target) ? target : '/admin';
};

const redirectWithError = (path: string, message: string) => {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
};

const redirectWithSuccess = (path: string, message: string) => {
  redirect(`${path}?success=${encodeURIComponent(message)}`);
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const normalizeTags = (value: string) => {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = 5 * 1024 * 1024;

const extractImageFile = (formData: FormData) => {
  const file = formData.get('image_file');
  if (!file || typeof file === 'string') return null;
  if (file instanceof File && file.size > 0) return file;
  return null;
};

const uploadBlogImage = async (
  supabase: Awaited<ReturnType<typeof requireAdmin>>['supabase'],
  file: File | null,
  slug: string,
  redirectTo: string
) => {
  if (!file) return null;

  if (!allowedImageTypes.has(file.type)) {
    redirectWithError(redirectTo, 'Image must be PNG, JPG, or WebP.');
  }

  if (file.size > maxImageBytes) {
    redirectWithError(redirectTo, 'Image must be under 5MB.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `blogs/${slug}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    redirectWithError(redirectTo, `Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
  return data.publicUrl;
};

export async function createBlog(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const title = String(formData.get('title') || '').trim();
  const slugInput = String(formData.get('slug') || '').trim();
  const excerpt = String(formData.get('excerpt') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const author = String(formData.get('author') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const tagsValue = String(formData.get('tags') || '');
  const imageFile = extractImageFile(formData);
  const featuredValue = String(formData.get('featured') || 'standard');
  const statusValue = String(formData.get('is_published') || 'published');
  const featured = featuredValue === 'featured';
  const isPublished = statusValue === 'published';

  if (!title || !excerpt || !content || !author || !date || !category) {
    redirectWithError(redirectTo, 'Missing required blog fields.');
  }

  const slug = slugInput || slugify(title);

  if (!slug) {
    redirectWithError(redirectTo, 'Slug is required.');
  }

  const { supabase } = await requireAdmin();
  const imageUrl = await uploadBlogImage(supabase, imageFile, slug, redirectTo);
  const { error } = await supabase
    .from('blogs')
    .insert({
      title,
      slug,
      excerpt,
      content,
      author,
      date,
      category,
      tags: normalizeTags(tagsValue),
      image: imageUrl,
      featured,
      is_published: isPublished,
    });

  if (error) {
    redirectWithError(redirectTo, `Create blog failed: ${error.message}`);
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  redirectWithSuccess(redirectTo, 'Blog created.');
}

export async function updateBlog(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const slugInput = String(formData.get('slug') || '').trim();
  const excerpt = String(formData.get('excerpt') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const author = String(formData.get('author') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const tagsValue = String(formData.get('tags') || '');
  const imageFile = extractImageFile(formData);
  const currentImage = String(formData.get('current_image') || '').trim();
  const featuredValue = String(formData.get('featured') || 'standard');
  const statusValue = String(formData.get('is_published') || 'published');
  const featured = featuredValue === 'featured';
  const isPublished = statusValue === 'published';

  if (!id || !title || !excerpt || !content || !author || !date || !category) {
    redirectWithError(redirectTo, 'Missing required blog fields.');
  }

  const slug = slugInput || slugify(title);

  if (!slug) {
    redirectWithError(redirectTo, 'Slug is required.');
  }

  const { supabase } = await requireAdmin();
  const uploadedImage = await uploadBlogImage(supabase, imageFile, slug, redirectTo);
  const imageUrl = uploadedImage ?? (currentImage || null);
  const { error } = await supabase
    .from('blogs')
    .update({
      title,
      slug,
      excerpt,
      content,
      author,
      date,
      category,
      tags: normalizeTags(tagsValue),
      image: imageUrl,
      featured,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update blog failed: ${error.message}`);
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  redirectWithSuccess(redirectTo, 'Blog updated.');
}

export async function deleteBlog(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const slug = String(formData.get('slug') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing blog id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('blogs').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete blog failed: ${error.message}`);
  }

  revalidatePath('/blog');
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  redirectWithSuccess(redirectTo, 'Blog deleted.');
}

export async function createQuote(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const date = String(formData.get('date') || '').trim();
  const text = String(formData.get('text') || '').trim();
  const author = String(formData.get('author') || '').trim();

  if (!date || !text) {
    redirectWithError(redirectTo, 'Quote date and text are required.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('quotes')
    .insert({
      date,
      text,
      author: author || null,
    });

  if (error) {
    redirectWithError(redirectTo, `Create quote failed: ${error.message}`);
  }

  revalidatePath('/blog');
  redirectWithSuccess(redirectTo, 'Quote created.');
}

export async function updateQuote(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const text = String(formData.get('text') || '').trim();
  const author = String(formData.get('author') || '').trim();

  if (!id || !date || !text) {
    redirectWithError(redirectTo, 'Missing required quote fields.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('quotes')
    .update({
      date,
      text,
      author: author || null,
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update quote failed: ${error.message}`);
  }

  revalidatePath('/blog');
  redirectWithSuccess(redirectTo, 'Quote updated.');
}

export async function deleteQuote(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing quote id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('quotes').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete quote failed: ${error.message}`);
  }

  revalidatePath('/blog');
  redirectWithSuccess(redirectTo, 'Quote deleted.');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
