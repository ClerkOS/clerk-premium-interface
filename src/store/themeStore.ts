import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateSystemTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme, get().systemTheme);
      },
      
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      updateSystemTheme: (systemTheme) => {
        set({ systemTheme });
        const { theme } = get();
        if (theme === 'system') {
          applyTheme('system', systemTheme);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

function applyTheme(theme: Theme, systemTheme: 'light' | 'dark') {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Apply new theme
  if (theme === 'system') {
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Set initial system theme
  useThemeStore.getState().updateSystemTheme(mediaQuery.matches ? 'dark' : 'light');
  
  // Listen for system theme changes
  mediaQuery.addEventListener('change', (e) => {
    useThemeStore.getState().updateSystemTheme(e.matches ? 'dark' : 'light');
  });
  
  // Apply initial theme
  const { theme, systemTheme } = useThemeStore.getState();
  applyTheme(theme, systemTheme);
}