import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

type CaseStudyProject = {
  id: string;
  title: string;
  description: string;
  link: string;
  github_url?: string | null;
  tags: string[];
  stack: string[];
  image?: string | null;
  status: string;
  icon?: string | null;
  is_featured?: boolean | null;
};

type CaseStudyRow = {
  id: string;
  slug: string;
  overview: string;
  problem?: string | null;
  solution?: string | null;
  results?: string | null;
  content_md?: string | null;
  stack: string[];
  screenshots: string[];
  og_image?: string | null;
  sort_order?: number | null;
  project: CaseStudyProject | null;
};

const normalizeProject = (value: any): CaseStudyProject | null => {
  const id = String(value?.id ?? '').trim();
  const title = String(value?.title ?? '').trim();
  const description = String(value?.description ?? '').trim();
  const link = String(value?.link ?? '').trim();
  const status = String(value?.status ?? '').trim();
  const githubRaw = typeof value?.github_url === 'string' ? value.github_url : '';
  const imageRaw = typeof value?.image === 'string' ? value.image : '';
  const iconRaw = typeof value?.icon === 'string' ? value.icon : '';
  const tags = Array.isArray(value?.tags) ? (value.tags as unknown[]).map((t) => String(t)).filter(Boolean) : [];
  const stack = Array.isArray(value?.stack)
    ? (value.stack as unknown[]).map((t) => String(t)).filter(Boolean)
    : [];
  const is_featured = typeof value?.is_featured === 'boolean' ? value.is_featured : null;

  if (!id || !title || !description || !link || !status) return null;
  return {
    id,
    title,
    description,
    link,
    status,
    tags,
    stack,
    github_url: githubRaw.trim() ? githubRaw.trim() : null,
    image: imageRaw.trim() ? imageRaw.trim() : null,
    icon: iconRaw.trim() ? iconRaw.trim() : null,
    is_featured,
  };
};

const normalizeCaseStudy = (value: any): CaseStudyRow | null => {
  const id = String(value?.id ?? '').trim();
  const slug = String(value?.slug ?? '').trim();
  const overview = String(value?.overview ?? '').trim();
  const problemRaw = typeof value?.problem === 'string' ? value.problem : '';
  const solutionRaw = typeof value?.solution === 'string' ? value.solution : '';
  const resultsRaw = typeof value?.results === 'string' ? value.results : '';
  const contentRaw = typeof value?.content_md === 'string' ? value.content_md : '';
  const ogImageRaw = typeof value?.og_image === 'string' ? value.og_image : '';
  const stack = Array.isArray(value?.stack) ? (value.stack as unknown[]).map((t) => String(t)).filter(Boolean) : [];
  const screenshots = Array.isArray(value?.screenshots)
    ? (value.screenshots as unknown[]).map((t) => String(t)).filter(Boolean)
    : [];
  const sort_order =
    typeof value?.sort_order === 'number' && Number.isFinite(value.sort_order) ? value.sort_order : null;
  const project = normalizeProject(value?.project);

  if (!id || !slug || !overview) return null;
  return {
    id,
    slug,
    overview,
    problem: problemRaw.trim() ? problemRaw.trim() : null,
    solution: solutionRaw.trim() ? solutionRaw.trim() : null,
    results: resultsRaw.trim() ? resultsRaw.trim() : null,
    content_md: contentRaw.trim() ? contentRaw.trim() : null,
    og_image: ogImageRaw.trim() ? ogImageRaw.trim() : null,
    stack,
    screenshots,
    sort_order,
    project,
  };
};

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    const supabaseKey = supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { caseStudy: null, caseStudies: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { searchParams } = new URL(request.url);
    const slug = String(searchParams.get('slug') ?? '').trim();

    if (slug) {
      const { data, error } = await supabase
        .from('project_case_studies')
        .select(
          'id,slug,overview,problem,solution,results,content_md,stack,screenshots,og_image,sort_order,is_published,show_on_phion,project:projects(id,title,description,link,github_url,tags,stack,image,status,icon,is_featured)'
        )
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data || data?.is_published === false || data?.show_on_phion === false) {
        return NextResponse.json(
          { caseStudy: null },
          { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
        );
      }

      const normalized = normalizeCaseStudy(data);
      return NextResponse.json(
        { caseStudy: normalized },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const { data, error } = await supabase
      .from('project_case_studies')
      .select(
        'id,slug,overview,og_image,sort_order,is_published,show_on_phion,created_at,project:projects(id,title,description,link,status,image)'
      )
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) {
      return NextResponse.json(
        { caseStudy: null, caseStudies: [] },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    const caseStudies = (data as any[])
      .filter((row) => row?.is_published !== false && row?.show_on_phion !== false)
      .map(normalizeCaseStudy)
      .filter((row): row is CaseStudyRow => Boolean(row));

    return NextResponse.json(
      { caseStudies },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return NextResponse.json(
      { caseStudy: null, caseStudies: [] },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }
}
