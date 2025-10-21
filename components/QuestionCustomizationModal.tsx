import React, { useState, useEffect } from 'react';
import { UI_TEXT, PASSAGE_LENGTH_OPTIONS_TRANSLATED } from '../translations';
import type { Language } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface QuestionCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  passageLength: number;
  setPassageLength: (length: number) => void;
  numberOfQuestions: number;
  setNumberOfQuestions: (num: number) => void;
  language: Language;
  maxQuestions: number;
}

const QuestionCustomizationModal: React.FC<QuestionCustomizationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  passageLength,
  setPassageLength,
  numberOfQuestions,
  setNumberOfQuestions,
  language,
  maxQuestions,
}) => {
  if (!isOpen) {
    return null;
  }
  
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {UI_TEXT.passageModalTitle[language]}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {UI_TEXT.passageModalSubtitle[language]}
          </p>
        </div>
        <div className="px-6 pb-6 space-y-6 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {UI_TEXT.passageLengthLabel[language]}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PASSAGE_LENGTH_OPTIONS_TRANSLATED.map(option => (
                  <button
                    key={option.label.en}
                    type="button"
                    onClick={() => setPassageLength(option.value)}
                    className={`text-center p-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 ${
                      passageLength === option.value
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-boun-blue dark:text-blue-300 ring-1 ring-boun-blue dark:ring-blue-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-sm font-semibold block">{option.label[language]}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{option.description[language]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="modal-question-count" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {UI_TEXT.questionCountLabel[language]} ({numberOfQuestions} / {maxQuestions})
              </label>
              <input
                id="modal-question-count"
                type="range"
                min="3"
                max={maxQuestions}
                step="1"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end items-center rounded-b-xl border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
              >
                  Cancel
              </button>
              <button
                  type="button"
                  onClick={onConfirm}
                  className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
              >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {UI_TEXT.questionModalConfirmButton[language]}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCustomizationModal;