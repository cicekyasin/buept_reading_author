import React from 'react';
import SettingsIcon from './icons/SettingsIcon';
import LoadIcon from './icons/LoadIcon';

interface CollapsedInputProps {
  onExpand: () => void;
  onLoad: () => void;
  savedLessonExists: boolean;
}

const CollapsedInput: React.FC<CollapsedInputProps> = ({ onExpand, onLoad, savedLessonExists }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Lesson Generated!
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your lesson plan is ready. You can edit the settings again if needed.
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onLoad}
          disabled={!savedLessonExists}
          aria-label="Load saved lesson"
          title="Load saved lesson"
          className="flex items-center justify-center py-2.5 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
        >
          <LoadIcon className="w-5 h-5 mr-2" />
          Load
        </button>
        <button
          type="button"
          onClick={onExpand}
          className="flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
        >
           <SettingsIcon className="w-5 h-5 mr-2" />
          Edit Settings
        </button>
      </div>
    </div>
  );
};

export default CollapsedInput;