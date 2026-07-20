'use client';

import { useEffect, useMemo, useState, useRef, type ChangeEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Pencil, Plus, Trash2, X, ChevronLeft, ChevronRight, BookOpen, Bold, Italic, Underline, Heading2, Heading3, List, Quote, Link as LinkIcon, Code } from 'lucide-react';
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

const MAX_PAGE_CHARS = 2500;

const formatDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.split('T')[0];
};

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[var(--home-accent)] focus:bg-white/5 transition-colors focus:outline-none';
const textareaClassName =
  'mt-2 w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[var(--home-accent)] focus:bg-white/5 transition-colors focus:outline-none';
const selectClassName =
  'mt-2 w-full rounded-xl border border-white/5 bg-[#0f0f15] px-4 py-3 text-sm text-white focus:border-[var(--home-accent)] transition-colors focus:outline-none admin-select';
const tableSelectClassName =
  'w-full rounded-lg border border-white/10 bg-[#0f0f15] px-3 py-1.5 text-xs text-white focus:border-[var(--home-accent)] transition-colors focus:outline-none admin-select';

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

function FullScreenModal({
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] text-white font-nunito animate-fade-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-transparent">
        <h3 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <div className="max-w-7xl w-full mx-auto p-6 md:p-8">
          {children}
        </div>
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
        className={`${tableSelectClassName} ${pending ? 'cursor-not-allowed opacity-60' : ''}`}>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      {pending && (
        <span className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
      )}
    </div>
  );
}

