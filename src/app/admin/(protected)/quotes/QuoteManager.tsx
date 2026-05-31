'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';

type QuoteAction = (formData: FormData) => void | Promise<void>;

type Quote = {
  id: string;
  date: string;
  text: string;
  author: string | null;
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

const resolveTargetValue = (value: boolean | null | undefined) => value !== false;

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

export default function QuoteManager({
  quotes,
  createQuote,
  updateQuote,
  deleteQuote,
  successMessage,
  errorMessage,
}: {
  quotes: Quote[];
  createQuote: QuoteAction;
  updateQuote: QuoteAction;
  deleteQuote: QuoteAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(() => searchParams.get('create') === '1');
  const [editId, setEditId] = useState<string | null>(() => searchParams.get('edit'));
  const editingQuote = useMemo(() => {
    if (!editId) return null;
    return quotes.find((quote) => quote.id === editId) ?? null;
  }, [editId, quotes]);
  const [listQuery, setListQuery] = useState('');
  const toast = useMemo(() => {
    if (errorMessage) return { message: errorMessage, tone: 'error' as const };
    if (successMessage) return { message: successMessage, tone: 'success' as const };
    return null;
  }, [errorMessage, successMessage]);

  const filteredQuotes = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return quotes;
    return quotes.filter((quote) => {
      const haystack = `${quote.text} ${quote.author ?? ''} ${quote.date}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [listQuery, quotes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Content</p>
          <h2 className="text-3xl font-semibold text-white">Quotes Manager</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">Total: {quotes.length}</span>
          <button
            type="button"
            title="Add quote"
            aria-label="Add quote"
            onClick={() => {
              setEditId(null);
              setCreateOpen(true);
            }}
            className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
            <Plus className="h-4 w-4" />
            Add quote
          </button>
        </div>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-3" data-gsap="reveal">
        <h3 className="text-lg font-semibold text-white">Quote list</h3>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search quote text, author, or date..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"/>
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredQuotes.length} / {quotes.length}
          </span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Quote</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                    No quotes yet.
                  </td>
                </tr>
              )}
              {quotes.length > 0 && filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different search.
                  </td>
                </tr>
              )}
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="align-top">
                  <td className="px-4 py-4 text-white/70">{formatDateInput(quote.date)}</td>
                  <td className="px-4 py-4 text-white">{quote.text}</td>
                  <td className="px-4 py-4 text-white/70">{quote.author ?? '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const showMain = resolveTargetValue(quote.show_on_main);
                        const showPhion = resolveTargetValue(quote.show_on_phion);
                        return (
                          <>
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
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Edit quote"
                          aria-label="Edit quote"
                          onClick={() => {
                            setCreateOpen(false);
                            setEditId(quote.id);
                          }}
                          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)] hover:bg-[var(--home-accent)]/10">
                          <Pencil className="h-4 w-4" />
                          Edit
                      </button>
                      <form
                        action={deleteQuote}
                        className="inline-flex"
                        onSubmit={(event) => {
                          if (!confirm('Delete this quote? This cannot be undone.')) {
                            event.preventDefault();
                          }
                        }}>
                        <input type="hidden" name="redirect_to" value="/admin/quotes" />
                        <input type="hidden" name="id" value={quote.id} />
                        <AdminSubmitButton
                          pendingText="Deleting..."
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:border-red-500/60 hover:text-red-300 hover:bg-red-500/20">
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
        title="Add new quote"
        onClose={() => {
          setCreateOpen(false);
        }}>
        <form action={createQuote} className="grid gap-4">
          <input type="hidden" name="redirect_to" value="/admin/quotes" />
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/40">Date</label>
            <input name="date" type="date" required className={inputClassName} />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/40">Quote</label>
            <textarea name="text" required rows={3} className={textareaClassName} />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/40">Author</label>
            <input name="author" className={inputClassName} placeholder="Phion" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-white/40">Post to</p>
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
                  className="h-4 w-4 accent-[var(--home-accent)]"
                />
                MainPortofolio
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  name="show_on_phion"
                  value="true"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--home-accent)]"
                />
                PhionPortofolio
              </label>
            </div>
          </div>
          <AdminSubmitButton
            pendingText="Saving..."
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
            Submit
          </AdminSubmitButton>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingQuote)}
        title="Edit quote"
        onClose={() => {
          setEditId(null);
        }}>
        {editingQuote && (
          <form action={updateQuote} className="grid gap-4" key={editingQuote.id}>
            <input type="hidden" name="redirect_to" value="/admin/quotes" />
            <input type="hidden" name="id" value={editingQuote.id} />
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-white/40">Date</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={formatDateInput(editingQuote.date)}
                className={inputClassName}/>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-white/40">Quote</label>
              <textarea
                name="text"
                required
                rows={3}
                defaultValue={editingQuote.text}
                className={textareaClassName}/>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-white/40">Author</label>
              <input
                name="author"
                defaultValue={editingQuote.author ?? ''}
                className={inputClassName}/>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40">Post to</p>
              <p className="mt-1 text-xs text-white/40">
                Select destinations (leave empty to hide on both sites).
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    name="show_on_main"
                    value="true"
                    defaultChecked={resolveTargetValue(editingQuote.show_on_main)}
                    className="h-4 w-4 accent-[var(--home-accent)]"/>
                  MainPortofolio
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    name="show_on_phion"
                    value="true"
                    defaultChecked={resolveTargetValue(editingQuote.show_on_phion)}
                    className="h-4 w-4 accent-[var(--home-accent)]"/>
                  PhionPortofolio
                </label>
              </div>
            </div>
            <AdminSubmitButton
              pendingText="Saving..."
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]">
              Submit
            </AdminSubmitButton>
          </form>
        )}
      </Modal>
    </div>
  );
}
