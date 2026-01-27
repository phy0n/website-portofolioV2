'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
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

const slugify = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#13131b] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30"
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [createFileKey, setCreateFileKey] = useState(0);
  const [editFileKey, setEditFileKey] = useState(0);
  const [createTitleValue, setCreateTitleValue] = useState('');
  const [editTitleValue, setEditTitleValue] = useState('');
  const [createCategoryValue, setCreateCategoryValue] = useState('Life');
  const [editCategoryValue, setEditCategoryValue] = useState('');

  const categoryOptions = useMemo(
    () => ['Life', 'Love', 'Daily', 'Motivation'],
    []
  );

  useEffect(() => {
    if (!isCreateOpen) {
      setCreateImagePreview(null);
      setCreateFileKey((prev) => prev + 1);
      setCreateTitleValue('');
      setCreateCategoryValue('Life');
    }
  }, [isCreateOpen]);

  useEffect(() => {
    if (!editingBlog) {
      setEditCategoryValue('');
      setEditTitleValue('');
      setEditImagePreview(null);
      setEditFileKey((prev) => prev + 1);
      return;
    }
    setEditCategoryValue(editingBlog.category);
    setEditTitleValue(editingBlog.title);
    setEditImagePreview(editingBlog.image ?? null);
    setEditFileKey((prev) => prev + 1);
  }, [editingBlog]);

  const editCategoryOptions = categoryOptions.includes(editCategoryValue)
    ? categoryOptions
    : [editCategoryValue, ...categoryOptions];
  const createSlug = slugify(createTitleValue);
  const editSlug = slugify(editTitleValue || editingBlog?.title || '');
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
      setCreateImagePreview(null);
      return;
    }
    setCreateImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (editImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreview);
    }
    if (!file) {
      setEditImagePreview(editingBlog?.image ?? null);
      return;
    }
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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add blog
          </button>
        </div>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-3" data-gsap="reveal">
        <h3 className="text-lg font-semibold text-white">Blog list</h3>
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
              {blogs.map((blog) => (
                <tr key={blog.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{blog.title}</p>
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
                        onClick={() => setEditingBlog(blog)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <form action={deleteBlog} className="inline-flex">
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

      <Modal open={isCreateOpen} title="Create new blog" onClose={() => setIsCreateOpen(false)}>
        <form action={createBlog} encType="multipart/form-data" className="grid gap-4">
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
        onClose={() => setEditingBlog(null)}
      >
        {editingBlog && (
          <form
            action={updateBlog}
            encType="multipart/form-data"
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
                  value={editTitleValue}
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
                  value={editCategoryValue}
                  onChange={(event) => setEditCategoryValue(event.target.value)}
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
              {editImagePreview && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src={editImagePreview}
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
        )}
      </Modal>
    </div>
  );
}
