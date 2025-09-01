import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { key: 'light' as const, label: 'Light', icon: Sun },
    { key: 'dark' as const, label: 'Dark', icon: Moon },
    { key: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-8 h-8 p-0"
        >
          <motion.div
            key={theme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <currentTheme.icon className="w-4 h-4" />
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.key}
            onClick={() => setTheme(themeOption.key)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <themeOption.icon className="w-4 h-4" />
            <span>{themeOption.label}</span>
            {theme === themeOption.key && (
              <motion.div
                layoutId="theme-indicator"
                className="w-1 h-1 bg-primary rounded-full ml-auto"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}