import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LoginForm from './LoginForm';
import AdminLoginShell from './AdminLoginShell';

export default function AdminLoginPage() {
  return (
    <AdminLoginShell>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.35em]" data-gsap="reveal">
          <span className="text-white/45">Phion Admin</span>
          <Link href="/" className="admin-login-back">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Portfolio
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <section className="w-full max-w-[420px]" data-gsap="reveal">
            <div className="admin-login-card">
              <div className="mb-8 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Restricted</p>
                <h1 className="text-2xl font-semibold leading-tight text-white">Sign in</h1>
              </div>
              <LoginForm />
            </div>
          </section>
        </main>
      </div>
    </AdminLoginShell>
  );
}
