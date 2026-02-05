'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#13131b] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
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
  const router = useRouter();
  const createOpen = searchParams.get('create') === '1';
  const editId = searchParams.get('edit');
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

  const clearQueryParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const query = params.toString();
    router.replace(query ? `/admin/blogs?${query}` : '/admin/blogs');
  };

  const setQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    const query = params.toString();
    router.replace(query ? `/admin/blogs?${query}` : '/admin/blogs');
  };

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
              setQueryParam('create', '1');
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
                          setQueryParam('edit', blog.id);
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
          clearQueryParam('create');
        }}
      >
        <form action={createBlog} className="grid gap-4">
          <input type="hidden" name="redirect_to" value="/admin/blogs" />
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
              <input type="hidden" name="slug" value={createSlug} />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/60">Excerpt</label>
            <textarea name="excerpt" required rows={2} className={textareaClassName} />
          </div>
          <div>
            <label className="text-sm text-white/60">Content</label>
            <textarea name="content" required rows={6} className={textareaClassName} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
          <div className="grid gap-4 md:grid-cols-2">
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
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
            <input
              name="tags"
              className={inputClassName}
              placeholder="life, love, daily"
            />
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
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img
                  src={createImagePreview}
                  alt="Preview"
                  className="h-32 w-full object-cover"
                />
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
      </Modal>

      <Modal
        open={Boolean(editingBlog)}
        title="Edit blog"
        onClose={() => {
          setEditTitleValue(null);
          setEditImagePreview(null);
          setEditImageError(null);
          setEditFileKey((prev) => prev + 1);
          clearQueryParam('edit');
        }}
      >
        {editingBlog && (
          <form
            action={updateBlog}
            className="grid gap-4"
            key={editingBlog.id}
          >
            <input type="hidden" name="redirect_to" value="/admin/blogs" />
            <input type="hidden" name="id" value={editingBlog.id} />
            <input type="hidden" name="current_image" value={editingBlog.image ?? ''} />
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
                <input type="hidden" name="slug" value={editSlug} />
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
            <div>
              <label className="text-sm text-white/60">Content</label>
              <textarea
                name="content"
                required
                rows={6}
                defaultValue={editingBlog.content}
                className={textareaClassName}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src={editImagePreview ?? editingBlog.image ?? ''}
                    alt="Preview"
                    className="h-32 w-full object-cover"
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
