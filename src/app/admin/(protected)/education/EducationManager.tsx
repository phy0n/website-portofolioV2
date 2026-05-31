'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';

type EducationAction = (formData: FormData) => void | Promise<void>;

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  period: string;
  location: string | null;
  description: string | null;
  highlights: string[];
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
            className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30">
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

export default function EducationManager({
  education,
  createEducation,
  updateEducation,
  deleteEducation,
  successMessage,
  errorMessage,
}: {
  education: Education[];
  createEducation: EducationAction;
  updateEducation: EducationAction;
  deleteEducation: EducationAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(() => searchParams.get('create') === '1');
  const [editId, setEditId] = useState<string | null>(() => searchParams.get('edit'));
  const editingEducation = useMemo(() => {
    if (!editId) return null;
    return education.find((edu) => edu.id === editId) ?? null;
  }, [editId, education]);
  const [listQuery, setListQuery] = useState('');
  const toast = useMemo(() => {
    if (errorMessage) return { message: errorMessage, tone: 'error' as const };
    if (successMessage) return { message: successMessage, tone: 'success' as const };
    return null;
  }, [errorMessage, successMessage]);

  const filteredEducation = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return education;
    return education.filter((edu) => {
      const haystack = `${edu.institution} ${edu.degree} ${edu.field} ${edu.period} ${edu.location} ${edu.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [education, listQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Manage</p>
          <h2 className="text-3xl font-semibold text-white">Education</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditId(null);
            setCreateOpen(true);
          }}
          className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
          <Plus className="h-4 w-4" />
          New education
        </button>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-4" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Education list</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search institution, degree, period..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"/>
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredEducation.length} / {education.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Degree</th>
                <th className="px-4 py-3 text-left">Field</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Publish</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {education.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No education yet.
                  </td>
                </tr>
              )}
              {education.length > 0 && filteredEducation.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different search.
                  </td>
                </tr>
              )}
              {filteredEducation.map((edu) => {
                const isPublished = resolvePublishValue(edu.is_published);
                const showMain = resolveTargetValue(edu.show_on_main);
                const showPhion = resolveTargetValue(edu.show_on_phion);

                return (
                  <tr key={edu.id} className="align-top">
                    <td className="px-4 py-4 text-white font-medium">{edu.institution}</td>
                    <td className="px-4 py-4 text-white/80">{edu.degree}</td>
                    <td className="px-4 py-4 text-white/70">{edu.field || '-'}</td>
                    <td className="px-4 py-4 text-white/70">{edu.period}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                          isPublished
                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                            : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                        }`}>
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
                          title="Edit education"
                          aria-label="Edit education"
                          onClick={() => {
                            setCreateOpen(false);
                            setEditId(edu.id);
                          }}
                          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)] hover:bg-[var(--home-accent)]/10">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <form
                          action={deleteEducation}
                          className="inline-flex"
                          onSubmit={(event) => {
                            if (!confirm('Delete this education? This cannot be undone.')) {
                              event.preventDefault();
                            }
                          }}>
                          <input type="hidden" name="id" value={edu.id} />
                          <input type="hidden" name="redirect_to" value="/admin/education" />
                          <AdminSubmitButton
                            pendingText="Deleting..."
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-red-400/40 hover:text-red-100 hover:bg-red-500/10">
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
        title="Create education"
        onClose={() => setCreateOpen(false)}>
        <form action={createEducation} className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/education" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Institution</label>
              <input name="institution" placeholder="University Name" className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Degree</label>
              <input name="degree" placeholder="Bachelor of Science" className={inputClassName} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Field of Study</label>
              <input name="field" placeholder="Computer Science" className={inputClassName} />
            </div>
            <div>
              <label className="text-sm text-white/70">Location</label>
              <input name="location" placeholder="City, Country" className={inputClassName} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-sm text-white/70">Period</label>
              <input name="period" placeholder="2020 - 2024" className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Sort order</label>
              <input name="sort_order" type="number" defaultValue="0" className={inputClassName} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Highlights (comma separated)</label>
            <input name="highlights" placeholder="Graduated with Honors, GPA 3.9" className={inputClassName} />
          </div>

          <div>
            <label className="text-sm text-white/70">Description</label>
            <textarea name="description" rows={4} className={textareaClassName} />
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
              onClick={() => setCreateOpen(false)}
              className="px-6 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 font-mono text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors">
              Cancel
            </button>
            <AdminSubmitButton
              pendingText="Creating..."
              className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
              Create
            </AdminSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingEducation)}
        title="Edit education"
        onClose={() => setEditId(null)}>
        {editingEducation && (
          <form action={updateEducation} className="space-y-5">
            <input type="hidden" name="redirect_to" value="/admin/education" />
            <input type="hidden" name="id" value={editingEducation.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Institution</label>
                <input name="institution" defaultValue={editingEducation.institution} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Degree</label>
                <input name="degree" defaultValue={editingEducation.degree} className={inputClassName} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Field of Study</label>
                <input name="field" defaultValue={editingEducation.field || ''} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm text-white/70">Location</label>
                <input name="location" defaultValue={editingEducation.location || ''} className={inputClassName} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-sm text-white/70">Period</label>
                <input name="period" defaultValue={editingEducation.period} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Sort order</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={formatSortOrder(editingEducation.sort_order)}
                  className={inputClassName}/>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Highlights (comma separated)</label>
              <input name="highlights" defaultValue={editingEducation.highlights?.join(', ') || ''} className={inputClassName} />
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editingEducation.description || ''}
                className={textareaClassName}/>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Publish</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="published"
                    defaultChecked={resolvePublishValue(editingEducation.is_published)}/>
                  Published
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="draft"
                    defaultChecked={!resolvePublishValue(editingEducation.is_published)}/>
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
                    defaultChecked={resolveTargetValue(editingEducation.show_on_main)}/>
                  Main
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_on_phion"
                    value="true"
                    defaultChecked={resolveTargetValue(editingEducation.show_on_phion)}/>
                  Phion
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="px-6 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 font-mono text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors">
                Cancel
              </button>
              <AdminSubmitButton
                pendingText="Saving..."
                className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
                Save
              </AdminSubmitButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
