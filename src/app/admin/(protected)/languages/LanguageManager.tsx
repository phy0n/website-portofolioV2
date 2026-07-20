'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';

type LanguageAction = (formData: FormData) => void | Promise<void>;

type Language = {
  id: string;
  name: string;
  label: string;
  level: number | null;
  sort_order: number | null;
  is_published: boolean | null;
  show_on_main: boolean | null;
  show_on_phion: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';

const selectControlStyle: CSSProperties = { colorScheme: 'dark' };

const languageLabelOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const resolveLabelOptions = (current: string | null | undefined) => {
  const trimmed = (current ?? '').trim();
  if (!trimmed) return [...languageLabelOptions];
  return languageLabelOptions.includes(
    trimmed as (typeof languageLabelOptions)[number]
  )
    ? [...languageLabelOptions]
    : [trimmed, ...languageLabelOptions];
};

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

const formatLevel = (value: number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '0';
};

export default function LanguageManager({
  languages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  successMessage,
  errorMessage,
}: {
  languages: Language[];
  createLanguage: LanguageAction;
  updateLanguage: LanguageAction;
  deleteLanguage: LanguageAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editingLanguage = useMemo(() => {
    if (!editId) return null;
    return languages.find((language) => language.id === editId) ?? null;
  }, [editId, languages]);
  const [listQuery, setListQuery] = useState('');

  const toast = useMemo(() => {
    if (errorMessage) return { message: errorMessage, tone: 'error' as const };
    if (successMessage) return { message: successMessage, tone: 'success' as const };
    return null;
  }, [errorMessage, successMessage]);

  const filteredLanguages = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return languages;
    return languages.filter((language) => {
      const haystack = `${language.name} ${language.label}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [languages, listQuery]);

  return (
    <div className="space-y-8 font-manrope">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <p className="text-sm font-geist-mono text-white/40 uppercase tracking-[0.2em]">Manage</p>
          <h2 className="text-4xl font-light tracking-tight font-manrope text-white">Languages</h2>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
          <Plus className="h-4 w-4" />
          New language
        </button>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Language list</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex flex-wrap items-center gap-3 border-b border-white/10 pb-4 mb-2">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search language name or label..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"/>
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredLanguages.length} / {languages.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[10px] font-geist-mono uppercase tracking-widest text-white/30 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 text-left">Language</th>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Publish</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {languages.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No languages yet. Add one from the button above.
                  </td>
                </tr>
              )}
              {languages.length > 0 && filteredLanguages.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different search.
                  </td>
                </tr>
              )}
              {filteredLanguages.map((language) => {
                const isPublished = resolvePublishValue(language.is_published);
                const showMain = resolveTargetValue(language.show_on_main);
                const showPhion = resolveTargetValue(language.show_on_phion);
                const level = Math.max(0, Math.min(language.level ?? 0, 100));

                return (
                  <tr key={language.id} className="align-top">
                    <td className="px-4 py-4 text-white font-medium">{language.name}</td>
                    <td className="px-4 py-4 text-white/70">{language.label}</td>
                    <td className="px-4 py-4 text-white/70 tabular-nums">{level}%</td>
                    <td className="px-4 py-4 text-white/70 tabular-nums">
                      {formatSortOrder(language.sort_order)}
                    </td>
                    <td className="px-4 py-4">
                      {isPublished ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
                          Draft
                        </span>
                      )}
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditId(language.id)}
                          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <form action={deleteLanguage}>
                          <input type="hidden" name="redirect_to" value="/admin/languages" />
                          <input type="hidden" name="id" value={language.id} />
                          <AdminSubmitButton
                            pendingText="Deleting..."
                            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                            <Trash2 className="h-3.5 w-3.5 text-rose-300" />
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

      <Modal open={createOpen} title="Create language" onClose={() => setCreateOpen(false)}>
        <form action={createLanguage} className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/languages" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Language</label>
              <input name="name" required placeholder="English" className={inputClassName} maxLength={80} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Label</label>
              <select
                name="label"
                required
                defaultValue="Intermediate"
                className={inputClassName}
                style={selectControlStyle}>
                {languageLabelOptions.map((option) => (
                  <option key={option} value={option} className="bg-[#13131b] text-white">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Level (0-100)</label>
              <input
                name="level"
                type="number"
                min={0}
                max={100}
                defaultValue={50}
                className={inputClassName}/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Sort order</label>
              <input name="sort_order" type="number" defaultValue={0} className={inputClassName} />
            </div>
          </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">Publish</label>
                <select
                  name="is_published"
                  defaultValue="published"
                  className={inputClassName}
                  style={selectControlStyle}>
                  <option value="published" className="bg-[#13131b] text-white">
                    Published
                  </option>
                  <option value="draft" className="bg-[#13131b] text-white">
                    Draft
                  </option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" name="show_on_main" value="true" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black/40" />
                Show on Main
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="show_on_phion" value="true" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black/40" />
                Show on Phion
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
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
        open={Boolean(editingLanguage)}
        title={editingLanguage ? `Edit: ${editingLanguage.name}` : 'Edit language'}
        onClose={() => setEditId(null)}>
        {editingLanguage ? (
          <form action={updateLanguage} className="space-y-5">
            <input type="hidden" name="redirect_to" value="/admin/languages" />
            <input type="hidden" name="id" value={editingLanguage.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">Language</label>
                <input
                  name="name"
                  required
                  defaultValue={editingLanguage.name}
                  className={inputClassName}
                  maxLength={80}/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">Label</label>
                <select
                  name="label"
                  required
                  defaultValue={editingLanguage.label}
                  className={inputClassName}
                  style={selectControlStyle}>
                  {resolveLabelOptions(editingLanguage.label).map((option) => (
                    <option key={option} value={option} className="bg-[#13131b] text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">Level (0-100)</label>
                <input
                  name="level"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={formatLevel(editingLanguage.level)}
                  className={inputClassName}/>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">Sort order</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={formatSortOrder(editingLanguage.sort_order)}
                  className={inputClassName}/>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">Publish</label>
                <select
                  name="is_published"
                  defaultValue={resolvePublishValue(editingLanguage.is_published) ? 'published' : 'draft'}
                  className={inputClassName}
                  style={selectControlStyle}>
                  <option value="published" className="bg-[#13131b] text-white">
                    Published
                  </option>
                  <option value="draft" className="bg-[#13131b] text-white">
                    Draft
                  </option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    name="show_on_main"
                    value="true"
                    defaultChecked={resolveTargetValue(editingLanguage.show_on_main)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40"/>
                  Show on Main
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    name="show_on_phion"
                    value="true"
                    defaultChecked={resolveTargetValue(editingLanguage.show_on_phion)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40"/>
                  Show on Phion
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                Cancel
              </button>
              <AdminSubmitButton
                pendingText="Saving..."
                className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
                Save changes
              </AdminSubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
