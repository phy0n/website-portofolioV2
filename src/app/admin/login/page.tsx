import Link from 'next/link';
import { Shield } from 'lucide-react';
import LoginForm from './LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0e0e16] to-[#141421] text-white relative overflow-hidden">
      <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
          <span>Phion Admin</span>
          <Link href="/" className="text-white/50 hover:text-white transition">
            Back to site
          </Link>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80">
              <Shield className="h-4 w-4" />
              Private access only
            </div>
            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Masuk ke ruang kontrol cerita dan quotes.
            </h1>
            <p className="max-w-md text-sm text-white/60">
              Dashboard ini hanya untuk admin. Pastikan akun kamu sudah terdaftar di daftar admin Supabase.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/70 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Sign in</h2>
              <p className="text-xs text-white/50">Gunakan email admin Supabase.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
