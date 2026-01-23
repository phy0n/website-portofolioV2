'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from './actions';

const initialState = {
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
          placeholder="admin@yourmail.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
