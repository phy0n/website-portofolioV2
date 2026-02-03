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
const blogImagesBucket =
  process.env.SUPABASE_BLOG_IMAGE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_BLOG_IMAGE_BUCKET ||
  'blog-images';

type UploadableImage = Blob & { name?: string };

const extensionFromMimeType = (mimeType: string) => {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
};

const extractImageFile = (formData: FormData): UploadableImage | null => {
  const file = formData.get('image_file');
  if (!file || typeof file === 'string') return null;
  const candidate = file as unknown as { size?: unknown; arrayBuffer?: unknown };
  const size = typeof candidate.size === 'number' ? candidate.size : 0;
  const hasArrayBuffer = typeof candidate.arrayBuffer === 'function';
  if (size > 0 && hasArrayBuffer) return file as UploadableImage;
  return null;
};

const uploadBlogImage = async (
  supabase: Awaited<ReturnType<typeof requireAdmin>>['supabase'],
  file: UploadableImage | null,
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

  const fileName = typeof file.name === 'string' ? file.name : '';
  const extensionFromName = fileName.split('.').pop()?.toLowerCase();
  const extension = extensionFromName || extensionFromMimeType(file.type);
  const filePath = `blogs/${slug}-${Date.now()}.${extension}`;

  let fileBody: Uint8Array;
  try {
    fileBody = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read file.';
    redirectWithError(redirectTo, `Image upload failed: ${message}`);
    return null;
  }

  let uploadError: { message: string } | null = null;
  try {
    const { error } = await supabase.storage.from(blogImagesBucket).upload(filePath, fileBody, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    uploadError = error;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error.';
    redirectWithError(redirectTo, `Image upload failed: ${message}`);
    return null;
  }

  if (uploadError) {
    redirectWithError(redirectTo, `Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(blogImagesBucket).getPublicUrl(filePath);
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

  const slug = slugify(slugInput || title);

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
  revalidatePath('/admin/blogs');
  revalidatePath(redirectTo);
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
  const tagsValue = formData.get('tags');
  const imageFile = extractImageFile(formData);
  const currentImage = String(formData.get('current_image') || '').trim();
  const featuredValue = formData.get('featured');
  const statusValue = formData.get('is_published');
  const featured = featuredValue === 'featured';
  const isPublished = statusValue === 'published';

  if (!id || !title || !excerpt || !content || !author || !date || !category) {
    redirectWithError(redirectTo, 'Missing required blog fields.');
  }

  const slug = slugify(slugInput || title);

  if (!slug) {
    redirectWithError(redirectTo, 'Slug is required.');
  }

  const { supabase } = await requireAdmin();
  const uploadedImage = await uploadBlogImage(supabase, imageFile, slug, redirectTo);
  const imageUrl = uploadedImage ?? (currentImage || null);
  const updateData: Record<string, unknown> = {
    title,
    slug,
    excerpt,
    content,
    author,
    date,
    category,
    image: imageUrl,
    updated_at: new Date().toISOString(),
  };

  if (tagsValue !== null) {
    updateData.tags = normalizeTags(String(tagsValue));
  }

  if (featuredValue !== null) {
    updateData.featured = featured;
  }

  if (statusValue !== null) {
    updateData.is_published = isPublished;
  }

  const { error } = await supabase.from('blogs').update(updateData).eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update blog failed: ${error.message}`);
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blogs');
  revalidatePath(redirectTo);
  redirectWithSuccess(redirectTo, 'Blog updated.');
}

export async function updateBlogStatus(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const statusValue = String(formData.get('is_published') || '').trim();

  if (!id || !statusValue) {
    redirectWithError(redirectTo, 'Missing blog status update data.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid blog status value.');
  }

  const isPublished = statusValue === 'published';
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('blogs')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update status failed: ${error.message}`);
  }

  revalidatePath('/blog');
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath('/admin/blogs');
  revalidatePath(redirectTo);
  redirectWithSuccess(redirectTo, 'Status updated.');
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
  revalidatePath('/admin/blogs');
  revalidatePath(redirectTo);
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
