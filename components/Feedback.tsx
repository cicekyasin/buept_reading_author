import React, { useState } from 'react';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import type { Language } from '../types';
import { UI_TEXT } from '../translations';

interface FeedbackProps {
  language: Language;
}

const Feedback: React.FC<FeedbackProps> = ({ language }) => {
  const [selection, setSelection] = useState<'none' | 'liked' | 'disliked'>('none');

  const handleFeedback = (feedback: 'liked' | 'disliked') => {
    setSelection(feedback);
    // In a real application, you would send this feedback to a server.
    // console.log(`Feedback received: ${feedback}`);
  };

  if (selection !== 'none') {
    return (
      <div className="text-center p-4">
        <p className="text-slate-600 dark:text-slate-300 font-medium">{UI_TEXT.feedbackThanks[language]}</p>
      </div>
    );
  }

  return (
    <div className="text-center p-4 space-y-3">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{UI_TEXT.feedbackQuestion[language]}</p>
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={() => handleFeedback('liked')}
          aria-label={UI_TEXT.feedbackGood[language]}
          title={UI_TEXT.feedbackGoodTooltip[language]}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
        >
          <ThumbsUpIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleFeedback('disliked')}
          aria-label={UI_TEXT.feedbackBad[language]}
          title={UI_TEXT.feedbackBadTooltip[language]}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
        >
          <ThumbsDownIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Feedback;