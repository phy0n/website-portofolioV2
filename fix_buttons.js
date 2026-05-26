const fs = require('fs');
const path = require('path');

const files = [
  'certificates/CertificateManager.tsx',
  'experiences/ExperienceManager.tsx',
  'languages/LanguageManager.tsx',
  'projects/ProjectManager.tsx',
  'quotes/QuoteManager.tsx'
].map(f => path.join('d:/Programming/React/Next/project-Portofolio/project-PhionPortofolio/src/app/admin/(protected)', f));

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace old submit buttons
  content = content.replace(/className="[^"]*?bg-white px-4 py-2 text-sm font-semibold text-black[^"]*?"/g, 'className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]"');

  // Replace old add buttons like "Add quote"
  content = content.replace(/className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-white\/90"/g, 'className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[var(--home-accent)] bg-[var(--home-accent)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--home-accent)] shadow-sm transition hover:bg-[var(--home-accent)] hover:text-white"');

  // Also replace any old edit buttons that might still be white/70
  content = content.replace(/className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white\/10 bg-white\/5 px-3 py-2 text-sm text-white\/70 transition hover:border-white\/40 hover:text-white hover:bg-white\/10"/g, 'className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)] hover:bg-[var(--home-accent)]/10"');

  // Also replace delete buttons
  content = content.replace(/className="inline-flex items-center gap-2 rounded-lg border border-white\/10 bg-white\/5 px-3 py-2 text-sm text-white\/70 transition hover:border-white\/40 hover:text-white hover:bg-white\/10"/g, 'className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:border-red-500/60 hover:text-red-300 hover:bg-red-500/20"');

  fs.writeFileSync(f, content, 'utf8');
});
