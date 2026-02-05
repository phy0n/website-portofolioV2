'use client';
  
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Award, BadgeCheck, BookOpen, FileText, GraduationCap, Pencil, Plus, Star, Trash2, Trophy, X } from 'lucide-react';
import AdminSubmitButton from '@/components/admin/AdminSubmitButton';
import AdminToast from '@/components/admin/AdminToast';
import IconPicker, { type IconOption } from '@/components/admin/IconPicker';

type CertificateAction = (formData: FormData) => void | Promise<void>;

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: string;
  description: string;
  image: string | null;
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

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = 5 * 1024 * 1024;

const CERTIFICATE_ICON_OPTIONS: IconOption[] = [
  { value: 'Award', label: 'Award', Icon: Award },
  { value: 'BadgeCheck', label: 'Badge Check', Icon: BadgeCheck },
  { value: 'GraduationCap', label: 'Graduation Cap', Icon: GraduationCap },
  { value: 'BookOpen', label: 'Book Open', Icon: BookOpen },
  { value: 'FileText', label: 'File Text', Icon: FileText },
  { value: 'Star', label: 'Star', Icon: Star },
  { value: 'Trophy', label: 'Trophy', Icon: Trophy },
];

const formatSortOrder = (value: number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '0';
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

export default function CertificateManager({
  certificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  successMessage,
  errorMessage,
}: {
  certificates: Certificate[];
  createCertificate: CertificateAction;
  updateCertificate: CertificateAction;
  deleteCertificate: CertificateAction;
  successMessage?: string;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createOpen = searchParams.get('create') === '1';
  const editId = searchParams.get('edit');
  const editingCertificate = useMemo(() => {
    if (!editId) return null;
    return certificates.find((cert) => cert.id === editId) ?? null;
  }, [certificates, editId]);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [createImageError, setCreateImageError] = useState<string | null>(null);
  const [editImageError, setEditImageError] = useState<string | null>(null);
  const [createFileKey, setCreateFileKey] = useState(0);
  const [editFileKey, setEditFileKey] = useState(0);
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
    router.replace(query ? `/admin/certificates?${query}` : '/admin/certificates');
  };

  const setQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    const query = params.toString();
    router.replace(query ? `/admin/certificates?${query}` : '/admin/certificates');
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

  const filteredCertificates = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return certificates;
    return certificates.filter((cert) => {
      const haystack = `${cert.title} ${cert.issuer} ${cert.date} ${cert.status} ${cert.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [certificates, listQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4" data-gsap="reveal">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Manage</p>
          <h2 className="text-3xl font-semibold text-white">Certificates</h2>
        </div>
        <button
          type="button"
          onClick={() => setQueryParam('create', '1')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New certificate
        </button>
      </div>

      {toast && <AdminToast message={toast.message} tone={toast.tone} />}

      <section className="space-y-4" data-gsap="reveal">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Certificate list</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search title, issuer, date..."
            className="flex-1 min-w-[220px] rounded-xl border border-white/10 bg-[#13131b] px-3 py-2 text-sm text-white placeholder-white/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:border-white/40 focus:outline-none"
          />
          <span className="ml-auto text-sm text-white/50">
            Showing {filteredCertificates.length} / {certificates.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/50 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Issuer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Publish</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {certificates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No certificates yet.
                  </td>
                </tr>
              )}
              {certificates.length > 0 && filteredCertificates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-white/50">
                    No matches. Try a different search.
                  </td>
                </tr>
              )}
              {filteredCertificates.map((cert) => {
                const isPublished = resolvePublishValue(cert.is_published);
                const showMain = resolveTargetValue(cert.show_on_main);
                const showPhion = resolveTargetValue(cert.show_on_phion);

                return (
                  <tr key={cert.id} className="align-top">
                    <td className="px-4 py-4 text-white font-medium">{cert.title}</td>
                    <td className="px-4 py-4 text-white/80">{cert.issuer}</td>
                    <td className="px-4 py-4 text-white/70">{cert.date}</td>
                    <td className="px-4 py-4 text-white/70">{cert.status}</td>
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
                          title="Edit certificate"
                          aria-label="Edit certificate"
                          onClick={() => {
                            setQueryParam('edit', cert.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <form
                          action={deleteCertificate}
                          className="inline-flex"
                          onSubmit={(event) => {
                            if (!confirm('Delete this certificate? This cannot be undone.')) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={cert.id} />
                          <input type="hidden" name="redirect_to" value="/admin/certificates" />
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
        title="Create certificate"
        onClose={() => {
          if (createImagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(createImagePreview);
          }
          setCreateImagePreview(null);
          setCreateImageError(null);
          setCreateFileKey((prev) => prev + 1);
          clearQueryParam('create');
        }}
      >
        <form action={createCertificate} className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/certificates" />

          <div>
            <label className="text-sm text-white/70">Title</label>
            <input name="title" placeholder="Certificate title" className={inputClassName} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Issuer</label>
              <input name="issuer" placeholder="Issuer" className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Date</label>
              <input name="date" placeholder="2024" className={inputClassName} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Status</label>
              <input name="status" placeholder="Completed" className={inputClassName} required />
            </div>
            <div>
              <label className="text-sm text-white/70">Sort order</label>
              <input name="sort_order" type="number" defaultValue="0" className={inputClassName} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Local Image (optional)</label>
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
                <img src={createImagePreview} alt="Preview" className="h-32 w-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-white/70">Description</label>
            <textarea name="description" rows={4} className={textareaClassName} required />
          </div>

          <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer text-sm text-white/70">Advanced</summary>
            <div className="mt-4">
              <label className="text-sm text-white/70">Icon</label>
              <IconPicker name="icon" options={CERTIFICATE_ICON_OPTIONS} defaultValue="Award" />
              <p className="mt-2 text-xs text-white/40">
                This icon is used in the Certificates section.
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
        open={Boolean(editingCertificate)}
        title="Edit certificate"
        onClose={() => {
          if (editImagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(editImagePreview);
          }
          setEditImagePreview(null);
          setEditImageError(null);
          setEditFileKey((prev) => prev + 1);
          clearQueryParam('edit');
        }}
      >
        {editingCertificate && (
          <form action={updateCertificate} className="space-y-5" key={editingCertificate.id}>
            <input type="hidden" name="redirect_to" value="/admin/certificates" />
            <input type="hidden" name="id" value={editingCertificate.id} />
            <input type="hidden" name="current_image" value={editingCertificate.image ?? ''} />

            <div>
              <label className="text-sm text-white/70">Title</label>
              <input name="title" defaultValue={editingCertificate.title} className={inputClassName} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Issuer</label>
                <input name="issuer" defaultValue={editingCertificate.issuer} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Date</label>
                <input name="date" defaultValue={editingCertificate.date} className={inputClassName} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Status</label>
                <input name="status" defaultValue={editingCertificate.status} className={inputClassName} required />
              </div>
              <div>
                <label className="text-sm text-white/70">Sort order</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={formatSortOrder(editingCertificate.sort_order)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Local Image (optional)</label>
              <input
                key={`${editingCertificate.id}-${editFileKey}`}
                name="image_file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleEditImageChange}
                className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
              />
              <p className="mt-2 text-xs text-white/40">PNG/JPG/WebP, max 5MB.</p>
              {editImageError && <p className="mt-2 text-xs text-red-300">{editImageError}</p>}
              {(editImagePreview || editingCertificate.image) && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src={editImagePreview ?? editingCertificate.image ?? ''}
                    alt="Preview"
                    className="h-32 w-full object-cover"
                  />
                </div>
              )}
              {editingCertificate.image && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="min-w-0 truncate text-xs text-white/50">{editingCertificate.image}</p>
                  <a
                    href={editingCertificate.image}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs text-[var(--home-accent)] hover:text-[var(--home-accent)]"
                  >
                    Open
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={editingCertificate.description}
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
                  options={CERTIFICATE_ICON_OPTIONS}
                  defaultValue={editingCertificate.icon ?? 'Award'}
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
                    defaultChecked={resolvePublishValue(editingCertificate.is_published)}
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_published"
                    value="draft"
                    defaultChecked={!resolvePublishValue(editingCertificate.is_published)}
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
                    defaultChecked={resolveTargetValue(editingCertificate.show_on_main)}
                  />
                  Main
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_on_phion"
                    value="true"
                    defaultChecked={resolveTargetValue(editingCertificate.show_on_phion)}
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
