import type { Metadata } from 'next';
import SiteShell from '@/components/home/SiteShell';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';
import PostsFeed from './PostsFeed';
import type { PostRow } from './PostCard';
import PostComposer from './PostComposer';
import { createQuote, deleteQuote } from './quoteActions';
import BlogSidebarList, { type BlogSidebarItem } from './BlogSidebarList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Posts, notes, and short stories.',
};

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[] | null;
  image: string | null;
  is_published?: boolean | null;
  show_on_phion?: boolean | null;
};

type QuoteRow = {
  id: string;
  date: string;
  text: string;
  author?: string | null;
  show_on_phion?: boolean | null;
};

const getDiscordAvatarUrl = async () => {
  const userId = process.env.DISCORD_USER_ID;
  const token = process.env.DISCORD_TOKEN;
  if (!userId || !token) return null;

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { avatar?: string | null };
    if (!data?.avatar) return null;

    return `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png`;
  } catch {
    return null;
  }
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string; edit?: string };
}) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return (
      <SiteShell contentMode="full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="grid gap-8 lg:grid-cols-12">
            <section className="space-y-6 lg:col-span-8">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-lg font-semibold text-white">My Posts</h1>
              </div>
              <PostsFeed posts={[]} authorLabel="Phy0n" avatarFallback="P" />
            </section>
            <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-auto hide-scrollbar">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <h2 className="text-sm font-semibold text-white">Blog</h2>
                <p className="mt-2 text-sm text-white/50">No blog posts yet.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <h2 className="text-sm font-semibold text-white">Quotes</h2>
                <p className="mt-2 text-sm text-white/50">No quotes yet.</p>
              </div>
            </aside>
          </div>
        </div>
      </SiteShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const safeDecode = (value?: string) => {
    if (!value) return '';
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const successMessage = safeDecode(searchParams?.success);
  const errorMessage = safeDecode(searchParams?.error);
  const toast = errorMessage
    ? { message: errorMessage, tone: 'error' as const }
    : successMessage
      ? { message: successMessage, tone: 'success' as const }
      : null;

  const { data: userData } = await supabase.auth.getUser();
  let isAdmin = false;

  if (userData?.user) {
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    isAdmin = Boolean(adminRow);
  }

  const [{ data: blogs, error: blogsError }, { data: quotes, error: quotesError }] = await Promise.all([
    supabase
      .from('blogs')
      .select('*')
      .or('is_published.eq.true,is_published.is.null')
      .order('date', { ascending: false }),
    supabase
      .from('quotes')
      .select('*')
      .order('date', { ascending: false }),
  ]);

  const safeBlogs =
    blogsError || !blogs ? [] : (blogs as any[]).filter((blog) => (blog as any)?.show_on_phion !== false);
  const safeQuotes =
    quotesError || !quotes ? [] : (quotes as any[]).filter((quote) => (quote as any)?.show_on_phion !== false);

  let posts: PostRow[] = [];
  try {
    const { data: postRows, error: postsError } = await supabase
      .from('posts')
      .select('id, content, image, created_at, is_published, show_on_phion')
      .or('is_published.eq.true,is_published.is.null')
      .order('created_at', { ascending: false })
      .limit(60);

    if (!postsError && Array.isArray(postRows)) {
      posts = (postRows as any[])
        .filter((row) => (row as any)?.show_on_phion !== false)
        .map((row) => ({
          id: String((row as any).id),
          content: (row as any).content ?? null,
          image: (row as any).image ?? null,
          created_at: String((row as any).created_at ?? ''),
        }));
    }
  } catch {
    posts = [];
  }

  const blogRows: BlogRow[] = safeBlogs as BlogRow[];
  const quoteRows: QuoteRow[] = safeQuotes as QuoteRow[];
  const avatarUrl = await getDiscordAvatarUrl();
  const today = new Date().toISOString().slice(0, 10);
  const blogSidebarItems: BlogSidebarItem[] = blogRows.map((blog) => {
    const imageRaw = typeof blog.image === 'string' ? blog.image : '';
    const image = imageRaw.trim() ? imageRaw.trim() : null;

    return {
      id: String(blog.id),
      slug: String(blog.slug || ''),
      title: String(blog.title || ''),
      date: String(blog.date || ''),
      image,
    };
  });

  return (
    <SiteShell contentMode="full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {toast ? (
          <div
            className={[
              'mb-6 rounded-2xl border px-4 py-3 text-sm',
              toast.tone === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-200'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
            ].join(' ')}
          >
            {toast.message}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-lg font-semibold text-white">My Posts</h1>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Phion</p>
            </div>

            {isAdmin ? (
              <details className="flex flex-col">
                <summary
                  className="list-none inline-flex h-9 w-9 cursor-pointer select-none self-end items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-lg font-semibold leading-none text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&::-webkit-details-marker]:hidden"
                  aria-label="Create post"
                  title="Create post"
                >
                  +
                </summary>
                <div className="mt-4 w-full">
                  <PostComposer />
                </div>
              </details>
            ) : null}

            <PostsFeed
              posts={posts}
              authorLabel="Phy0n"
              avatarUrl={avatarUrl}
              avatarFallback="P"
              canDelete={isAdmin}
              canEdit={isAdmin}
            />
          </section>

          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-auto hide-scrollbar">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-white">Blog</h2>
                <span className="text-xs text-white/40">{safeBlogs.length}</span>
              </div>

              {blogRows.length === 0 ? (
                <p className="mt-3 text-sm text-white/50">No blog posts yet.</p>
              ) : (
                <BlogSidebarList blogs={blogSidebarItems} />
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-white">Quotes</h2>
                <span className="text-xs text-white/40">{safeQuotes.length}</span>
              </div>

              {isAdmin ? (
                <details className="mt-4 flex flex-col">
                  <summary
                    className="list-none inline-flex h-9 w-9 cursor-pointer select-none self-end items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-lg font-semibold leading-none text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&::-webkit-details-marker]:hidden"
                    aria-label="Add quote"
                    title="Add quote"
                  >
                    +
                  </summary>
                  <form action={createQuote} className="mt-4 w-full space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Date</label>
                        <input
                          type="date"
                          name="date"
                          defaultValue={today}
                          className="block w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 outline-none focus:border-white/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                          Author
                        </label>
                        <input
                          type="text"
                          name="author"
                          placeholder="Anonymous"
                          className="block w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 placeholder:text-white/30 outline-none focus:border-white/20"
                          maxLength={80}
                        />
                      </div>
                    </div>

                    <textarea
                      name="text"
                      placeholder="Write a quote…"
                      rows={3}
                      maxLength={400}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 placeholder:text-white/30 outline-none focus:border-white/20"
                    />

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-xs text-white/70">
                        <input
                          type="checkbox"
                          name="show_on_main"
                          value="true"
                          defaultChecked
                          className="h-4 w-4 rounded border-white/20 bg-black/40"
                        />
                        Show on Main
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs text-white/70">
                        <input
                          type="checkbox"
                          name="show_on_phion"
                          value="true"
                          defaultChecked
                          className="h-4 w-4 rounded border-white/20 bg-black/40"
                        />
                        Show on Phion
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      Add Quote
                    </button>
                  </form>
                </details>
              ) : null}

              {quoteRows.length === 0 ? (
                <p className="mt-3 text-sm text-white/50">No quotes yet.</p>
              ) : (
                <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1 hide-scrollbar">
                  {quoteRows.map((quote) => (
                    <div key={quote.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-sm text-white/75 line-clamp-4">&ldquo;{quote.text}&rdquo;</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        {quote.author ? <p className="text-xs text-white/40">— {quote.author}</p> : <span />}
                        {isAdmin ? (
                          <form action={deleteQuote}>
                            <input type="hidden" name="id" value={quote.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:border-white/20 hover:text-white"
                            >
                              Delete
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
