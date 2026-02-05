'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Code, Cpu, Database, Globe, Monitor, Server, Smartphone, Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';
import IconPicker, { type IconOption } from '@/components/admin/IconPicker';

type ProjectAction = (formData: FormData) => void | Promise<void>;

type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
  link: string;
  status: string;
  icon: string | null;
  sort_order: number | null;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';
const textareaClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';

const resolveTargetValue = (value: boolean | null | undefined) => value !== false;
const resolvePublishValue = (value: boolean | null | undefined) => value !== false;

const PROJECT_ICON_OPTIONS: IconOption[] = [
  { value: 'Monitor', label: 'Monitor', Icon: Monitor },
  { value: 'Globe', label: 'Globe', Icon: Globe },
  { value: 'Smartphone', label: 'Smartphone', Icon: Smartphone },
  { value: 'Code', label: 'Code', Icon: Code },
  { value: 'Database', label: 'Database', Icon: Database },
  { value: 'Server', label: 'Server', Icon: Server },
  { value: 'Cpu', label: 'CPU', Icon: Cpu },
];

const formatSortOrder = (value: number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '0';
};

const joinTags = (tags: string[] | null | undefined) => {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
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
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#13131b] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
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

export default function ProjectManager({
  projects,
  createProject,
  updateProject,
  deleteProject,
  successMessage,
  errorMessage,
}: {
  projects: Project[];
  createProject: ProjectAction;
  updateProject: ProjectAction;
  deleteProject: ProjectAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createOpen = searchParams.get('create') === '1';
  const editId = searchParams.get('edit');
  const editingProject = useMemo(() => {
    if (!editId) return null;
    return projects.find((project) => project.id === editId) ?? null;
  }, [editId, projects]);
  const [listQuery, setListQuery] = useState('');
  const toast = useMemo(() => {
    if (errorMessage) return { message: errorMessage, tone: 'error' as const };
    if (successMessage) return { message: successMessage, tone: 'success' as const };
    return null;
  }, [errorMessage, successMessage]);

  const clearQueryParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const query = params.toString();
    router.replace(query ? `/admin/projects?${query}` : '/admin/projects');
  };

  const setQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    const query = params.toString();
    router.replace(query ? `/admin/projects?${query}` : '/admin/projects');
  };

  const filteredProjects = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) => {
      const tagsText = (project.tags ?? []).join(' ');
      const haystack = `${project.title} ${project.description} ${project.link} ${project.status} ${tagsText}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [listQuery, projects]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Manage</p>
          <h2 className="text-3xl font-semibold text-white">Projects</h2>
        </div>
        <button
          type="button"
          onClick={() => setQueryParam('create', '1')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-4" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Project list</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search title, tags, status..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"
          />
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredProjects.length} / {projects.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Link</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Publish</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No projects yet.
                  </td>
                </tr>
              )}
              {projects.length > 0 && filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different search.
                  </td>
                </tr>
              )}
              {filteredProjects.map((project) => {
                const isPublished = resolvePublishValue(project.is_published);
                const showMain = resolveTargetValue(project.show_on_main);
                const showPhion = resolveTargetValue(project.show_on_phion);

                return (
                  <tr key={project.id} className="align-top">
                    <td className="px-4 py-4 text-white font-medium">{project.title}</td>
                    <td className="px-4 py-4">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/70 hover:text-white underline underline-offset-4"
                      >
                        {project.link}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-white/70">{(project.tags ?? []).slice(0, 4).join(', ') || '-'}</td>
                    <td className="px-4 py-4 text-white/70">{project.status}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                          isPublished
                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                            : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                        }`}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {showMain && (
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                            Main
                          </span>
                        )}
                        {showPhion && (
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                            Phion
                          </span>
                        )}
                        {!showMain && !showPhion && (
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
                            Hidden
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Edit project"
                          aria-label="Edit project"
                          onClick={() => {
                            setQueryParam('edit', project.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <form
                          action={deleteProject}
                          className="inline-flex"
                          onSubmit={(event) => {
                            if (!confirm('Delete this project? This cannot be undone.')) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={project.id} />
                          <input type="hidden" name="redirect_to" value="/admin/projects" />
                          <AdminSubmitButton
                            pendingText="Deleting..."
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-red-400/40 hover:text-red-100 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </AdminSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={createOpen} title="Create project" onClose={() => clearQueryParam('create')}>
        <form action={createProject} className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/projects" />

          <div>
            <label className="text-sm text-white/70">Title</label>
            <input name="title" placeholder="Project title" className={inputClassName} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Link</label>
              <input name="link" placeholder="https://..." className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Status</label>
              <input name="status" placeholder="Live" className={inputClassName} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Tags (comma separated)</label>
              <input name="tags" placeholder="React, Tailwind, TypeScript" className={inputClassName} />
            </div>
            <div>
              <label className="text-sm text-white/70">Sort order</label>
              <input name="sort_order" type="number" defaultValue="0" className={inputClassName} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Description</label>
            <textarea name="description" rows={4} className={textareaClassName} required />
          </div>

          <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer text-sm text-white/70">Advanced</summary>
            <div className="mt-4">
              <label className="text-sm text-white/70">Icon</label>
              <IconPicker name="icon" options={PROJECT_ICON_OPTIONS} defaultValue="Monitor" />
              <p className="mt-2 text-xs text-white/40">
                This icon is used in the Projects section.
              </p>
            </div>
          </details>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Publish</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="is_published" value="published" defaultChecked />
                Published
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="is_published" value="draft" />
                Draft
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Post to</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="show_on_main" value="true" defaultChecked />
                Main
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="show_on_phion" value="true" defaultChecked />
                Phion
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => clearQueryParam('create')}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <AdminSubmitButton
              pendingText="Creating..."
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Create
            </AdminSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingProject)}
        title="Edit project"
        onClose={() => clearQueryParam('edit')}
      >
        {editingProject && (
          <form action={updateProject} className="space-y-5">
            <input type="hidden" name="redirect_to" value="/admin/projects" />
            <input type="hidden" name="id" value={editingProject.id} />

            <div>
              <label className="text-sm text-white/70">Title</label>
              <input name="title" defaultValue={editingProject.title} className={inputClassName} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Link</label>
                <input name="link" defaultValue={editingProject.link} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Status</label>
                <input name="status" defaultValue={editingProject.status} className={inputClassName} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Tags (comma separated)</label>
                <input name="tags" defaultValue={joinTags(editingProject.tags)} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm text-white/70">Sort order</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={formatSortOrder(editingProject.sort_order)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editingProject.description}
                className={textareaClassName}
                required
              />
            </div>

            <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer text-sm text-white/70">Advanced</summary>
              <div className="mt-4">
                <label className="text-sm text-white/70">Icon</label>
                <IconPicker
                  name="icon"
                  options={PROJECT_ICON_OPTIONS}
                  defaultValue={editingProject.icon ?? 'Monitor'}
                />
              </div>
            </details>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Publish</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="published"
                    defaultChecked={resolvePublishValue(editingProject.is_published)}
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="draft"
                    defaultChecked={!resolvePublishValue(editingProject.is_published)}
                  />
                  Draft
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Post to</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_on_main"
                    value="true"
                    defaultChecked={resolveTargetValue(editingProject.show_on_main)}
                  />
                  Main
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_on_phion"
                    value="true"
                    defaultChecked={resolveTargetValue(editingProject.show_on_phion)}
                  />
                  Phion
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => clearQueryParam('edit')}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <AdminSubmitButton
                pendingText="Saving..."
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Save
              </AdminSubmitButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
