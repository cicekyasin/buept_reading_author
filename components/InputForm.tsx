

import React, { useState, useEffect } from 'react';
import { CEFR_LEVELS, QUICK_CEFR_SETS } from '../constants';
import { CEFR_DESCRIPTIONS } from '../constants';
import type { CEFRLevel } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import LoadIcon from './icons/LoadIcon';
import DiceIcon from './icons/DiceIcon';
import { generateRandomTopic } from '../services/geminiService';


interface InputFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  cefrLevel: CEFRLevel;
  setCefrLevel: (level: CEFRLevel) => void;
  advancedInstructions: string;
  setAdvancedInstructions: (instructions: string) => void;
  exemplarPassage: string;
  setExemplarPassage: (passage: string) => void;
  exemplarQuestions: string;
  setExemplarQuestions: (questions: string) => void;
  pedagogicalFocus: string;
  setPedagogicalFocus: (focus: string) => void;
  customVocabulary: string;
  setCustomVocabulary: (vocab: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onLoad: () => void;
  savedLessonExists: boolean;
  draftToRestore: any | null;
  onRestoreDraft: () => void;
  onDiscardDraft: () => void;
  credits: any; // Can be simple or complex credit object
  isCreditsLoading: boolean;
  onActivateDevMode: () => void;
  isDevMode: boolean;
}

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const InputForm: React.FC<InputFormProps> = ({
  topic,
  setTopic,
  cefrLevel,
  setCefrLevel,
  advancedInstructions,
  setAdvancedInstructions,
  exemplarPassage,
  setExemplarPassage,
  exemplarQuestions,
  setExemplarQuestions,
  pedagogicalFocus,
  setPedagogicalFocus,
  customVocabulary,
  setCustomVocabulary,
  onGenerate,
  isLoading,
  onLoad,
  savedLessonExists,
  draftToRestore,
  onRestoreDraft,
  onDiscardDraft,
  credits,
  isCreditsLoading,
  onActivateDevMode,
  isDevMode,
}) => {
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [cefrDescription, setCefrDescription] = useState<string>(
    CEFR_DESCRIPTIONS[cefrLevel]
  );
  
  const DEV_PASSWORD = '26.12.23=GY';

  useEffect(() => {
    setCefrDescription(CEFR_DESCRIPTIONS[cefrLevel]);
  }, [cefrLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopic(value);
    if (value === DEV_PASSWORD) {
        onActivateDevMode();
        // Clear the input after a short delay to allow state update to propagate
        setTimeout(() => setTopic(''), 100); 
    }
  };

  const handleRandomizeTopic = async () => {
    setIsRandomizing(true);
    try {
      const newTopic = await generateRandomTopic();
      setTopic(newTopic);
    } catch (error) {
      console.error("Failed to generate random topic:", error);
      alert('Could not generate a random topic. Please try again.');
    } finally {
      setIsRandomizing(false);
    }
  };
  
  const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );

  const getCreditStatus = () => {
    if (isDevMode) {
      return { canGenerate: true, message: "Generate Lesson Plan" };
    }
    if (isCreditsLoading || !credits) {
      return { canGenerate: false, message: 'Loading Credits...' };
    }
    
    if (credits.system === 'simple') {
      const canGenerate = credits.shared >= credits.costs.lessonPlan;
      const buttonText = canGenerate 
        ? `Generate Lesson Plan (${credits.costs.lessonPlan} Credits)`
        : `Not Enough Credits`;
      return { canGenerate, message: buttonText };
    }
    
    if (credits.system === 'complex') {
      const canGenerate = credits.lessonPlan.remaining > 0;
      const buttonText = canGenerate 
        ? `Generate Lesson Plan (${credits.lessonPlan.remaining}/${credits.lessonPlan.total} Left)`
        : `No Generations Left Today`;
      return { canGenerate, message: buttonText };
    }

    return { canGenerate: false, message: 'Invalid Credit System' };
  };

  const { canGenerate, message: buttonText } = getCreditStatus();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {draftToRestore && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <InfoIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                You have an unsaved draft. Would you like to restore it?
              </p>
              <div className="mt-3 md:mt-0 md:ml-4 flex space-x-3">
                <button
                  type="button"
                  onClick={onRestoreDraft}
                  className="whitespace-nowrap rounded-md bg-yellow-100 dark:bg-yellow-800 px-2 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 dark:focus:ring-offset-yellow-900/20 focus:ring-offset-yellow-50"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={onDiscardDraft}
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 dark:focus:ring-offset-yellow-900/20 focus:ring-offset-yellow-50"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Theme / Topic
        </label>
        <div className="flex items-center space-x-2">
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={handleTopicChange}
              placeholder="e.g., 'A day at the Grand Bazaar'"
              className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
              required
            />
            <button
              type="button"
              onClick={handleRandomizeTopic}
              disabled={isRandomizing}
              title="Generate a random topic idea"
              className="flex-shrink-0 p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
            >
              {isRandomizing ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
              ) : (
                <DiceIcon className="w-5 h-5" />
              )}
            </button>
        </div>
      </div>

      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Target CEFR Level
            </label>
            <button
                type="button"
                onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
                className="flex items-center text-xs font-medium text-boun-blue dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 rounded-md p-1"
                aria-expanded={isAdvancedVisible}
                aria-controls="advanced-options-panel"
            >
                <span>Advanced</span>
                <ChevronDownIcon
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        isAdvancedVisible ? 'rotate-180' : ''
                    }`}
                />
            </button>
        </div>
        <div className="flex space-x-2">
          {CEFR_LEVELS.map((group) => (
            <div 
              key={group.main} 
              className="relative group flex-1"
              onMouseLeave={() => setCefrDescription(CEFR_DESCRIPTIONS[cefrLevel])}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
                onMouseEnter={() => {
                  const baseLevel = group.sublevels.find(l => l === group.main) || group.sublevels[0];
                  setCefrDescription(CEFR_DESCRIPTIONS[baseLevel]);
                }}
                className={`w-full py-2 px-4 rounded-md group-hover:rounded-b-none text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 ${
                  cefrLevel.startsWith(group.main)
                    ? 'bg-boun-blue text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {cefrLevel.startsWith(group.main) ? cefrLevel : group.main}
              </button>
              <div
                role="menu"
                className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 rounded-b-md shadow-lg ring-1 ring-black dark:ring-slate-600 ring-opacity-5 z-10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transform-gpu scale-95 group-hover:scale-100 transition-all duration-150 origin-top"
              >
                <div className="py-1" role="none">
                  {group.sublevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      role="menuitem"
                      onClick={() => setCefrLevel(level)}
                      onMouseEnter={() => setCefrDescription(CEFR_DESCRIPTIONS[level])}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        cefrLevel === level
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-boun-blue dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md p-3 text-sm text-slate-600 dark:text-slate-400 min-h-[64px] transition-all duration-200 flex items-center">
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Level Description:</span> {cefrDescription}
            </p>
          </div>
        </div>

        <div
            id="advanced-options-panel"
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isAdvancedVisible ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'
            }`}
        >
            <div className="space-y-6 p-4 bg-slate-50/70 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Quick Sets
                  </label>
                  <div className="flex space-x-2">
                    {QUICK_CEFR_SETS.map(({ label, level }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setCefrLevel(level)}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 ${
                          cefrLevel === level
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-boun-blue dark:text-blue-300 ring-1 ring-boun-blue dark:ring-blue-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="advanced-instructions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    General Instructions <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
                  </label>
                  <textarea
                    id="advanced-instructions"
                    rows={2}
                    value={advancedInstructions}
                    onChange={(e) => setAdvancedInstructions(e.target.value)}
                    placeholder="e.g., 'Include a character named Ali.'"
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="border-t border-slate-300 dark:border-slate-600 pt-6">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Pedagogical Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pedagogical-focus" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Custom Pedagogical Focus
                      </label>
                      <input
                        type="text"
                        id="pedagogical-focus"
                        value={pedagogicalFocus}
                        onChange={(e) => setPedagogicalFocus(e.target.value)}
                        placeholder="e.g., 'Focus on using the present perfect tense.'"
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="exemplar-passage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Exemplar Passage (Style Guide)
                      </label>
                      <textarea
                        id="exemplar-passage"
                        rows={3}
                        value={exemplarPassage}
                        onChange={(e) => setExemplarPassage(e.target.value)}
                        placeholder="Paste a short passage here to guide the AI's writing style and tone."
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                     <div>
                      <label htmlFor="exemplar-questions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Exemplar Questions (Style Guide)
                      </label>
                      <textarea
                        id="exemplar-questions"
                        rows={3}
                        value={exemplarQuestions}
                        onChange={(e) => setExemplarQuestions(e.target.value)}
                        placeholder="Provide 1-2 example questions to guide the AI's question style."
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="custom-vocabulary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Required Vocabulary (comma-separated)
                      </label>
                      <textarea
                        id="custom-vocabulary"
                        rows={2}
                        value={customVocabulary}
                        onChange={(e) => setCustomVocabulary(e.target.value)}
                        placeholder="e.g., sustainable, ecosystem, conservation"
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={isLoading || isCreditsLoading || !canGenerate}
            className="flex-grow flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              'Generating...'
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                <span>{buttonText}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onLoad}
            disabled={!savedLessonExists || isLoading}
            aria-label="Load saved lesson"
            title="Load saved lesson"
            className="flex-shrink-0 flex items-center justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue dark:focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
          >
            <LoadIcon className="w-5 h-5 mr-2" />
            Load
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputForm;