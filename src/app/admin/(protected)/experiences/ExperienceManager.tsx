'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';

type ExperienceAction = (formData: FormData) => void | Promise<void>;

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  status: string;
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
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#13131b] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
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

const formatSortOrder = (value: number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '0';
};

export default function ExperienceManager({
  experiences,
  createExperience,
  updateExperience,
  deleteExperience,
  successMessage,
  errorMessage,
}: {
  experiences: Experience[];
  createExperience: ExperienceAction;
  updateExperience: ExperienceAction;
  deleteExperience: ExperienceAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createOpen = searchParams.get('create') === '1';
  const editId = searchParams.get('edit');
  const editingExperience = useMemo(() => {
    if (!editId) return null;
    return experiences.find((exp) => exp.id === editId) ?? null;
  }, [editId, experiences]);
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
    router.replace(query ? `/admin/experiences?${query}` : '/admin/experiences');
  };

  const setQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    const query = params.toString();
    router.replace(query ? `/admin/experiences?${query}` : '/admin/experiences');
  };

  const filteredExperiences = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return experiences;
    return experiences.filter((exp) => {
      const haystack = `${exp.role} ${exp.company} ${exp.period} ${exp.status} ${exp.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [experiences, listQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Manage</p>
          <h2 className="text-3xl font-semibold text-white">Experiences</h2>
        </div>
        <button
          type="button"
          onClick={() => setQueryParam('create', '1')}
          className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New experience
        </button>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-4" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Experience list</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search role, company, period..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"
          />
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredExperiences.length} / {experiences.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Publish</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {experiences.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No experiences yet.
                  </td>
                </tr>
              )}
              {experiences.length > 0 && filteredExperiences.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different search.
                  </td>
                </tr>
              )}
              {filteredExperiences.map((exp) => {
                const isPublished = resolvePublishValue(exp.is_published);
                const showMain = resolveTargetValue(exp.show_on_main);
                const showPhion = resolveTargetValue(exp.show_on_phion);

                return (
                  <tr key={exp.id} className="align-top">
                    <td className="px-4 py-4 text-white font-medium">{exp.role}</td>
                    <td className="px-4 py-4 text-white/80">{exp.company}</td>
                    <td className="px-4 py-4 text-white/70">{exp.period}</td>
                    <td className="px-4 py-4 text-white/70">{exp.status}</td>
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
                          title="Edit experience"
                          aria-label="Edit experience"
                          onClick={() => {
                            setQueryParam('edit', exp.id);
                          }}
                          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <form
                          action={deleteExperience}
                          className="inline-flex"
                          onSubmit={(event) => {
                            if (!confirm('Delete this experience? This cannot be undone.')) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={exp.id} />
                          <input type="hidden" name="redirect_to" value="/admin/experiences" />
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

      <Modal
        open={createOpen}
        title="Create experience"
        onClose={() => clearQueryParam('create')}
      >
        <form action={createExperience} className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/experiences" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Role</label>
              <input name="role" placeholder="Developer" className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Company</label>
              <input name="company" placeholder="Company name" className={inputClassName} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-sm text-white/70">Period</label>
              <input name="period" placeholder="2024 - now" className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Sort order</label>
              <input name="sort_order" type="number" defaultValue="0" className={inputClassName} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Status</label>
            <input name="status" placeholder="Current" className={inputClassName} required />
          </div>

          <div>
            <label className="text-sm text-white/70">Description</label>
            <textarea name="description" rows={4} className={textareaClassName} required />
          </div>

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
              className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
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
        open={Boolean(editingExperience)}
        title="Edit experience"
        onClose={() => clearQueryParam('edit')}
      >
        {editingExperience && (
          <form action={updateExperience} className="space-y-5">
            <input type="hidden" name="redirect_to" value="/admin/experiences" />
            <input type="hidden" name="id" value={editingExperience.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Role</label>
                <input name="role" defaultValue={editingExperience.role} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Company</label>
                <input name="company" defaultValue={editingExperience.company} className={inputClassName} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-sm text-white/70">Period</label>
                <input name="period" defaultValue={editingExperience.period} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Sort order</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={formatSortOrder(editingExperience.sort_order)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Status</label>
              <input name="status" defaultValue={editingExperience.status} className={inputClassName} required />
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editingExperience.description}
                className={textareaClassName}
                required
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Publish</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="published"
                    defaultChecked={resolvePublishValue(editingExperience.is_published)}
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="draft"
                    defaultChecked={!resolvePublishValue(editingExperience.is_published)}
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
                    defaultChecked={resolveTargetValue(editingExperience.show_on_main)}
                  />
                  Main
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_on_phion"
                    value="true"
                    defaultChecked={resolveTargetValue(editingExperience.show_on_phion)}
                  />
                  Phion
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => clearQueryParam('edit')}
                className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
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
