'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

type QuoteAction = (formData: FormData) => void | Promise<void>;

type Quote = {
  id: string;
  date: string;
  text: string;
  author: string | null;
};

const formatDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.split('T')[0];
};

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';
const textareaClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add quote
          </button>
        </div>
      </div>

      {(successMessage || errorMessage) && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          {errorMessage || successMessage}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Quote list</h3>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Quote</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-white/50">
                    No quotes yet.
                  </td>
                </tr>
              )}
              {quotes.map((quote) => (
                <tr key={quote.id} className="align-top">
                  <td className="px-4 py-4 text-white/70">{formatDateInput(quote.date)}</td>
                  <td className="px-4 py-4 text-white">{quote.text}</td>
                  <td className="px-4 py-4 text-white/70">{quote.author ?? '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Edit quote"
                        aria-label="Edit quote"
                        onClick={() => setEditingQuote(quote)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <form action={deleteQuote} className="inline-flex">
                        <input type="hidden" name="redirect_to" value="/admin/quotes" />
                        <input type="hidden" name="id" value={quote.id} />
                        <button
                          type="submit"
                          title="Delete quote"
                          aria-label="Delete quote"
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={isCreateOpen} title="Add new quote" onClose={() => setIsCreateOpen(false)}>
        <form action={createQuote} className="grid gap-4">
          <input type="hidden" name="redirect_to" value="/admin/quotes" />
          <div>
            <label className="text-sm text-white/60">Date</label>
            <input name="date" type="date" required className={inputClassName} />
          </div>
          <div>
            <label className="text-sm text-white/60">Quote</label>
            <textarea name="text" required rows={3} className={textareaClassName} />
          </div>
          <div>
            <label className="text-sm text-white/60">Author</label>
            <input name="author" className={inputClassName} placeholder="Phion" />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
          >
            Submit
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingQuote)}
        title="Edit quote"
        onClose={() => setEditingQuote(null)}
      >
        {editingQuote && (
          <form action={updateQuote} className="grid gap-4" key={editingQuote.id}>
            <input type="hidden" name="redirect_to" value="/admin/quotes" />
            <input type="hidden" name="id" value={editingQuote.id} />
            <div>
              <label className="text-sm text-white/60">Date</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={formatDateInput(editingQuote.date)}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="text-sm text-white/60">Quote</label>
              <textarea
                name="text"
                required
                rows={3}
                defaultValue={editingQuote.text}
                className={textareaClassName}
              />
            </div>
            <div>
              <label className="text-sm text-white/60">Author</label>
              <input
                name="author"
                defaultValue={editingQuote.author ?? ''}
                className={inputClassName}
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
            >
              Submit
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
