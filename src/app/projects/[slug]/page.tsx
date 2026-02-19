import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Github } from 'lucide-react';
import BlogMarkdown from '@/components/blog/BlogMarkdown';
import SiteShell from '@/components/home/SiteShell';
import { createSupabaseServerClient, supabaseConfig } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  link: string;
  github_url?: string | null;
  tags: string[] | null;
  stack: string[] | null;
  image: string | null;
  status: string;
};

type CaseStudyRow = {
  id: string;
  slug: string;
  overview: string;
  problem?: string | null;
  solution?: string | null;
  results?: string | null;
  content_md?: string | null;
  stack: string[] | null;
  screenshots: string[] | null;
  og_image?: string | null;
  is_published?: boolean | null;
  show_on_phion?: boolean | null;
  project: ProjectRow | null;
};

const isLocalImageSrc = (value: string | null | undefined) => Boolean(value && value.trim().startsWith('/'));

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

async function getCaseStudy(slug: string) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return null;

  const supabase = await createSupabaseServerClient();
  const slugs = slug.toLowerCase() === slug ? [slug] : [slug, slug.toLowerCase()];

  const { data, error } = await supabase
    .from('project_case_studies')
    .select(
      'id,slug,overview,problem,solution,results,content_md,stack,screenshots,og_image,is_published,show_on_phion,project:projects(id,title,description,link,github_url,tags,stack,image,status)'
    )
    .in('slug', slugs)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  if ((data as any)?.is_published === false) return null;
  if ((data as any)?.show_on_phion === false) return null;

  return data as unknown as CaseStudyRow;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(String(rawSlug ?? '')).trim();

  const caseStudy = slug ? await getCaseStudy(slug) : null;
  const title = caseStudy?.project?.title ? `${caseStudy.project.title} — Case Study` : 'Case Study';
  const description = caseStudy?.overview?.trim() || caseStudy?.project?.description?.trim() || 'Project case study.';
  const ogImage = caseStudy?.og_image?.trim() || caseStudy?.project?.image?.trim() || null;
  const images = ogImage ? [{ url: ogImage }] : undefined;

  return {
    title,
    description,
    openGraph: images ? { title, description, images } : { title, description },
    twitter: images ? { card: 'summary_large_image', title, description, images: [ogImage as string] } : undefined,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(String(rawSlug ?? '')).trim();

  const caseStudy = slug ? await getCaseStudy(slug) : null;

  if (!caseStudy || !caseStudy.project) {
    return (
      <SiteShell contentMode="full">
        <div className="mx-auto max-w-6xl px-4 pt-10">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Case Study</p>
            <h1 className="mt-3 text-2xl font-sans font-semibold text-white">Not found</h1>
            <p className="mt-2 text-sm text-white/50">This case study is not available.</p>
            <Link
              href="/#projects"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  const project = caseStudy.project;
  const stack = (Array.isArray(caseStudy.stack) && caseStudy.stack.length ? caseStudy.stack : project.stack) ?? [];
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const chips = stack.length > 0 ? stack : tags;
  const screenshotSrcs = (Array.isArray(caseStudy.screenshots) ? caseStudy.screenshots : []).filter((src) =>
    isLocalImageSrc(src)
  );

  return (
    <SiteShell contentMode="full">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3" data-gsap="reveal">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-[var(--home-muted)] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to projects</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              aria-label={`Open ${project.title}`}
            >
              Live
              <ArrowUpRight className="h-4 w-4" />
            </a>
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                aria-label={`Open ${project.title} repository`}
              >
                <Github className="h-4 w-4" />
                Repo
              </a>
            ) : null}
          </div>
        </div>

        <header className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" data-gsap="reveal">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Case Study</p>
            <h1 className="text-3xl font-sans font-semibold leading-tight text-white sm:text-4xl">{project.title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--home-muted)]">{caseStudy.overview}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                {project.status}
              </span>
              {chips.slice(0, 8).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="flex items-center gap-2 text-white/80">
              <BookOpen className="h-4 w-4 text-[var(--home-accent)]" />
              <p className="text-sm font-semibold">Summary</p>
            </div>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">{project.description}</p>
            {caseStudy.results ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Outcome</p>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{caseStudy.results}</p>
              </div>
            ) : null}
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            {caseStudy.problem ? (
              <section className="rounded-3xl border border-white/10 bg-black/30 p-6" data-gsap="reveal">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Problem</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{caseStudy.problem}</p>
              </section>
            ) : null}

            {caseStudy.solution ? (
              <section className="rounded-3xl border border-white/10 bg-black/30 p-6" data-gsap="reveal">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Solution</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{caseStudy.solution}</p>
              </section>
            ) : null}

            {caseStudy.content_md ? (
              <section className="rounded-3xl border border-white/10 bg-black/30 p-6" data-gsap="reveal">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Details</p>
                <div className="mt-4">
                  <BlogMarkdown content={caseStudy.content_md} />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6" data-gsap="reveal">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Stack</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.length === 0 ? (
                  <p className="text-sm text-white/50">No stack data yet.</p>
                ) : (
                  chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60"
                    >
                      {chip}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Screenshots</p>
              {screenshotSrcs.length === 0 ? (
                <p className="mt-3 text-sm text-white/50">Add local screenshot paths in Supabase to show previews.</p>
              ) : (
                <div className="mt-4 grid gap-4">
                  {screenshotSrcs.slice(0, 6).map((src, idx) => (
                    <div
                      key={`${src}-${idx}`}
                      className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-[var(--home-soft)]"
                    >
                      <Image
                        src={src}
                        alt={`${project.title} screenshot ${idx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 420px"
                        className="object-cover"
                      />
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

