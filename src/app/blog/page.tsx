import type { Metadata } from 'next';
import SiteShell from '@/components/home/SiteShell';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';
import { createQuote, deleteQuote } from './quoteActions';
import BlogSidebarList, { type BlogSidebarItem } from './BlogSidebarList';
import { getSiteProfile } from '@/lib/site-profile';

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
  const { profileImageUrl } = await getSiteProfile();

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return (
      <SiteShell contentMode="full" navAvatarSrc={profileImageUrl}>
        <div className="w-full pt-8 pb-20">
          <div className="grid gap-8 lg:grid-cols-12">
            <section className="space-y-6 lg:col-span-7">
              <div className="space-y-1">
                <h1 className="text-lg font-semibold text-[var(--home-ink)]">Blog</h1>
                <p className="text-xs text-[var(--home-muted)] opacity-50">Latest posts and short reads.</p>
              </div>

              <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] p-6">
                <h2 className="text-sm font-semibold text-[var(--home-ink)]">Posts</h2>
                <p className="mt-3 text-sm text-[var(--home-muted)] opacity-50">No blog posts yet.</p>
              </div>
            </section>

            <aside className="space-y-6 lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-auto hide-scrollbar">
              <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] p-6">
                <h2 className="text-sm font-semibold text-[var(--home-ink)]">Quotes</h2>
                <p className="mt-3 text-sm text-[var(--home-muted)] opacity-50">No quotes yet.</p>
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
    <SiteShell contentMode="full" navAvatarSrc={profileImageUrl}>
      <div className="w-full pt-8 pb-20">
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
          <section className="space-y-6 lg:col-span-7">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-lg font-semibold text-[var(--home-ink)]">Blog</h1>
                <p className="text-xs text-[var(--home-muted)] opacity-50">Latest posts and short reads.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] p-6">
              {blogRows.length === 0 ? (
                <p className="text-sm text-[var(--home-muted)] opacity-50">No blog posts yet.</p>
              ) : (
                <BlogSidebarList blogs={blogSidebarItems} />
              )}
            </div>
          </section>

          <aside className="space-y-6 lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-auto hide-scrollbar">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[var(--home-ink)]">Quotes</h2>
                <p className="text-xs text-[var(--home-muted)] opacity-50">Words to remember.</p>
              </div>
              {isAdmin ? (
                <details className="flex flex-col relative z-20">
                  <summary
                    className="list-none inline-flex h-9 w-9 cursor-pointer select-none self-end items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] text-lg font-semibold leading-none text-[var(--home-ink)] opacity-70 transition hover:border-[var(--home-border)] hover:bg-[var(--home-soft)] hover:text-[var(--home-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&::-webkit-details-marker]:hidden"
                    aria-label="Add quote"
                    title="Add quote">
                    +
                  </summary>
                  <form action={createQuote} className="absolute right-0 top-full mt-2 w-full min-w-[320px] rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-4 shadow-xl z-50 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">Date</label>
                        <input
                          type="date"
                          name="date"
                          defaultValue={today}
                          className="block w-full rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-2 text-xs text-[var(--home-ink)] opacity-80 outline-none focus:border-[var(--home-border)]"/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-[var(--home-muted)] opacity-40">
                          Author
                        </label>
                        <input
                          type="text"
                          name="author"
                          placeholder="Anonymous"
                          className="block w-full rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-2 text-xs text-[var(--home-ink)] opacity-80 placeholder:text-[var(--home-muted)] opacity-30 outline-none focus:border-[var(--home-border)]"
                          maxLength={80}/>
                      </div>
                    </div>

                    <textarea
                      name="text"
                      placeholder="Write a quote…"
                      rows={3}
                      maxLength={400}
                      className="w-full resize-none rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] px-3 py-2 text-xs text-[var(--home-ink)] opacity-80 placeholder:text-[var(--home-muted)] opacity-30 outline-none focus:border-[var(--home-border)]"/>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-xs text-[var(--home-ink)] opacity-70">
                        <input
                          type="checkbox"
                          name="show_on_main"
                          value="true"
                          defaultChecked
                          className="h-4 w-4 rounded border-[var(--home-border)] bg-[var(--home-card)]"/>
                        Show on Main
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs text-[var(--home-ink)] opacity-70">
                        <input
                          type="checkbox"
                          name="show_on_phion"
                          value="true"
                          defaultChecked
                          className="h-4 w-4 rounded border-[var(--home-border)] bg-[var(--home-card)]"/>
                        Show on Phion
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--home-border)] bg-[var(--home-soft)] px-4 py-2.5 text-xs font-semibold text-[var(--home-ink)] hover:border-[var(--home-border)] hover:bg-[var(--home-soft)]">
                      Add Quote
                    </button>
                  </form>
                </details>
              ) : null}
            </div>

            <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-soft)] p-6">
              {quoteRows.length === 0 ? (
                <p className="text-sm text-[var(--home-muted)] opacity-50">No quotes yet.</p>
              ) : (
                <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1 hide-scrollbar">
                  {quoteRows.map((quote) => (
                    <div key={quote.id} className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-4">
                      <p className="text-sm text-[var(--home-muted)] opacity-75 line-clamp-4">&ldquo;{quote.text}&rdquo;</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        {quote.author ? <p className="text-xs text-[var(--home-muted)] opacity-40">by: {quote.author}</p> : <span />}
                        {isAdmin ? (
                          <form action={deleteQuote}>
                            <input type="hidden" name="id" value={quote.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--home-ink)] opacity-70 hover:border-[var(--home-border)] hover:text-[var(--home-ink)]">
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
