'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/admin';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = 5 * 1024 * 1024;
const postImagesBucket =
  process.env.SUPABASE_POST_IMAGE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_POST_IMAGE_BUCKET ||
  'post-images';

type UploadableImage = Blob & { name?: string };

const redirectWithError = (message: string) => {
  redirect(`/blog?error=${encodeURIComponent(message)}`);
};

const redirectWithSuccess = (message: string) => {
  redirect(`/blog?success=${encodeURIComponent(message)}`);
};

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

const uploadPostImage = async (
  supabase: Awaited<ReturnType<typeof requireAdmin>>['supabase'],
  file: UploadableImage
) => {
  if (!allowedImageTypes.has(file.type)) {
    redirectWithError('Image must be PNG, JPG, or WebP.');
  }

  if (file.size > maxImageBytes) {
    redirectWithError('Image must be under 5MB.');
  }

  const fileName = typeof file.name === 'string' ? file.name : '';
  const extensionFromName = fileName.split('.').pop()?.toLowerCase();
  const extension = extensionFromName || extensionFromMimeType(file.type);
  const filePath = `posts/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;

  let fileBody: Uint8Array;
  try {
    fileBody = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read file.';
    redirectWithError(`Image upload failed: ${message}`);
    return null;
  }

  try {
    const { error } = await supabase.storage.from(postImagesBucket).upload(filePath, fileBody, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

    if (error) {
      redirectWithError(`Image upload failed: ${error.message}`);
      return null;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error.';
    redirectWithError(`Image upload failed: ${message}`);
    return null;
  }

  const { data } = supabase.storage.from(postImagesBucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export async function createPost(formData: FormData) {
  const content = String(formData.get('content') || '').trim();
  const imageFile = extractImageFile(formData);
  const showOnMain = String(formData.get('show_on_main') || '').trim() === 'true';
  const showOnPhion = String(formData.get('show_on_phion') || '').trim() === 'true';

  if (!content && !imageFile) {
    redirectWithError('Write something or upload an image.');
  }

  if (!showOnMain && !showOnPhion) {
    redirectWithError('Pick at least one site (Main/Phion).');
  }

  const { supabase } = await requireAdmin();
  const imageUrl = imageFile ? await uploadPostImage(supabase, imageFile) : null;

  const { error } = await supabase.from('posts').insert({
    content: content || null,
    image: imageUrl,
    is_published: true,
    show_on_main: showOnMain,
    show_on_phion: showOnPhion,
  });

  if (error) {
    redirectWithError(`Create post failed: ${error.message}`);
  }

  revalidatePath('/blog');
  redirectWithSuccess('Post created.');
}

const extractStoragePathFromPublicUrl = (publicUrl: string, bucketId: string) => {
  try {
    const url = new URL(publicUrl);
    const prefix = `/storage/v1/object/public/${bucketId}/`;
    const start = url.pathname.indexOf(prefix);
    if (start === -1) return null;
    const rawPath = url.pathname.slice(start + prefix.length);
    const decoded = decodeURIComponent(rawPath);
    return decoded || null;
  } catch {
    return null;
  }
};

export async function deletePost(formData: FormData) {
  const id = String(formData.get('id') || '').trim();

  if (!id) {
    redirectWithError('Missing post id.');
  }

  const { supabase } = await requireAdmin();

  let imageUrl: string | null = null;
  try {
    const { data } = await supabase.from('posts').select('image').eq('id', id).maybeSingle();
    imageUrl = (data as any)?.image ?? null;
  } catch {
    imageUrl = null;
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    redirectWithError(`Delete post failed: ${error.message}`);
  }

  if (imageUrl) {
    const filePath = extractStoragePathFromPublicUrl(imageUrl, postImagesBucket);
    if (filePath) {
      try {
        await supabase.storage.from(postImagesBucket).remove([filePath]);
      } catch {
        // Ignore storage cleanup failures.
      }
    }
  }

  revalidatePath('/blog');
  redirectWithSuccess('Post deleted.');
}
