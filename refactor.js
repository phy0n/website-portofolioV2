const fs = require('fs');
const path = require('path');

const files = [
  'certificates/CertificateManager.tsx',
  'experiences/ExperienceManager.tsx',
  'languages/LanguageManager.tsx',
  'projects/ProjectManager.tsx',
  'quotes/QuoteManager.tsx'
].map(f => path.join('d:/Programming/React/Next/project-Portofolio/project-PhionPortofolio/src/app/admin/(protected)', f));

const oldClasses = /const inputClassName =[\s\S]*?const tableSelectClassName =[\s\S]*?admin-select';/g;

const newClasses = `const inputClassName =
  'mt-2 w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[var(--home-accent)] focus:bg-white/5 transition-colors focus:outline-none';
const textareaClassName =
  'mt-2 w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[var(--home-accent)] focus:bg-white/5 transition-colors focus:outline-none';
const selectClassName =
  'mt-2 w-full rounded-xl border border-white/5 bg-[#0f0f15] px-4 py-3 text-sm text-white focus:border-[var(--home-accent)] transition-colors focus:outline-none admin-select';
const tableSelectClassName =
  'w-full rounded-lg border border-white/10 bg-[#0f0f15] px-3 py-1.5 text-xs text-white focus:border-[var(--home-accent)] transition-colors focus:outline-none admin-select';`;

const oldModal = /function Modal\(\{[\s\S]*?return \([\s\S]*?<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/70 p-6">[\s\S]*?<div className="absolute inset-0 cursor-pointer" onClick=\{onClose\} \/>[\s\S]*?<div className="relative w-full max-w-5xl rounded-2xl border border-white\/10 bg-\[#13131b\] p-6 text-white shadow-\[0_30px_120px_rgba\(0,0,0,0\.6\)\]">[\s\S]*?<div className="mb-6 flex items-center justify-between">[\s\S]*?<h3 className="text-xl font-semibold">\{title\}<\/h3>[\s\S]*?<button[\s\S]*?aria-label="Close"[\s\S]*?className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border border-white\/10 text-white\/60 hover:text-white hover:border-white\/30"[\s\S]*?>[\s\S]*?<X className="h-4 w-4" \/>[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<div className="max-h-\[70vh\] overflow-y-auto pr-2 hide-scrollbar">\{children\}<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}/g;

const newModal = `function Modal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in font-nunito">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/5 bg-[#0a0a0f] text-white shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-transparent shrink-0">
          <h3 className="text-xs font-mono uppercase tracking-widest text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}`;

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log('Skipping', f);
    return;
  }
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace Class definitions
  content = content.replace(oldClasses, newClasses);
  
  // Replace Modal
  content = content.replace(oldModal, newModal);
  
  // Replace labels
  content = content.replace(/<label className="text-sm text-white\/60">/g, '<label className="text-xs font-mono uppercase tracking-widest text-white/40">');
  
  // Replace Cancel / Action Buttons
  content = content.replace(/<button([^>]*?)onClick=\{([^>]*?)setCreateOpen\(false\)([^>]*?)\}([^>]*?)className="inline-flex items-center justify-center rounded-xl border border-white\/10 bg-white\/5 px-4 py-2 text-sm font-semibold text-white\/70 transition hover:border-white\/30 hover:text-white"([^>]*?)>/g, '<button$1onClick={$2setCreateOpen(false)$3}$4className="px-6 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 font-mono text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"$5>');

  content = content.replace(/<button([^>]*?)onClick=\{([^>]*?)setEditId\(null\)([^>]*?)\}([^>]*?)className="inline-flex items-center justify-center rounded-xl border border-white\/10 bg-white\/5 px-4 py-2 text-sm font-semibold text-white\/70 transition hover:border-white\/30 hover:text-white"([^>]*?)>/g, '<button$1onClick={$2setEditId(null)$3}$4className="px-6 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 font-mono text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"$5>');
  
  // Replace AdminSubmitButton (this might miss if props are rearranged, but it usually works)
  content = content.replace(/className="inline-flex items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white\/90"/g, 'className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]"');

  content = content.replace(/className="inline-flex w-full items-center justify-center rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white\/90"/g, 'className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]"');

  // Replace Checkboxes "Main" / "Phion" / "MainPortofolio"
  content = content.replace(/className="h-4 w-4 accent-white"/g, 'className="h-4 w-4 accent-[var(--home-accent)]"');

  // Replace text-sm font-semibold text-white
  content = content.replace(/<p className="text-sm font-semibold text-white">/g, '<p className="text-xs font-mono uppercase tracking-widest text-white/40">');

  fs.writeFileSync(f, content, 'utf8');
  console.log('Updated', f);
});
