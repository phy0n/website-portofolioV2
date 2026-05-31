"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg)] text-[var(--home-ink)]"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg)] text-[var(--home-ink)] opacity-80 hover:opacity-100 transition hover:border-[var(--home-ink)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg)] transition-colors">
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </span>
    </button>
  );
}
