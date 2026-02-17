import Image from 'next/image';
import { deletePost } from './postActions';
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
}: {
  post: PostRow;
  authorLabel: string;
  avatarUrl?: string | null;
  avatarFallback: string;
  canDelete?: boolean;
}) {
  const timestamp = formatPostTimestamp(post.created_at);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[var(--home-soft)]">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={authorLabel} fill sizes="40px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                {avatarFallback}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{authorLabel}</p>
            {timestamp ? <p className="truncate text-xs text-white/40">{timestamp}</p> : null}
          </div>
        </div>

        {canDelete ? (
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:border-white/20 hover:text-white"
            >
              Delete
            </button>
          </form>
        ) : null}
      </header>

      <div className="space-y-4 px-5 py-4">
        {post.content ? (
          <p className="whitespace-pre-wrap break-words text-sm text-white/75">{post.content}</p>
        ) : null}

        {post.image ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            <Image
              src={post.image}
              alt="Post image"
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
              priority={false}
            />
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3">
        <PostLikeButton postId={post.id} />
      </footer>
    </article>
  );
}
