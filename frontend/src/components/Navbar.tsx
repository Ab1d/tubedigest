import { motion } from 'framer-motion';
import { History, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface NavbarProps {
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  transparent?: boolean;
}

export default function Navbar({ onHistoryClick, onSettingsClick, transparent: _transparent = true }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-transparent"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <a href="/" className="flex items-center select-none">
          <img
            src="/logo.svg"
            alt="TubeDigest"
            className="h-[28px] w-auto dark:invert transition-all duration-500"
          />
        </a>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white hover:bg-charcoal/5 dark:hover:bg-white/10 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
          </button>
          <button
            onClick={onSettingsClick}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white hover:bg-charcoal/5 dark:hover:bg-white/10 transition-colors"
            title="AI Provider Settings"
          >
            <Settings size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={onHistoryClick}
            className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white transition-colors duration-200"
          >
            <History size={15} strokeWidth={1.5} />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
