'use client';

import { AlertCircle, ArrowRight, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
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
      className="admin-login-submit">
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.32em] text-white/45">
          Email
        </label>
        <div className="admin-login-field">
          <Mail className="admin-login-field-icon h-4 w-4" aria-hidden="true" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="admin-login-input"
            placeholder="admin@gmail.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.32em] text-white/45">
          Password
        </label>
        <div className="admin-login-field">
          <LockKeyhole className="admin-login-field-icon h-4 w-4" aria-hidden="true" />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="admin-login-input"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.error && (
        <div className="admin-login-message" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--home-accent)]" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
