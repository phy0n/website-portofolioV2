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

  // Cancel button
  content = content.replace(/className="cursor-pointer rounded-full border border-white\/10 bg-white\/5 px-5 py-2 text-sm text-white\/70 transition hover:border-white\/30 hover:bg-white\/10 hover:text-white"/g, 'className="px-6 py-3 rounded-xl border border-white/10 bg-transparent text-white/60 font-mono text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors"');
  
  // Create / Save button
  content = content.replace(/className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white\/90"/g, 'className="px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]"');

  // Submit button
  content = content.replace(/className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white\/90 w-full"/g, 'className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]"');

  // Quote submit button
  content = content.replace(/className="rounded-xl bg-white px-5 py-2\.5 text-sm font-semibold text-black shadow-sm transition hover:bg-white\/90 w-full"/g, 'className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--home-accent)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--home-accent-2)] transition-colors shadow-[0_0_20px_rgba(var(--home-accent-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--home-accent-rgb),0.5)]"');

  // labels in quote manager
  content = content.replace(/<label className="text-sm text-white\/60">/g, '<label className="text-xs font-mono uppercase tracking-widest text-white/40">');
  
  fs.writeFileSync(f, content, 'utf8');
});