function ChapterEditor({
  value,
  onChange,
  index,
  removeChapter,
  canRemove
}: {
  value: string;
  onChange: (value: string) => void;
  index: number;
  removeChapter: (index: number) => void;
  canRemove: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      let initialHtml = value;
      if (!/<[a-z][\s\S]*>/i.test(value)) {
         initialHtml = value.replace(/\n/g, '<br>');
      }
      editorRef.current.innerHTML = initialHtml;
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const btnClass = "p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors focus:outline-none";

  return (
    <div className="bg-[#0b0b0f] border border-white/5 rounded-[2rem] p-6 md:p-12 shadow-2xl relative min-h-[75vh] flex flex-col group">
      <style dangerouslySetInnerHTML={{__html: `
        .wysiwyg-content b, .wysiwyg-content strong { font-weight: bold; }
        .wysiwyg-content i, .wysiwyg-content em { font-style: italic; }
        .wysiwyg-content u { text-decoration: underline; }
        .wysiwyg-content h2 { font-size: 1.75rem; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; color: white; }
        .wysiwyg-content h3 { font-size: 1.35rem; font-weight: bold; margin-top: 1rem; margin-bottom: 1rem; color: white; }
        .wysiwyg-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .wysiwyg-content blockquote { border-left: 2px solid var(--home-accent); padding-left: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; }
        .wysiwyg-content a { color: var(--home-accent); text-decoration: underline; text-underline-offset: 4px; }
        .wysiwyg-content pre { background: #07070b; padding: 1rem; border-radius: 1rem; overflow-x: auto; font-family: monospace; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
      `}} />
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <span className="text-xs font-mono text-[var(--home-accent)] uppercase tracking-widest">Page {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={() => removeChapter(index)} className="text-xs font-mono tracking-wider text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100">
            Remove Page
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 border-b border-white/5 pb-4 mb-6">
        <button type="button" onClick={() => exec('bold')} className={btnClass} title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('italic')} className={btnClass} title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('underline')} className={btnClass} title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onClick={() => exec('formatBlock', 'H2')} className={btnClass} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('formatBlock', 'H3')} className={btnClass} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onClick={() => exec('insertUnorderedList')} className={btnClass} title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('formatBlock', 'BLOCKQUOTE')} className={btnClass} title="Blockquote">
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onClick={() => {
          const url = prompt('Enter link URL:');
          if (url) exec('createLink', url);
        }} className={btnClass} title="Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('formatBlock', 'PRE')} className={btnClass} title="Code Block">
          <Code className="w-4 h-4" />
        </button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        style={{ minHeight: '500px' }}
        className="w-full flex-1 bg-transparent font-serif text-lg md:text-xl leading-[1.8] text-white/90 focus:outline-none overflow-y-auto wysiwyg-content"/>
      
      <div className="mt-6 flex justify-between items-center text-xs font-mono text-white/30 border-t border-white/5 pt-4">
        <span>{value.replace(/<[^>]*>?/gm, '').length} / {MAX_PAGE_CHARS}</span>
        { value.replace(/<[^>]*>?/gm, '').length >= MAX_PAGE_CHARS && <span className="text-[var(--home-accent)]">Page full! Add a new page to continue.</span> }
      </div>
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

  const renderBookPages = (
    chapters: string[],
    activeChapter: number,
    setChapters: React.Dispatch<React.SetStateAction<string[]>>,
    setActiveChapter: React.Dispatch<React.SetStateAction<number>>,
    addChapter: () => void,
    removeChapter: (index: number) => void
  ) => {
    return (
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-mono uppercase tracking-widest text-white/40">Story Pages</p>
        </div>
        
        <div className="relative mx-auto w-full">
           <div className="overflow-hidden">
             <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ transform: `translateX(-${activeChapter * 100}%)` }}>
               {chapters.map((value, index) => (
                 <div key={index} className="w-full shrink-0 px-2 md:px-4">
                   <ChapterEditor
                     value={value ?? ''}
                     onChange={(nextValue) => {
                       setChapters(prev => { const next = [...prev]; next[index] = nextValue; return next; });
                     }}
                     index={index}
                     removeChapter={removeChapter}
                     canRemove={chapters.length > 1}
                   />
                 </div>
               ))}
             </div>
           </div>
           
           <div className="mt-8 flex items-center justify-between max-w-lg mx-auto bg-white/[0.02] border border-white/5 rounded-full p-2">
             <button
               type="button"
               onClick={() => setActiveChapter(prev => Math.max(0, prev - 1))}
               disabled={activeChapter === 0}
               className="flex items-center gap-2 px-6 py-3 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5">
               <ChevronLeft className="w-4 h-4"/> <span className="text-xs font-mono uppercase tracking-widest">Prev</span>
             </button>
             
             <span className="text-xs font-mono text-[var(--home-accent)] px-4">{activeChapter + 1} / {chapters.length}</span>
             
             {activeChapter === chapters.length - 1 ? (
               <button
                 type="button"
                 onClick={addChapter}
                 className="flex items-center gap-2 px-6 py-3 rounded-full transition-colors text-[var(--home-accent)] hover:bg-[var(--home-accent)]/10">
                 <span className="text-xs font-mono uppercase tracking-widest">Add Page</span> <Plus className="w-4 h-4"/>
               </button>
             ) : (
               <button
                 type="button"
                 onClick={() => setActiveChapter(prev => Math.min(chapters.length - 1, prev + 1))}
                 className="flex items-center gap-2 px-6 py-3 rounded-full transition-colors hover:bg-white/5">
                 <span className="text-xs font-mono uppercase tracking-widest">Next</span> <ChevronRight className="w-4 h-4"/>
               </button>
             )}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-manrope">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <p className="text-sm font-geist-mono text-white/40 uppercase tracking-[0.2em]">Content</p>
          <h2 className="text-4xl font-light tracking-tight font-manrope text-white">Blog Manager</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">Total: {blogs.length}</span>
          <button
            type="button"
            title="Write story"
            aria-label="Write story"
            onClick={() => {
              setEditId(null);
              setCreateOpen(true);
            }}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-[var(--admin-accent)]/30 px-6 py-2.5 text-sm font-light text-[var(--admin-accent)] transition-all hover:bg-[var(--admin-accent)]/10">
            <BookOpen className="h-4 w-4" />
            Write story
          </button>
        </div>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Blog list</h3>
        <div className="flex flex-wrap items-center gap-3 flex flex-wrap items-center gap-3 border-b border-white/10 pb-4 mb-2">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search title or /slug..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"/>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className={`${tableSelectClassName} min-w-[150px]`}
            aria-label="Filter by status">
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(event) => setFeaturedOnly(event.target.checked)}
              className="h-4 w-4 accent-white"/>
            Featured only
          </label>
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredRows.length} / {blogs.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[10px] font-geist-mono uppercase tracking-widest text-white/30 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
                        onChange={(event) => event.currentTarget.form?.requestSubmit()}/>
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Edit story"
                        aria-label="Edit story"
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
                        className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/5 hover:border-white/20 bg-transparent px-4 py-1.5 text-xs font-light text-white/60 transition hover:text-white">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <a
                        href={`/blog/${encodeURIComponent(blog.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/5 hover:border-white/20 bg-transparent px-4 py-1.5 text-xs font-light text-white/60 transition hover:text-white">
                        View
                      </a>
                      <form
                        action={deleteBlog}
                        className="inline-flex"
                        onSubmit={(event) => {
                          if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) {
                            event.preventDefault();
                          }
                        }}>
                        <input type="hidden" name="redirect_to" value="/admin/blogs" />
                        <input type="hidden" name="id" value={blog.id} />
                        <input type="hidden" name="slug" value={blog.slug} />
                        <AdminSubmitButton
                          pendingText="Deleting..."
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-transparent px-4 py-1.5 text-xs font-light text-red-400/70 transition hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10">
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

      <FullScreenModal
        open={createOpen}
        title="Write a new story"
        onClose={() => {
          setCreateImagePreview(null);
          setCreateImageError(null);
          setCreateFileKey((prev) => prev + 1);
          setCreateTitleValue('');
          setCreateCategoryValue('Life');
          setCreateChapters(['']);
          setCreateActiveChapter(0);
          setCreateOpen(false);
        }}>
        <form action={createBlog} className="flex flex-col gap-12">
          <input type="hidden" name="redirect_to" value="/admin/blogs" />
          <input type="hidden" name="slug" value={createSlug} />
          <input type="hidden" name="chapters" value={JSON.stringify(createChapters)} />
          <input type="hidden" name="content" value={createChapters[0] ?? ''} />

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <div>
                <input
                  name="title"
                  required
                  value={createTitleValue}
                  onChange={(event) => setCreateTitleValue(event.target.value)}
                  className="w-full bg-transparent font-serif text-4xl md:text-6xl text-white placeholder-white/20 focus:outline-none transition-colors border-b border-transparent focus:border-[var(--home-accent)]/30 pb-4"
                  placeholder="Story Title"/>
              </div>
              <div>
                <textarea 
                  name="excerpt" 
                  required 
                  rows={2} 
                  className="w-full bg-transparent font-serif text-xl md:text-2xl text-white/60 placeholder-white/20 italic focus:outline-none resize-none" 
                  placeholder="A short excerpt or prologue..."/>
              </div>
              
              {renderBookPages(createChapters, createActiveChapter, setCreateChapters, setCreateActiveChapter, addCreateChapter, removeCreateChapter)}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-6 space-y-8 bg-[#0b0b0f] border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-mono uppercase tracking-widest text-white/40">Story Details</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40">Author</label>
                    <input name="author" required className={inputClassName} placeholder="Phion" />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40">Date</label>
                    <input name="date" type="date" required className={inputClassName} />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40">Category</label>
                    <select
                      name="category"
                      value={createCategoryValue}
                      onChange={(event) => setCreateCategoryValue(event.target.value)}
                      required
                      className={selectClassName}>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40">Status</label>
                      <select name="is_published" defaultValue="published" className={selectClassName}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40">Featured</label>
                      <select name="featured" defaultValue="standard" className={selectClassName}>
                        <option value="standard">Standard</option>
                        <option value="featured">Featured</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Post Destinations</label>
                    <div className="grid gap-3">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-colors">
                        <input type="checkbox" name="show_on_main" value="true" defaultChecked className="h-4 w-4 accent-[var(--home-accent)]" />
                        <span className="text-sm text-white/80">MainPortofolio</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-colors">
                        <input type="checkbox" name="show_on_phion" value="true" defaultChecked className="h-4 w-4 accent-[var(--home-accent)]" />
                        <span className="text-sm text-white/80">PhionPortofolio</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Tags</label>
                    <input name="tags" className={inputClassName} placeholder="life, love, daily" />
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Cover Image</label>
                    <input
                      key={createFileKey}
                      name="image_file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCreateImageChange}
                      className="w-full text-xs text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20 transition-colors cursor-pointer"/>
                    {createImageError && <p className="mt-2 text-xs text-red-400">{createImageError}</p>}
                    {createImagePreview && (
                      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-white/5 shadow-inner">
                        <Image src={createImagePreview} alt="Preview" fill sizes="100vw" className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <AdminSubmitButton
                    pendingText="Publishing..."
                    className="w-full py-4 rounded-xl bg-[var(--home-accent)] text-white font-bold text-sm uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
                    Publish Story
                  </AdminSubmitButton>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </FullScreenModal>

      <FullScreenModal
        open={Boolean(editingBlog)}
        title="Edit story"
        onClose={() => {
          setEditTitleValue(null);
          setEditImagePreview(null);
          setEditImageError(null);
          setEditFileKey((prev) => prev + 1);
          setEditChapters(['']);
          setEditActiveChapter(0);
          setEditId(null);
        }}>
        {editingBlog && (
          <form action={updateBlog} className="flex flex-col gap-12" key={editingBlog.id}>
            <input type="hidden" name="redirect_to" value="/admin/blogs" />
            <input type="hidden" name="id" value={editingBlog.id} />
            <input type="hidden" name="current_image" value={editingBlog.image ?? ''} />
            <input type="hidden" name="slug" value={editSlug} />
            <input type="hidden" name="chapters" value={JSON.stringify(editChapters)} />
            <input type="hidden" name="content" value={editChapters[0] ?? ''} />

            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <input
                    name="title"
                    required
                    defaultValue={editingBlog.title}
                    onChange={(event) => setEditTitleValue(event.target.value)}
                    className="w-full bg-transparent font-serif text-4xl md:text-6xl text-white placeholder-white/20 focus:outline-none transition-colors border-b border-transparent focus:border-[var(--home-accent)]/30 pb-4"
                    placeholder="Story Title"/>
                </div>
                <div>
                  <textarea 
                    name="excerpt" 
                    required 
                    rows={2} 
                    defaultValue={editingBlog.excerpt}
                    className="w-full bg-transparent font-serif text-xl md:text-2xl text-white/60 placeholder-white/20 italic focus:outline-none resize-none" 
                    placeholder="A short excerpt or prologue..."/>
                </div>
                
                {renderBookPages(editChapters, editActiveChapter, setEditChapters, setEditActiveChapter, addEditChapter, removeEditChapter)}
              </div>

              <aside className="lg:col-span-4">
                <div className="sticky top-6 space-y-8 bg-[#0b0b0f] border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-mono uppercase tracking-widest text-white/40">Story Details</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40">Author</label>
                      <input name="author" required defaultValue={editingBlog.author} className={inputClassName} placeholder="Phion" />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40">Date</label>
                      <input name="date" type="date" required defaultValue={formatDateInput(editingBlog.date)} className={inputClassName} />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40">Category</label>
                      <select name="category" defaultValue={editingBlog.category} required className={selectClassName}>
                        {editCategoryOptions.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono uppercase tracking-widest text-white/40">Status</label>
                        <select name="is_published" defaultValue={editingBlog.is_published === false ? 'draft' : 'published'} className={selectClassName}>
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-mono uppercase tracking-widest text-white/40">Featured</label>
                        <select name="featured" defaultValue={editingBlog.featured ? 'featured' : 'standard'} className={selectClassName}>
                          <option value="standard">Standard</option>
                          <option value="featured">Featured</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Post Destinations</label>
                      <div className="grid gap-3">
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-colors">
                          <input type="checkbox" name="show_on_main" value="true" defaultChecked={resolveTargetValue(editingBlog.show_on_main)} className="h-4 w-4 accent-[var(--home-accent)]" />
                          <span className="text-sm text-white/80">MainPortofolio</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-colors">
                          <input type="checkbox" name="show_on_phion" value="true" defaultChecked={resolveTargetValue(editingBlog.show_on_phion)} className="h-4 w-4 accent-[var(--home-accent)]" />
                          <span className="text-sm text-white/80">PhionPortofolio</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Tags</label>
                      <input name="tags" defaultValue={(editingBlog.tags ?? []).join(', ')} className={inputClassName} placeholder="life, love, daily" />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <label className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2 block">Cover Image</label>
                      <input
                        key={`${editingBlog.id}-${editFileKey}`}
                        name="image_file"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleEditImageChange}
                        className="w-full text-xs text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20 transition-colors cursor-pointer"/>
                      {editImageError && <p className="mt-2 text-xs text-red-400">{editImageError}</p>}
                      {(editImagePreview || editingBlog.image) && (
                        <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-white/5 shadow-inner">
                          <Image src={editImagePreview ?? editingBlog.image ?? ''} alt="Preview" fill sizes="100vw" className="object-cover" unoptimized />
                        </div>
                      )}
                      {editingBlog.image && (
                        <div className="mt-2 flex justify-end">
                          <a href={editingBlog.image} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-widest text-[var(--home-accent)] hover:underline">
                            View Original
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5">
                    <AdminSubmitButton
                      pendingText="Saving..."
                      className="w-full py-4 rounded-xl bg-[var(--home-accent)] text-white font-bold text-sm uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
                      Save Changes
                    </AdminSubmitButton>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        )}
      </FullScreenModal>
    </div>
  );
}
