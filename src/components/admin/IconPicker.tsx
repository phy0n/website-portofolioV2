'use client';

import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export type IconOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

export default function IconPicker({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: IconOption[];
  defaultValue?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialValue = defaultValue ?? options[0]?.value ?? '';
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) ?? options[0] ?? null;
  }, [options, value]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!containerRef.current) return;
      if (!containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (options.length === 0) {
    return <input type="hidden" name={name} value={defaultValue ?? ''} />;
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:border-white/30"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          {selectedOption && <selectedOption.Icon className="h-4 w-4 text-white/80" />}
          <span className="text-white/80">{selectedOption?.label ?? 'Select icon'}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-white/60 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/10 bg-[#13131b] p-3 shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
        >
          <div className="grid grid-cols-6 gap-2">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  onClick={() => {
                    setValue(option.value);
                    setOpen(false);
                  }}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    isActive
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <option.Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-white/40">
            Tip: hover an icon to see its name.
          </p>
        </div>
      )}
    </div>
  );
}

