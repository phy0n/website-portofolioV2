'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';

type BlogAction = (formData: FormData) => void | Promise<void>;

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  chapters?: string[] | null;
  author: string;
  date: string;
  category: string;
  tags: string[] | null;
  image: string | null;
  featured: boolean;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
};

const formatDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.split('T')[0];
};

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';
const textareaClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';
const selectClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none admin-select';
const tableSelectClassName =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none admin-select';

const resolveTargetValue = (value: boolean | null | undefined) => value !== false;

const slugify = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = 5 * 1024 * 1024;

function useLockBody(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useLockBody(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      <div className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-[#13131b] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2 hide-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function StatusSelect({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="relative">
      <select
        name="is_published"
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={pending}
        className={`${tableSelectClassName} ${pending ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      {pending && (
        <span className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
      )}
    </div>
  );
}

export default function BlogManager({
  blogs,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  successMessage,
  errorMessage,
}: {
  blogs: Blog[];
  createBlog: BlogAction;
  updateBlog: BlogAction;
  updateBlogStatus: BlogAction;
  deleteBlog: BlogAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(() => searchParams.get('create') === '1');
  const [editId, setEditId] = useState<string | null>(() => searchParams.get('edit'));
  const editingBlog = useMemo(() => {
    if (!editId) return null;
    return blogs.find((blog) => blog.id === editId) ?? null;
  }, [blogs, editId]);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [createImageError, setCreateImageError] = useState<string | null>(null);
  const [editImageError, setEditImageError] = useState<string | null>(null);
  const [createFileKey, setCreateFileKey] = useState(0);
  const [editFileKey, setEditFileKey] = useState(0);
  const [createTitleValue, setCreateTitleValue] = useState('');
  const [editTitleValue, setEditTitleValue] = useState<string | null>(null);
  const [createCategoryValue, setCreateCategoryValue] = useState('Life');
  const [createChapters, setCreateChapters] = useState<string[]>(['']);
  const [createActiveChapter, setCreateActiveChapter] = useState(0);
  const [editChapters, setEditChapters] = useState<string[]>(['']);
  const [editActiveChapter, setEditActiveChapter] = useState(0);
  const [listQuery, setListQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categoryOptions = useMemo(
    () => ['Life', 'Love', 'Daily', 'Motivation'],
    []
  );

  const editCategory = String(editingBlog?.category || '').trim();
  const editCategoryOptions =
    editCategory && !categoryOptions.includes(editCategory)
      ? [editCategory, ...categoryOptions]
      : categoryOptions;
  const createSlug = slugify(createTitleValue);
  const editSlug = slugify((editTitleValue ?? editingBlog?.title) || '');

  const normalizeChapters = (value: string[]) => {
    const cleaned = value.map((entry) => String(entry ?? '')).map((entry) => entry);
    return cleaned.length === 0 ? [''] : cleaned;
  };

  const removeCreateChapter = (index: number) => {
    setCreateChapters((prev) => {
      const next = normalizeChapters(prev.filter((_, idx) => idx !== index));
      setCreateActiveChapter((currentActive) => {
        const removedBefore = index < currentActive;
        const removedActive = index === currentActive;
        const shifted = removedBefore ? currentActive - 1 : currentActive;
        const tentative = removedActive ? Math.min(shifted, next.length - 1) : shifted;
        return Math.max(0, Math.min(tentative, next.length - 1));
      });
      return next;
    });
  };

  const removeEditChapter = (index: number) => {
    setEditChapters((prev) => {
      const next = normalizeChapters(prev.filter((_, idx) => idx !== index));
      setEditActiveChapter((currentActive) => {
        const removedBefore = index < currentActive;
        const removedActive = index === currentActive;
        const shifted = removedBefore ? currentActive - 1 : currentActive;
        const tentative = removedActive ? Math.min(shifted, next.length - 1) : shifted;
        return Math.max(0, Math.min(tentative, next.length - 1));
      });
      return next;
    });
  };

  const addCreateChapter = () => {
    setCreateChapters((prev) => {
      const next = [...prev, ''];
      setCreateActiveChapter(next.length - 1);
      return next;
    });
  };

  const addEditChapter = () => {
    setEditChapters((prev) => {
      const next = [...prev, ''];
      setEditActiveChapter(next.length - 1);
      return next;
    });
  };
  const filteredRows = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    return blogs.filter((blog) => {
      if (featuredOnly && !blog.featured) return false;
      if (statusFilter === 'draft' && blog.is_published !== false) return false;
      if (statusFilter === 'published' && blog.is_published === false) return false;
      if (!query) return true;
      const haystack = `${blog.title} ${blog.slug}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [blogs, featuredOnly, listQuery, statusFilter]);
  const toast = useMemo(() => {
    if (errorMessage) return { message: errorMessage, tone: 'error' as const };
    if (successMessage) return { message: successMessage, tone: 'success' as const };
    return null;
  }, [errorMessage, successMessage]);

  useEffect(() => {
    return () => {
      if (createImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(createImagePreview);
      }
    };
  }, [createImagePreview]);

  useEffect(() => {
    return () => {
      if (editImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  const handleCreateImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (createImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(createImagePreview);
    }
    if (!file) {
      setCreateImageError(null);
      setCreateImagePreview(null);
      return;
    }
    if (!allowedImageTypes.has(file.type)) {
      setCreateImageError('Image must be PNG, JPG, or WebP.');
      setCreateImagePreview(null);
      setCreateFileKey((prev) => prev + 1);
      return;
    }
    if (file.size > maxImageBytes) {
      setCreateImageError('Image must be under 5MB.');
      setCreateImagePreview(null);
      setCreateFileKey((prev) => prev + 1);
      return;
    }
    setCreateImageError(null);
    setCreateImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (editImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreview);
    }
    if (!file) {
      setEditImageError(null);
      setEditImagePreview(null);
      return;
    }
    if (!allowedImageTypes.has(file.type)) {
      setEditImageError('Image must be PNG, JPG, or WebP.');
      setEditImagePreview(null);
      setEditFileKey((prev) => prev + 1);
      return;
    }
    if (file.size > maxImageBytes) {
      setEditImageError('Image must be under 5MB.');
      setEditImagePreview(null);
      setEditFileKey((prev) => prev + 1);
      return;
    }
    setEditImageError(null);
    setEditImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Content</p>
          <h2 className="text-3xl font-semibold text-white">Blog Manager</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">Total: {blogs.length}</span>
          <button
            type="button"
            title="Add blog"
            aria-label="Add blog"
            onClick={() => {
              setEditId(null);
              setCreateOpen(true);
            }}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add blog
          </button>
        </div>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-3" data-gsap="reveal">
        <h3 className="text-lg font-semibold text-white">Blog list</h3>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search title or /slug..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className={`${tableSelectClassName} min-w-[150px]`}
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(event) => setFeaturedOnly(event.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Featured only
          </label>
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredRows.length} / {blogs.length}
          </span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                    No blogs yet.
                  </td>
                </tr>
              )}
              {blogs.length > 0 && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different filter.
                  </td>
                </tr>
              )}
              {filteredRows.map((blog) => (
                <tr key={blog.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{blog.title}</p>
                      {blog.featured && (
                        <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-red-200">
                          Featured
                        </span>
                      )}
                      {blog.is_published === false && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                          Draft
                        </span>
                      )}
                      {(() => {
                        const showMain = resolveTargetValue(blog.show_on_main);
                        const showPhion = resolveTargetValue(blog.show_on_phion);
                        return (
                          <>
                            {showMain && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                                Main
                              </span>
                            )}
                            {showPhion && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                                Phion
                              </span>
                            )}
                            {!showMain && !showPhion && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                                Hidden
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-white/40">/{blog.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-white/70">{blog.category}</td>
                  <td className="px-4 py-4 text-white/70">{formatDateInput(blog.date)}</td>
                  <td className="px-4 py-4 text-white/70">
                    <form action={updateBlogStatus} className="min-w-[140px]">
                      <input type="hidden" name="redirect_to" value="/admin/blogs" />
                      <input type="hidden" name="id" value={blog.id} />
                      <input type="hidden" name="slug" value={blog.slug} />
                      <StatusSelect
                        defaultValue={blog.is_published ? 'published' : 'draft'}
                        onChange={(event) => event.currentTarget.form?.requestSubmit()}
                      />
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Edit blog"
                        aria-label="Edit blog"
                        onClick={() => {
                          setEditTitleValue(null);
                          setEditImagePreview(null);
                          setCreateOpen(false);
                          const raw = (blog as any)?.chapters;
                          if (Array.isArray(raw) && raw.length > 0) {
                            setEditChapters(raw.map((entry) => (typeof entry === 'string' ? entry : '')));
                          } else {
                            setEditChapters([String((blog as any)?.content ?? '')]);
                          }
                          setEditActiveChapter(0);
                          setEditId(blog.id);
                        }}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <a
                        href={`/blog/${encodeURIComponent(blog.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                      >
                        View
                      </a>
                      <form
                        action={deleteBlog}
                        className="inline-flex"
                        onSubmit={(event) => {
                          if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="redirect_to" value="/admin/blogs" />
                        <input type="hidden" name="id" value={blog.id} />
                        <input type="hidden" name="slug" value={blog.slug} />
                        <AdminSubmitButton
                          pendingText="Deleting..."
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </AdminSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={createOpen}
        title="Create new blog"
        onClose={() => {
          setCreateImagePreview(null);
          setCreateImageError(null);
          setCreateFileKey((prev) => prev + 1);
          setCreateTitleValue('');
          setCreateCategoryValue('Life');
          setCreateChapters(['']);
          setCreateActiveChapter(0);
          setCreateOpen(false);
        }}
      >
        <form action={createBlog} className="grid gap-6">
          <input type="hidden" name="redirect_to" value="/admin/blogs" />
          <input type="hidden" name="slug" value={createSlug} />
          <input type="hidden" name="chapters" value={JSON.stringify(createChapters)} />

          <div className="grid gap-6 lg:grid-cols-12">
            <section className="space-y-4 lg:col-span-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/60">Title</label>
                  <input
                    name="title"
                    required
                    value={createTitleValue}
                    onChange={(event) => setCreateTitleValue(event.target.value)}
                    className={inputClassName}
                    placeholder="Story title"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60">Slug</label>
                  <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                    {createSlug ? `/${createSlug}` : 'Auto from title'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60">Excerpt</label>
                <textarea name="excerpt" required rows={2} className={textareaClassName} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Chapters</p>
                    <p className="mt-1 text-xs text-white/40">Add unlimited chapters. Chapter 1 is the default.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addCreateChapter}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {createChapters.map((_, index) => (
                    <button
                      key={`create-chapter-${index}`}
                      type="button"
                      onClick={() => setCreateActiveChapter(index)}
                      className={
                        index === createActiveChapter
                          ? 'inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white'
                          : 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:border-white/30 hover:text-white'
                      }
                    >
                      Chapter {index + 1}
                      {createChapters.length > 1 ? (
                        <span
                          role="presentation"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeCreateChapter(index);
                          }}
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/10 text-[10px] leading-none text-white/60 hover:text-white"
                          title="Remove"
                        >
                          ×
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm text-white/60">Content</label>
                    <p className="text-xs text-white/40">Chapter {createActiveChapter + 1} of {createChapters.length}</p>
                  </div>

                  <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
                    <div className="p-3">
                      <div className="overflow-hidden">
                        <div
                          className="flex transition-transform duration-500 ease-out will-change-transform"
                          style={{ transform: `translateX(-${createActiveChapter * 100}%)` }}
                        >
                          {createChapters.map((value, index) => (
                            <div key={`create-chapter-panel-${index}`} className="w-full shrink-0 px-1">
                              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Chapter {index + 1}</p>
                                  {createChapters.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => removeCreateChapter(index)}
                                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                                <textarea
                                  required={index === 0}
                                  rows={10}
                                  value={value ?? ''}
                                  onChange={(event) => {
                                    const nextValue = event.target.value;
                                    setCreateChapters((prev) => {
                                      const next = [...prev];
                                      next[index] = nextValue;
                                      return next;
                                    });
                                  }}
                                  className={textareaClassName}
                                  placeholder="Write chapter content..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCreateActiveChapter((prev) => Math.max(0, prev - 1))}
                            disabled={createActiveChapter === 0}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition enabled:hover:border-white/30 enabled:hover:bg-white/10 disabled:opacity-40"
                          >
                            Prev
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateActiveChapter((prev) => Math.min(createChapters.length - 1, prev + 1))}
                            disabled={createActiveChapter >= createChapters.length - 1}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition enabled:hover:border-white/30 enabled:hover:bg-white/10 disabled:opacity-40"
                          >
                            Next
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={addCreateChapter}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                          <Plus className="h-4 w-4" />
                          Add chapter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <input type="hidden" name="content" value={createChapters[0] ?? ''} />
              </div>
            </section>

            <aside className="space-y-4 lg:col-span-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-white/60">Author</label>
                  <input name="author" required className={inputClassName} placeholder="Phion" />
                </div>
                <div>
                  <label className="text-sm text-white/60">Date</label>
                  <input name="date" type="date" required className={inputClassName} />
                </div>
                <div>
                  <label className="text-sm text-white/60">Category</label>
                  <select
                    name="category"
                    value={createCategoryValue}
                    onChange={(event) => setCreateCategoryValue(event.target.value)}
                    required
                    className={selectClassName}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <label className="text-sm text-white/60">Status</label>
                    <select name="is_published" defaultValue="published" className={selectClassName}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Featured</label>
                    <select name="featured" defaultValue="standard" className={selectClassName}>
                      <option value="standard">Standard</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Post to</p>
                  <p className="mt-1 text-xs text-white/40">
                    Select destinations (leave empty to hide on both sites).
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <label className="inline-flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        name="show_on_main"
                        value="true"
                        defaultChecked
                        className="h-4 w-4 accent-white"
                      />
                      MainPortofolio
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        name="show_on_phion"
                        value="true"
                        defaultChecked
                        className="h-4 w-4 accent-white"
                      />
                      PhionPortofolio
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60">Tags</label>
                  <input name="tags" className={inputClassName} placeholder="life, love, daily" />
                  <p className="mt-2 text-xs text-white/40">Comma separated (optional).</p>
                </div>

                <div>
                  <label className="text-sm text-white/60">Local Image</label>
                  <input
                    key={createFileKey}
                    name="image_file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCreateImageChange}
                    className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                  />
                  <p className="mt-2 text-xs text-white/40">PNG/JPG/WebP, max 5MB.</p>
                  {createImageError && <p className="mt-2 text-xs text-red-300">{createImageError}</p>}
                  {createImagePreview && (
                    <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <Image
                        src={createImagePreview}
                        alt="Preview"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <AdminSubmitButton
            pendingText="Saving..."
            className="inline-flex w-full items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
          >
            Submit
          </AdminSubmitButton>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingBlog)}
        title="Edit blog"
        onClose={() => {
          setEditTitleValue(null);
          setEditImagePreview(null);
          setEditImageError(null);
          setEditFileKey((prev) => prev + 1);
          setEditChapters(['']);
          setEditActiveChapter(0);
          setEditId(null);
        }}
      >
        {editingBlog && (
          <form
            action={updateBlog}
            className="grid gap-6"
            key={editingBlog.id}
          >
            <input type="hidden" name="redirect_to" value="/admin/blogs" />
            <input type="hidden" name="id" value={editingBlog.id} />
            <input type="hidden" name="current_image" value={editingBlog.image ?? ''} />
            <input type="hidden" name="slug" value={editSlug} />
            <input type="hidden" name="chapters" value={JSON.stringify(editChapters)} />

            <div className="grid gap-6 lg:grid-cols-12">
              <section className="space-y-4 lg:col-span-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-white/60">Title</label>
                    <input
                      name="title"
                      required
                      defaultValue={editingBlog.title}
                      onChange={(event) => setEditTitleValue(event.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Slug</label>
                    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                      {editSlug ? `/${editSlug}` : 'Auto from title'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60">Excerpt</label>
                  <textarea
                    name="excerpt"
                    required
                    rows={2}
                    defaultValue={editingBlog.excerpt}
                    className={textareaClassName}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Chapters</p>
                      <p className="mt-1 text-xs text-white/40">Unlimited chapters. Use chapters for longer posts.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addEditChapter}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {editChapters.map((_, index) => (
                      <button
                        key={`edit-chapter-${index}`}
                        type="button"
                        onClick={() => setEditActiveChapter(index)}
                        className={
                          index === editActiveChapter
                            ? 'inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white'
                            : 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:border-white/30 hover:text-white'
                        }
                      >
                        Chapter {index + 1}
                        {editChapters.length > 1 ? (
                          <span
                            role="presentation"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeEditChapter(index);
                            }}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/10 text-[10px] leading-none text-white/60 hover:text-white"
                            title="Remove"
                          >
                            ×
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm text-white/60">Content</label>
                      <p className="text-xs text-white/40">Chapter {editActiveChapter + 1} of {editChapters.length}</p>
                    </div>

                    <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
                      <div className="p-3">
                        <div className="overflow-hidden">
                          <div
                            className="flex transition-transform duration-500 ease-out will-change-transform"
                            style={{ transform: `translateX(-${editActiveChapter * 100}%)` }}
                          >
                            {editChapters.map((value, index) => (
                              <div key={`edit-chapter-panel-${index}`} className="w-full shrink-0 px-1">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Chapter {index + 1}</p>
                                    {editChapters.length > 1 ? (
                                      <button
                                        type="button"
                                        onClick={() => removeEditChapter(index)}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                                      >
                                        Remove
                                      </button>
                                    ) : null}
                                  </div>
                                  <textarea
                                    required={index === 0}
                                    rows={10}
                                    value={value ?? ''}
                                    onChange={(event) => {
                                      const nextValue = event.target.value;
                                      setEditChapters((prev) => {
                                        const next = [...prev];
                                        next[index] = nextValue;
                                        return next;
                                      });
                                    }}
                                    className={textareaClassName}
                                    placeholder="Write chapter content..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditActiveChapter((prev) => Math.max(0, prev - 1))}
                              disabled={editActiveChapter === 0}
                              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition enabled:hover:border-white/30 enabled:hover:bg-white/10 disabled:opacity-40"
                            >
                              Prev
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditActiveChapter((prev) => Math.min(editChapters.length - 1, prev + 1))}
                              disabled={editActiveChapter >= editChapters.length - 1}
                              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition enabled:hover:border-white/30 enabled:hover:bg-white/10 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={addEditChapter}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                            Add chapter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <input type="hidden" name="content" value={editChapters[0] ?? ''} />
                </div>
              </section>

              <aside className="space-y-4 lg:col-span-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm text-white/60">Author</label>
                    <input
                      name="author"
                      required
                      defaultValue={editingBlog.author}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Date</label>
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={formatDateInput(editingBlog.date)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Category</label>
                    <select
                      name="category"
                      defaultValue={editingBlog.category}
                      required
                      className={selectClassName}
                    >
                      {editCategoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    <div>
                      <label className="text-sm text-white/60">Status</label>
                      <select
                        name="is_published"
                        defaultValue={editingBlog.is_published === false ? 'draft' : 'published'}
                        className={selectClassName}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-white/60">Featured</label>
                      <select
                        name="featured"
                        defaultValue={editingBlog.featured ? 'featured' : 'standard'}
                        className={selectClassName}
                      >
                        <option value="standard">Standard</option>
                        <option value="featured">Featured</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Post to</p>
                    <p className="mt-1 text-xs text-white/40">
                      Select destinations (leave empty to hide on both sites).
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      <label className="inline-flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          name="show_on_main"
                          value="true"
                          defaultChecked={resolveTargetValue(editingBlog.show_on_main)}
                          className="h-4 w-4 accent-white"
                        />
                        MainPortofolio
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          name="show_on_phion"
                          value="true"
                          defaultChecked={resolveTargetValue(editingBlog.show_on_phion)}
                          className="h-4 w-4 accent-white"
                        />
                        PhionPortofolio
                      </label>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
            <div>
              <label className="text-sm text-white/60">Tags</label>
              <input
                name="tags"
                defaultValue={(editingBlog.tags ?? []).join(', ')}
                className={inputClassName}
                placeholder="life, love, daily"
              />
              <p className="mt-2 text-xs text-white/40">Comma separated (optional).</p>
            </div>
            <div>
              <label className="text-sm text-white/60">Local Image</label>
              <input
                key={`${editingBlog.id}-${editFileKey}`}
                name="image_file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleEditImageChange}
                className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
              />
              <p className="mt-2 text-xs text-white/40">PNG/JPG/WebP, max 5MB.</p>
              {editImageError && <p className="mt-2 text-xs text-red-300">{editImageError}</p>}
              {(editImagePreview || editingBlog.image) && (
                <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <Image
                    src={editImagePreview ?? editingBlog.image ?? ''}
                    alt="Preview"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {editingBlog.image && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="min-w-0 truncate text-xs text-white/50">{editingBlog.image}</p>
                  <a
                    href={editingBlog.image}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs text-[var(--home-accent)] hover:text-[var(--home-accent)]"
                  >
                    Open
                  </a>
                </div>
              )}
            </div>
            <AdminSubmitButton
              pendingText="Saving..."
              className="inline-flex w-full items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
            >
              Submit
            </AdminSubmitButton>
          </form>
        )}
      </Modal>
    </div>
  );
}
