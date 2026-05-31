'use client';

import Link from 'next/link';
import Image from 'next/image';
import { deletePost, updatePost } from './postActions';
import PostLikeButton from './PostLikeButton';

export type PostRow = {
  id: string;
  content: string | null;
  image: string | null;
  created_at: string;
};

const formatPostTimestamp = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
    timeZoneName: 'short',
  });
};

export default function PostCard({
  post,
  authorLabel,
  avatarUrl,
  avatarFallback,
  canDelete = false,
  canEdit = false,
  editPostId,
}: {
  post: PostRow;
  authorLabel: string;
  avatarUrl?: string | null;
  avatarFallback: string;
  canDelete?: boolean;
  canEdit?: boolean;
  editPostId?: string;
}) {
  const timestamp = formatPostTimestamp(post.created_at);
  const isEditing = Boolean(canEdit && editPostId && editPostId === post.id);

  return (
    <article id={`post-${post.id}`} className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)]">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--home-border)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--home-border)] bg-[var(--home-soft)]">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={authorLabel} fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--home-ink)]">
                {avatarFallback}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--home-ink)]">{authorLabel}</p>
            {timestamp ? <p className="truncate text-xs text-[var(--home-muted)] opacity-40">{timestamp}</p> : null}
          </div>
        </div>

        {canEdit || canDelete ? (
          <div className="flex items-center gap-2">
            {canEdit ? (
              <Link
                href={
                  isEditing
                    ? `/blog#post-${encodeURIComponent(post.id)}`
                    : `/blog?edit=${encodeURIComponent(post.id)}#post-${encodeURIComponent(post.id)}`
                }
                className="inline-flex items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--home-ink)] opacity-70 hover:border-[var(--home-border)] hover:text-[var(--home-ink)]">
                {isEditing ? 'Close' : 'Edit'}
              </Link>
            ) : null}

            {canDelete ? (
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--home-ink)] opacity-70 hover:border-[var(--home-border)] hover:text-[var(--home-ink)]">
                  Delete
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </header>

      {isEditing ? (
        <div className="border-b border-[var(--home-border)] px-5 py-4">
          <form action={updatePost} className="space-y-4">
            <input type="hidden" name="id" value={post.id} />
            <textarea
              name="content"
              defaultValue={post.content ?? ''}
              rows={4}
              className="w-full resize-none rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-4 py-3 text-sm text-[var(--home-ink)] placeholder:text-[var(--home-muted)] opacity-30 outline-none focus:border-[var(--home-border)]"
              placeholder="Edit post content…"
              maxLength={2000}/>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">Replace image (optional)</p>
              <input
                type="file"
                name="image_file"
                accept="image/png,image/jpeg,image/webp"
                className="block w-full rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-4 py-3 text-sm text-[var(--home-ink)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--home-soft)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--home-ink)]"/>
            </div>

            {post.image ? (
              <label className="inline-flex items-center gap-2 text-xs text-[var(--home-ink)] opacity-70">
                <input type="checkbox" name="remove_image" value="true" className="h-4 w-4 rounded border-[var(--home-border)] bg-[var(--home-card)]" />
                Remove current image
              </label>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-ink)] hover:border-[var(--home-border)] hover:bg-[var(--home-soft)]">
                Save
              </button>
              <Link
                href={`/blog#post-${encodeURIComponent(post.id)}`}
                className="inline-flex items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-card)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--home-ink)] opacity-70 hover:border-[var(--home-border)] hover:text-[var(--home-ink)]">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      ) : null}

      <div className="space-y-4 px-5 py-4">
        {post.content ? (
          <p className="whitespace-pre-wrap break-words text-sm text-[var(--home-muted)] opacity-75">{post.content}</p>
        ) : null}

        {post.image ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--home-border)] bg-black">
            <Image
              src={post.image}
              alt="Post image"
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
              priority={false}/>
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[var(--home-border)] px-5 py-3">
        <PostLikeButton postId={post.id} />
      </footer>
    </article>
  );
}
