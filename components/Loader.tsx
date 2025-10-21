import React from 'react';
import { UI_TEXT } from '../translations';
import type { Language } from '../types';

interface LoaderProps {
  message?: string;
  language: Language;
}

const Loader: React.FC<LoaderProps> = ({ message, language }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-700 border-t-boun-light-blue dark:border-t-blue-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold text-center">
        {message || UI_TEXT.loaderDefaultMessage[language]}
      </p>
      <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">{UI_TEXT.loaderSubMessage[language]}</p>
    </div>
  );
};

export default Loader;
