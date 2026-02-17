import Link from 'next/link';
import LoginForm from './LoginForm';

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen bg-[#0b0b10] text-white relative overflow-hidden"
      data-page-content>
      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50" data-gsap="reveal">
          <span>Phion Admin</span>
          <Link href="/" className="text-white/50 hover:text-white transition">
            Back to portfolio
          </Link>
        </div>

        <div className="mt-12 flex justify-center">
          <div
            className="w-full max-w-lg rounded-[32px] border border-white/10 bg-black/70 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
            data-gsap="reveal">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Sign in</h2>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
