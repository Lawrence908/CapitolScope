import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-bg-light-tertiary dark:bg-bg-tertiary hover:bg-bg-light-secondary dark:hover:bg-bg-secondary border border-primary-600/20 hover:border-primary-400/40 transition-all duration-300 shadow-glow-primary/20 hover:shadow-glow-primary/40"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <SunIcon className="h-5 w-5 text-warning" />
      ) : (
        <MoonIcon className="h-5 w-5 text-primary-400" />
      )}
    </button>
  );
};

export default DarkModeToggle; 