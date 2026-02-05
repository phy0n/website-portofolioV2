'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

type AdminSubmitButtonProps = {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
};

export default function AdminSubmitButton({
  children,
  pendingText = 'Processing...',
  className = '',
  disabled = false,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${className} ${pending || disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
