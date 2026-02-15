import PostCard, { type PostRow } from './PostCard';

export default function PostsFeed({
  posts,
  authorLabel,
  avatarUrl,
  avatarFallback,
  canDelete = false,
}: {
  posts: PostRow[];
  authorLabel: string;
  avatarUrl?: string | null;
  avatarFallback: string;
  canDelete?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 px-6 py-8 text-sm text-white/50">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          authorLabel={authorLabel}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
