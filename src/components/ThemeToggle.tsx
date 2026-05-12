"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent flex items-center justify-center opacity-50">
        <Sun className="w-4 h-4 text-zinc-400" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Alternar tema"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
