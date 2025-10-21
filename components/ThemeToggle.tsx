import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import { UI_TEXT } from '../translations';
import type { Language } from '../types';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: Language;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme, language }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const tooltipText = theme === 'light' ? UI_TEXT.themeTooltipDark[language] : UI_TEXT.themeTooltipLight[language];

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-boun-light-blue dark:focus:ring-offset-slate-800 transition-colors"
      aria-label={tooltipText}
      title={tooltipText}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggle;