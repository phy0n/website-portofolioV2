'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const allowedRedirects = new Set([
  '/admin',
  '/admin/blogs',
  '/admin/quotes',
  '/admin/experiences',
  '/admin/projects',
  '/admin/certificates',
  '/admin/languages',
  '/admin/education',
]);

const resolveRedirectPath = (formData: FormData) => {
  const target = String(formData.get('redirect_to') || '').trim();
  return allowedRedirects.has(target) ? target : '/admin';
};

const redirectWithError = (path: string, message: string): never => {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
};

const redirectWithSuccess = (path: string, message: string): never => {
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
const certificateImagesBucket =
  process.env.SUPABASE_CERTIFICATE_IMAGE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_CERTIFICATE_IMAGE_BUCKET ||
  blogImagesBucket;
const profileImagesBucket =
  process.env.SUPABASE_PROFILE_IMAGE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_PROFILE_IMAGE_BUCKET ||
  'profile-images';

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

const uploadCertificateImage = async (
  supabase: Awaited<ReturnType<typeof requireAdmin>>['supabase'],
  file: UploadableImage | null,
  title: string,
  redirectTo: string
) => {
  if (!file) return null;

  if (!allowedImageTypes.has(file.type)) {
    redirectWithError(redirectTo, 'Image must be PNG, JPG, or WebP.');
  }

  if (file.size > maxImageBytes) {
    redirectWithError(redirectTo, 'Image must be under 5MB.');
  }

  const baseName = slugify(title) || 'certificate';
  const fileName = typeof file.name === 'string' ? file.name : '';
  const extensionFromName = fileName.split('.').pop()?.toLowerCase();
  const extension = extensionFromName || extensionFromMimeType(file.type);
  const filePath = `certificates/${baseName}-${Date.now()}.${extension}`;

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
    const { error } = await supabase.storage.from(certificateImagesBucket).upload(filePath, fileBody, {
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

  const { data } = supabase.storage.from(certificateImagesBucket).getPublicUrl(filePath);
  return data.publicUrl;
};

const uploadProfileImage = async (
  supabase: Awaited<ReturnType<typeof requireAdmin>>['supabase'],
  file: UploadableImage | null,
  redirectTo: string
) => {
  if (!file) {
    redirectWithError(redirectTo, 'Choose a profile image first.');
    return null;
  }

  if (!allowedImageTypes.has(file.type)) {
    redirectWithError(redirectTo, 'Profile image must be PNG, JPG, or WebP.');
  }

  if (file.size > maxImageBytes) {
    redirectWithError(redirectTo, 'Profile image must be under 5MB.');
  }

  const fileName = typeof file.name === 'string' ? file.name : '';
  const extensionFromName = fileName.split('.').pop()?.toLowerCase();
  const extension = extensionFromName || extensionFromMimeType(file.type);
  const filePath = `profile/profile-${Date.now()}.${extension}`;

  let fileBody: Uint8Array;
  try {
    fileBody = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read file.';
    redirectWithError(redirectTo, `Profile image upload failed: ${message}`);
    return null;
  }

  let uploadError: { message: string } | null = null;
  try {
    const { error } = await supabase.storage.from(profileImagesBucket).upload(filePath, fileBody, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });
    uploadError = error;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error.';
    redirectWithError(redirectTo, `Profile image upload failed: ${message}`);
    return null;
  }

  if (uploadError) {
    redirectWithError(redirectTo, `Profile image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(profileImagesBucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export async function updateProfilePicture(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const imageFile = extractImageFile(formData);
  const { supabase } = await requireAdmin();
  const imageUrl = await uploadProfileImage(supabase, imageFile, redirectTo);

  if (!imageUrl) {
    redirectWithError(redirectTo, 'Profile image upload failed.');
  }

  const { error } = await supabase
    .from('site_profile')
    .upsert(
      {
        id: 'default',
        profile_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    redirectWithError(redirectTo, `Update profile picture failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  redirectWithSuccess(redirectTo, 'Profile picture updated.');
}

export async function createBlog(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const title = String(formData.get('title') || '').trim();
  const slugInput = String(formData.get('slug') || '').trim();
  const excerpt = String(formData.get('excerpt') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const chaptersRaw = String(formData.get('chapters') || '').trim();
  const author = String(formData.get('author') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const tagsValue = String(formData.get('tags') || '');
  const imageFile = extractImageFile(formData);
  const featuredValue = String(formData.get('featured') || 'standard');
  const statusValue = String(formData.get('is_published') || 'published');
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';
  const featured = featuredValue === 'featured';
  const isPublished = statusValue === 'published';

  if (!title || !excerpt || !content || !author || !date || !category) {
    redirectWithError(redirectTo, 'Missing required blog fields.');
  }

  const parseChapters = (raw: string): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((value) => (typeof value === 'string' ? value : ''))
        .map((value) => value.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const chapters = parseChapters(chaptersRaw);
  const primaryContent = chapters[0] ?? content;

  const slug = slugify(slugInput || title);

  if (!slug) {
    redirectWithError(redirectTo, 'Slug is required.');
  }

  const { supabase } = await requireAdmin();
  const imageUrl = await uploadBlogImage(supabase, imageFile, slug, redirectTo);
  const insertData: Record<string, unknown> = {
    title,
    slug,
    excerpt,
    content: primaryContent,
    author,
    date,
    category,
    tags: normalizeTags(tagsValue),
    image: imageUrl,
    featured,
    is_published: isPublished,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  };

  if (chapters.length > 0) {
    insertData.chapters = chapters;
  }

  const { error } = await supabase
    .from('blogs')
      .insert(insertData);

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
  const chaptersRaw = String(formData.get('chapters') || '').trim();
  const author = String(formData.get('author') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const tagsValue = formData.get('tags');
  const imageFile = extractImageFile(formData);
  const currentImage = String(formData.get('current_image') || '').trim();
  const featuredValue = formData.get('featured');
  const statusValue = formData.get('is_published');
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';
  const featured = featuredValue === 'featured';
  const isPublished = statusValue === 'published';

  if (!id || !title || !excerpt || !content || !author || !date || !category) {
    redirectWithError(redirectTo, 'Missing required blog fields.');
  }

  const parseChapters = (raw: string): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((value) => (typeof value === 'string' ? value : ''))
        .map((value) => value.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const chapters = parseChapters(chaptersRaw);
  const primaryContent = chapters[0] ?? content;

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
    content: primaryContent,
    author,
    date,
    category,
    image: imageUrl,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
    updated_at: new Date().toISOString(),
  };

  if (chapters.length > 0) {
    updateData.chapters = chapters;
  }

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
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

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
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
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
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

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
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
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

const parseSortOrder = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : 0;
  if (typeof value !== 'string') return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function createExperience(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const role = String(formData.get('role') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const period = String(formData.get('period') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!role || !company || !period || !status || !description) {
    redirectWithError(redirectTo, 'Role, company, period, status, and description are required.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('experiences').insert({
    role,
    company,
    period,
    status,
    description,
    sort_order: sortOrder,
    is_published: isPublished,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(redirectTo, `Create experience failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/experiences');
  redirectWithSuccess(redirectTo, 'Experience created.');
}

export async function updateExperience(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const role = String(formData.get('role') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const period = String(formData.get('period') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!id || !role || !company || !period || !status || !description) {
    redirectWithError(redirectTo, 'Missing required experience fields.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('experiences')
    .update({
      role,
      company,
      period,
      status,
      description,
      sort_order: sortOrder,
      is_published: isPublished,
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update experience failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/experiences');
  redirectWithSuccess(redirectTo, 'Experience updated.');
}

export async function deleteExperience(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing experience id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('experiences').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete experience failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/experiences');
  redirectWithSuccess(redirectTo, 'Experience deleted.');
}

export async function createProject(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const tagsValue = String(formData.get('tags') || '');
  const link = String(formData.get('link') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const icon = String(formData.get('icon') || '').trim();
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!title || !description || !link || !status) {
    redirectWithError(redirectTo, 'Title, description, link, and status are required.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const tags = normalizeTags(tagsValue);

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('projects').insert({
    title,
    description,
    tags,
    link,
    status,
    icon: icon || null,
    sort_order: sortOrder,
    is_published: isPublished,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(redirectTo, `Create project failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirectWithSuccess(redirectTo, 'Project created.');
}

export async function updateProject(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const tagsValue = String(formData.get('tags') || '');
  const link = String(formData.get('link') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const icon = String(formData.get('icon') || '').trim();
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!id || !title || !description || !link || !status) {
    redirectWithError(redirectTo, 'Missing required project fields.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const tags = normalizeTags(tagsValue);

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('projects')
    .update({
      title,
      description,
      tags,
      link,
      status,
      icon: icon || null,
      sort_order: sortOrder,
      is_published: isPublished,
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update project failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirectWithSuccess(redirectTo, 'Project updated.');
}

export async function deleteProject(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing project id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete project failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirectWithSuccess(redirectTo, 'Project deleted.');
}

export async function createCertificate(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const title = String(formData.get('title') || '').trim();
  const issuer = String(formData.get('issuer') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const imageFile = extractImageFile(formData);
  const icon = String(formData.get('icon') || '').trim();
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!title || !issuer || !date || !status || !description) {
    redirectWithError(redirectTo, 'Title, issuer, date, status, and description are required.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const { supabase } = await requireAdmin();
  const imageUrl = await uploadCertificateImage(supabase, imageFile, title, redirectTo);
  const { error } = await supabase.from('certificates').insert({
    title,
    issuer,
    date,
    status,
    description,
    image: imageUrl,
    icon: icon || null,
    sort_order: sortOrder,
    is_published: isPublished,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(redirectTo, `Create certificate failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/certificates');
  redirectWithSuccess(redirectTo, 'Certificate created.');
}

export async function updateCertificate(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const issuer = String(formData.get('issuer') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const imageFile = extractImageFile(formData);
  const currentImage = String(formData.get('current_image') || '').trim();
  const icon = String(formData.get('icon') || '').trim();
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!id || !title || !issuer || !date || !status || !description) {
    redirectWithError(redirectTo, 'Missing required certificate fields.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const { supabase } = await requireAdmin();
  const uploadedImage = await uploadCertificateImage(supabase, imageFile, title, redirectTo);
  const imageUrl = uploadedImage ?? (currentImage || null);
  const { error } = await supabase
    .from('certificates')
    .update({
      title,
      issuer,
      date,
      status,
      description,
      image: imageUrl,
      icon: icon || null,
      sort_order: sortOrder,
      is_published: isPublished,
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update certificate failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/certificates');
  redirectWithSuccess(redirectTo, 'Certificate updated.');
}

export async function deleteCertificate(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing certificate id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('certificates').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete certificate failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/certificates');
  redirectWithSuccess(redirectTo, 'Certificate deleted.');
}

export async function createLanguage(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const name = String(formData.get('name') || '').trim();
  const label = String(formData.get('label') || '').trim();
  const levelRaw = parseSortOrder(formData.get('level'));
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!name || !label) {
    redirectWithError(redirectTo, 'Language name and label are required.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const level = Math.max(0, Math.min(levelRaw, 100));
  const isPublished = statusValue === 'published';

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('languages').insert({
    name,
    label,
    level,
    sort_order: sortOrder,
    is_published: isPublished,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(redirectTo, `Create language failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/languages');
  redirectWithSuccess(redirectTo, 'Language created.');
}

export async function updateLanguage(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const label = String(formData.get('label') || '').trim();
  const levelRaw = parseSortOrder(formData.get('level'));
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!id || !name || !label) {
    redirectWithError(redirectTo, 'Missing required language fields.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const level = Math.max(0, Math.min(levelRaw, 100));
  const isPublished = statusValue === 'published';

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('languages')
    .update({
      name,
      label,
      level,
      sort_order: sortOrder,
      is_published: isPublished,
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update language failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/languages');
  redirectWithSuccess(redirectTo, 'Language updated.');
}

export async function deleteLanguage(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing language id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('languages').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete language failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/languages');
  redirectWithSuccess(redirectTo, 'Language deleted.');
}

export async function createEducation(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const institution = String(formData.get('institution') || '').trim();
  const degree = String(formData.get('degree') || '').trim();
  const field = String(formData.get('field') || '').trim();
  const period = String(formData.get('period') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const highlightsValue = String(formData.get('highlights') || '');
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!institution || !degree || !period) {
    redirectWithError(redirectTo, 'Institution, degree, and period are required.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const highlights = normalizeTags(highlightsValue);

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('education').insert({
    institution,
    degree,
    field: field || null,
    period,
    location: location || null,
    description: description || null,
    highlights,
    sort_order: sortOrder,
    is_published: isPublished,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(redirectTo, `Create education failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/education');
  redirectWithSuccess(redirectTo, 'Education created.');
}

export async function updateEducation(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();
  const institution = String(formData.get('institution') || '').trim();
  const degree = String(formData.get('degree') || '').trim();
  const field = String(formData.get('field') || '').trim();
  const period = String(formData.get('period') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const highlightsValue = String(formData.get('highlights') || '');
  const sortOrder = parseSortOrder(formData.get('sort_order'));
  const statusValue = String(formData.get('is_published') || 'published').trim();
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!id || !institution || !degree || !period) {
    redirectWithError(redirectTo, 'Missing required education fields.');
  }

  if (statusValue !== 'published' && statusValue !== 'draft') {
    redirectWithError(redirectTo, 'Invalid publish status value.');
  }

  const isPublished = statusValue === 'published';
  const highlights = normalizeTags(highlightsValue);

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('education')
    .update({
      institution,
      degree,
      field: field || null,
      period,
      location: location || null,
      description: description || null,
      highlights,
      sort_order: sortOrder,
      is_published: isPublished,
      show_on_main: showOnMain,
      show_on_phion: showOnPhion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Update education failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/education');
  redirectWithSuccess(redirectTo, 'Education updated.');
}

export async function deleteEducation(formData: FormData) {
  const redirectTo = resolveRedirectPath(formData);
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError(redirectTo, 'Missing education id.');
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('education').delete().eq('id', id);

  if (error) {
    redirectWithError(redirectTo, `Delete education failed: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/education');
  redirectWithSuccess(redirectTo, 'Education deleted.');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
