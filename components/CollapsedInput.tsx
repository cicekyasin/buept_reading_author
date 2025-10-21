import React from 'react';
import SettingsIcon from './icons/SettingsIcon';
import LoadIcon from './icons/LoadIcon';
import { UI_TEXT } from '../translations';
import type { Language } from '../types';

interface CollapsedInputProps {
  onExpand: () => void;
  onLoad: () => void;
  savedLessonExists: boolean;
  language: Language;
}

const CollapsedInput: React.FC<CollapsedInputProps> = ({ onExpand, onLoad, savedLessonExists, language }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          {UI_TEXT.collapsedInputTitle[language]}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {UI_TEXT.collapsedInputSubtitle[language]}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onLoad}
          disabled={!savedLessonExists}
          aria-label={UI_TEXT.loadButtonAriaLabel[language]}
          title={UI_TEXT.loadButtonAriaLabel[language]}
          className="flex items-center justify-center py-2.5 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
        >
          <LoadIcon className="w-5 h-5 mr-2" />
          {UI_TEXT.loadButton[language]}
        </button>
        <button
          type="button"
          onClick={onExpand}
          className="flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
        >
           <SettingsIcon className="w-5 h-5 mr-2" />
          {UI_TEXT.collapsedInputEditButton[language]}
        </button>
      </div>
    </div>
  );
};

export default CollapsedInput;