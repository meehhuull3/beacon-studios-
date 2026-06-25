import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      className="p-2.5 rounded-xl border border-[#E2E5EC] dark:border-[rgba(255,255,255,0.15)] bg-white dark:bg-[#1e263c] text-[#1B2240] dark:text-amber-400 hover:bg-[#F4F5F7] dark:hover:bg-[#252f4a] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold shadow-xs"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      id="theme-toggle-btn"
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4 text-violet-600" />
          <span className="hidden sm:inline text-gray-700">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="hidden sm:inline text-white">Light Mode</span>
        </>
      )}
    </button>
  );
}
