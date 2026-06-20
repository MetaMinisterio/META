"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-border bg-transparent flex items-center justify-center opacity-40 shrink-0">
        <Sun className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-lg border border-border bg-transparent flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
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
