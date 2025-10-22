

import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import type { UserRole, LessonPlan, Source, AppMode } from '../types';
import HistoryIcon from './icons/HistoryIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';


type HistoryEntry = {
  lessonPlan: LessonPlan;
  sources: Source[] | null;
};

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  history: HistoryEntry[];
  activeHistoryIndex: number | null;
  onSelectHistory: (index: number) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isDevMode: boolean;
}

const AppModeToggle: React.FC<{ appMode: AppMode; setAppMode: (mode: AppMode) => void; }> = ({ appMode, setAppMode }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setAppMode('designer')}
        title="Lesson Designer"
        className={`flex items-center space-x-2 py-2 px-2 md:px-3 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-boun-light-blue focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
          appMode === 'designer' ? 'bg-boun-blue text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <BookOpenIcon className="w-5 h-5" />
        <span className="hidden md:inline">Lesson Designer</span>
      </button>
      <button
        onClick={() => setAppMode('exam')}
        title="BUEPT Practice"
        className={`flex items-center space-x-2 py-2 px-2 md:px-3 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-boun-light-blue focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
          appMode === 'exam' ? 'bg-boun-blue text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <ClipboardCheckIcon className="w-5 h-5" />
        <span className="hidden md:inline">BUEPT Practice</span>
      </button>
    </div>
  );
};

const RoleToggle: React.FC<{ userRole: UserRole; setUserRole: (role: UserRole) => void; }> = ({ userRole, setUserRole }) => {
  return (
    <div className="relative flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-full border border-slate-200 dark:border-slate-600">
      {/* Sliding background */}
      <span
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white dark:bg-slate-800 shadow-sm transition-transform duration-200 ease-in-out transform ${
          userRole === 'instructor' ? 'translate-x-full' : 'translate-x-0'
        }`}
        aria-hidden="true"
      />
      
      {/* Buttons */}
      <button
        onClick={() => setUserRole('student')}
        title="Student"
        className={`relative z-10 flex-1 flex items-center justify-center py-1 px-3 text-center text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-boun-light-blue focus:ring-offset-1 dark:focus:ring-offset-slate-700 ${
          userRole === 'student' ? 'text-boun-blue dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
        aria-pressed={userRole === 'student'}
      >
        <UserCircleIcon className="w-5 h-5" />
        <span className="hidden md:inline ml-2">Student</span>
      </button>
      <button
        onClick={() => setUserRole('instructor')}
        title="Instructor"
        className={`relative z-10 flex-1 flex items-center justify-center py-1 px-3 text-center text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-boun-light-blue focus:ring-offset-1 dark:focus:ring-offset-slate-700 ${
          userRole === 'instructor' ? 'text-boun-blue dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
        aria-pressed={userRole === 'instructor'}
      >
        <AcademicCapIcon className="w-5 h-5" />
        <span className="hidden md:inline ml-2">Instructor</span>
      </button>
    </div>
  );
};

const History: React.FC<{
  history: HistoryEntry[];
  activeHistoryIndex: number | null;
  onSelectHistory: (index: number) => void;
}> = ({ history, activeHistoryIndex, onSelectHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={history.length === 0}
        title="View session history"
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-boun-light-blue dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HistoryIcon className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black dark:ring-slate-600 ring-opacity-5 z-20">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 px-2">Session History</h4>
          </div>
          <ul className="py-1 max-h-80 overflow-y-auto">
            {history.length > 0 ? (
              history.map((entry, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      onSelectHistory(index);
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      index === activeHistoryIndex
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-boun-blue dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block truncate">{entry.lessonPlan.title}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{entry.lessonPlan.cefrLevel}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                No plans generated yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ theme, setTheme, userRole, setUserRole, history, activeHistoryIndex, onSelectHistory, appMode, setAppMode, isDevMode }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-boun-light-blue dark:text-blue-400 tracking-tight text-center sm:text-left">
              FLED L2 Reading Designer
              {isDevMode && <span className="ml-3 text-sm font-bold align-middle text-red-500 bg-red-100 dark:bg-red-900/50 py-1 px-2 rounded-md">DEV</span>}
            </h1>
            <p className="text-boun-blue dark:text-blue-300 mt-1 text-center sm:text-left">
              Generate research-backed <strong className="font-bold">EFL</strong> reading materials instantly.
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <AppModeToggle appMode={appMode} setAppMode={setAppMode} />
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-4">
              <RoleToggle userRole={userRole} setUserRole={setUserRole} />
              {appMode === 'designer' && (
                <History history={history} activeHistoryIndex={activeHistoryIndex} onSelectHistory={onSelectHistory} />
              )}
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;