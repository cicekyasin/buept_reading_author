import React, { useState, useEffect } from 'react';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import type { CreditSystemMode } from '../types';

// Props for the component
interface FeedbackProps {
  isDevMode?: boolean;
  lessonTitle?: string;
  creditSystemMode?: CreditSystemMode;
  setCreditSystemMode?: (mode: CreditSystemMode) => void;
  onToggleDevMode?: () => void;
}

// Local storage setup
const LOCAL_STORAGE_KEY_FEEDBACK = 'fled-user-feedback';
const LOCAL_STORAGE_KEY_CREDIT_MODE = 'fled-credit-system-mode';


type FeedbackEntry = {
    type: 'liked' | 'disliked';
    timestamp: string;
    lessonTitle: string;
};

const Feedback: React.FC<FeedbackProps> = ({ isDevMode = false, lessonTitle = 'Unknown', creditSystemMode, setCreditSystemMode, onToggleDevMode }) => {
  const [selection, setSelection] = useState<'none' | 'liked' | 'disliked'>('none');
  const [feedbackData, setFeedbackData] = useState<FeedbackEntry[]>([]);

  // Effect to load data in dev mode
  useEffect(() => {
    if (isDevMode) {
        try {
            const savedFeedback = localStorage.getItem(LOCAL_STORAGE_KEY_FEEDBACK);
            if (savedFeedback) {
                setFeedbackData(JSON.parse(savedFeedback));
            }
        } catch (error) {
            console.error("Failed to load feedback data:", error);
            setFeedbackData([]);
        }
    }
  }, [isDevMode]);

  // Handle feedback submission (for normal mode)
  const handleFeedback = (feedback: 'liked' | 'disliked') => {
    setSelection(feedback);
    try {
        const savedFeedback = localStorage.getItem(LOCAL_STORAGE_KEY_FEEDBACK);
        const feedbackHistory: FeedbackEntry[] = savedFeedback ? JSON.parse(savedFeedback) : [];
        
        const newEntry: FeedbackEntry = {
            type: feedback,
            timestamp: new Date().toISOString(),
            lessonTitle: lessonTitle,
        };

        feedbackHistory.push(newEntry);
        localStorage.setItem(LOCAL_STORAGE_KEY_FEEDBACK, JSON.stringify(feedbackHistory));

    } catch (error) {
        console.error("Failed to save feedback:", error);
    }
  };

  // Handle clearing feedback (for dev mode)
  const handleClearFeedback = () => {
    if (window.confirm('Are you sure you want to clear all feedback data? This cannot be undone.')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_FEEDBACK);
        setFeedbackData([]);
    }
  };

  const handleToggleCreditSystem = () => {
    if (!setCreditSystemMode) return;
    const newMode = creditSystemMode === 'simple' ? 'complex' : 'simple';
    localStorage.setItem(LOCAL_STORAGE_KEY_CREDIT_MODE, newMode);
    window.location.reload();
  };

  // Render Dev Mode view
  if (isDevMode) {
    return (
        <div className="text-left p-4 space-y-4 border-t-2 border-dashed border-red-500 mt-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-bold text-red-600 dark:text-red-400">Dev Mode: Admin Controls</h4>
              <div className="mt-2 p-2 space-y-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Credit System</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current Mode: <span className="font-bold capitalize">{creditSystemMode}</span></p>
                  </div>
                  <button
                    onClick={handleToggleCreditSystem}
                    className="py-1 px-3 text-xs font-medium text-white bg-boun-blue hover:bg-opacity-90 rounded-md"
                  >
                    Switch to {creditSystemMode === 'simple' ? 'Complex' : 'Simple'}
                  </button>
                </div>
                 <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-semibold">Developer Mode</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400">Exit developer session.</p>
                  </div>
                  <button
                    onClick={onToggleDevMode}
                    className="py-1 px-3 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-red-600 dark:text-red-400">User Feedback Data</h4>
              {feedbackData.length > 0 ? (
                  <>
                      <div className="max-h-60 overflow-y-auto text-xs space-y-2 p-2 mt-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                          {feedbackData.slice().reverse().map((fb, index) => (
                              <div key={index} className="p-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                                  <p><strong>{fb.type === 'liked' ? '👍 Liked' : '👎 Disliked'}</strong> on <span className="font-mono">{new Date(fb.timestamp).toLocaleString()}</span></p>
                                  <p className="text-slate-500 dark:text-slate-400">Context: <span className="italic">"{fb.lessonTitle}"</span></p>
                              </div>
                          ))}
                      </div>
                      <button
                          onClick={handleClearFeedback}
                          className="w-full mt-2 py-1 px-2 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 rounded-md"
                      >
                          Clear All Feedback Data
                      </button>
                  </>
              ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No feedback data recorded yet.</p>
              )}
            </div>
        </div>
    );
  }

  // Render Normal Mode view
  if (selection !== 'none') {
    return (
      <div className="text-center p-4">
        <p className="text-slate-600 dark:text-slate-300 font-medium">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="text-center p-4 space-y-3">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Was this lesson plan helpful?</p>
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={() => handleFeedback('liked')}
          aria-label="Good lesson plan"
          title="This was helpful"
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
        >
          <ThumbsUpIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleFeedback('disliked')}
          aria-label="Bad lesson plan"
          title="This was not helpful"
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
        >
          <ThumbsDownIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Feedback;