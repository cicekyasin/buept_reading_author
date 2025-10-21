import React, { useMemo, useState, useEffect } from 'react';
import type { BueptReadingSection, Language, UserAnswers, GradingResults, BueptQuestion, GradingResult } from '../types';
import { UI_TEXT } from '../translations';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import PlayIcon from './icons/PlayIcon';
import XMarkIcon from './icons/XMarkIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';


interface InteractiveReadingSectionProps {
  section: BueptReadingSection;
  sectionTitle: string;
  time: number;
  language: Language;
  userAnswers: UserAnswers;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  gradingResults: GradingResults | null;
  isGrading: boolean;
  onGrade: () => void;
  onBack: () => void;
}

const formatPassage = (passage: string) => {
    return passage.split(/(\[P\d+\])/).filter(part => part).map((part, index) => {
        if (part.match(/\[P\d+\]/)) {
            return <strong key={index} className="block mt-4 first:mt-0 font-bold text-slate-500 dark:text-slate-400">{part.trim()}</strong>;
        }
        return <span key={index}>{part.trim()}</span>;
    });
};

const InteractiveQuestion: React.FC<{ 
    q: BueptQuestion, 
    userAnswer: string, 
    onAnswerChange: (answer: string) => void,
    gradingResult: GradingResults[number] | null,
    isGrading: boolean,
    language: Language
}> = ({ q, userAnswer, onAnswerChange, gradingResult, isGrading, language }) => {
    const isGraded = !!gradingResult;
    const isCorrect = gradingResult?.result === 'correct';

    return (
        <div className={`py-4 transition-colors ${isGraded ? (isCorrect ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10') : ''}`}>
            <p className="font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {`${q.questionNumber}. ${q.questionText}`}
            </p>

            {q.options ? ( // Multiple Choice
                <fieldset className="mt-3 space-y-2" disabled={isGraded || isGrading}>
                    <legend className="sr-only">Options for question {q.questionNumber}</legend>
                    {q.options.map((opt, i) => {
                        const optionLetter = String.fromCharCode(65 + i);
                        return (
                             <label key={i} className="flex items-start p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                                <input
                                    type="radio"
                                    name={`question-${q.questionNumber}`}
                                    value={optionLetter}
                                    checked={userAnswer === optionLetter}
                                    onChange={(e) => onAnswerChange(e.target.value)}
                                    className="h-4 w-4 mt-1 text-boun-light-blue border-slate-400 focus:ring-boun-light-blue disabled:opacity-50"
                                />
                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="font-semibold mr-1">{optionLetter})</span>
                                    {opt}
                                </span>
                            </label>
                        )
                    })}
                </fieldset>
            ) : ( // Open Ended
                <div className="mt-3">
                    <textarea
                        rows={3}
                        value={userAnswer}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        disabled={isGraded || isGrading}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue focus:border-boun-light-blue dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:opacity-70"
                        placeholder="Your answer..."
                    />
                </div>
            )}
            {isGraded && (
                <div className="mt-3 p-3 rounded-md bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        {isCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-500" />}
                        <span className={`ml-2 text-sm font-bold ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {isCorrect ? UI_TEXT.bueptCorrect[language] : UI_TEXT.bueptIncorrect[language]}
                        </span>
                    </div>
                    {!isCorrect && (
                         <div className="mt-2 space-y-2 text-xs">
                            <p><strong className="font-medium text-slate-600 dark:text-slate-400">{UI_TEXT.bueptYourAnswer[language]}:</strong> <span className="text-red-700 dark:text-red-300 italic">"{gradingResult.userAnswer || 'No answer provided'}"</span></p>
                            <p><strong className="font-medium text-slate-600 dark:text-slate-400">{UI_TEXT.bueptCorrectAnswer[language]}:</strong> <span className="text-green-700 dark:text-green-300">"{gradingResult.correctAnswer}"</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const InteractiveReadingSection: React.FC<InteractiveReadingSectionProps> = ({
  section,
  sectionTitle,
  time,
  language,
  userAnswers,
  onAnswerChange,
  gradingResults,
  isGrading,
  onGrade,
  onBack,
}) => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(time * 60);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const formattedPassage = useMemo(() => formatPassage(section.passage), [section.passage]);
  const score = useMemo(() => {
    if (!gradingResults) return null;
    // FIX: Explicitly type the filter callback parameter to resolve 'unknown' type error.
    const correctCount = Object.values(gradingResults).filter((r: GradingResult) => r.result === 'correct').length;
    return { correct: correctCount, total: section.questions.length };
  }, [gradingResults, section.questions.length]);

  useEffect(() => {
    let timer: number;
    if (isTestActive && !gradingResults) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [isTestActive, gradingResults]);

  useEffect(() => {
    // Reset feedback state when a new section is loaded
    setFeedbackSubmitted(false);
  }, [section]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
      const isLastQuestion = currentQuestionIndex === section.questions.length - 1;
      if (!isLastQuestion) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          onGrade();
      }
  };

  const renderTestTakerView = () => {
    const isLastQuestion = currentQuestionIndex === section.questions.length - 1;
    const currentQuestion = section.questions[currentQuestionIndex];
  
    return (
        <div
        className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        >
            <header className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">{sectionTitle}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                             {gradingResults 
                                ? `${UI_TEXT.bueptScore[language]}: ${score?.correct} / ${score?.total}`
                                : `${UI_TEXT.bueptQuestionProgress[language]} ${currentQuestionIndex + 1} / ${section.questions.length}`
                             }
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!gradingResults && (
                           <div className="text-right">
                             <p className="font-semibold text-slate-700 dark:text-slate-300">{UI_TEXT.bueptTimeLeft[language]}</p>
                             <p className="font-mono text-lg text-boun-blue dark:text-blue-400">{formatTime(timeLeft)}</p>
                           </div>
                        )}
                         <button 
                           onClick={onBack} 
                           className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-boun-blue dark:hover:text-blue-400"
                           title={UI_TEXT.bueptQuit[language]}
                         >
                            <XMarkIcon className="w-6 h-6 mr-1" />
                            {UI_TEXT.bueptQuit[language]}
                        </button>
                    </div>
                </div>
            </header>
            <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto p-4 sm:p-6">
                <div className="overflow-y-auto">
                    <div className="prose prose-slate dark:prose-invert max-w-none text-justify pr-4">
                        {formattedPassage}
                    </div>
                </div>
                <div className="overflow-y-auto flex flex-col">
                     <div className="flex-grow pr-2">
                        {gradingResults ? (
                           section.questions.map(q => (
                                <InteractiveQuestion
                                    key={q.questionNumber}
                                    q={q}
                                    userAnswer={userAnswers[q.questionNumber] || ''}
                                    onAnswerChange={(answer) => onAnswerChange(q.questionNumber, answer)}
                                    gradingResult={gradingResults ? gradingResults[q.questionNumber] : null}
                                    isGrading={isGrading}
                                    language={language}
                                />
                           ))
                        ) : (
                            <InteractiveQuestion
                                key={currentQuestion.questionNumber}
                                q={currentQuestion}
                                userAnswer={userAnswers[currentQuestion.questionNumber] || ''}
                                onAnswerChange={(answer) => onAnswerChange(currentQuestion.questionNumber, answer)}
                                gradingResult={null}
                                isGrading={isGrading}
                                language={language}
                            />
                        )}
                    </div>
                    {!gradingResults && (
                        <div className="mt-6 flex-shrink-0">
                            <button
                                onClick={handleNextQuestion}
                                disabled={isGrading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue disabled:bg-opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGrading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                                        {UI_TEXT.bueptGradingButton[language]}
                                    </>
                                ) : (
                                  <>
                                    <span>{isLastQuestion ? UI_TEXT.bueptSubmitButton[language] : UI_TEXT.bueptNext[language]}</span>
                                    {!isLastQuestion && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                                  </>
                                )}
                            </button>
                        </div>
                    )}
                    {gradingResults && (
                        <div className="mt-6 flex-shrink-0 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            {!feedbackSubmitted ? (
                                <>
                                    <p className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-3">
                                        {UI_TEXT.bueptFeedbackQuestion[language]}
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => setFeedbackSubmitted(true)} className="flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">
                                            {UI_TEXT.bueptFeedbackOptionEasy[language]}
                                        </button>
                                        <button onClick={() => setFeedbackSubmitted(true)} className="flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                                            {UI_TEXT.bueptFeedbackOptionGood[language]}
                                        </button>
                                        <button onClick={() => setFeedbackSubmitted(true)} className="flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                                            {UI_TEXT.bueptFeedbackOptionHard[language]}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm font-medium text-center text-slate-600 dark:text-slate-300">
                                    {UI_TEXT.bueptFeedbackThanks[language]}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };


  if (isTestActive) {
      return renderTestTakerView();
  }

  // Preview view
  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm relative">
        <div className="filter blur-sm pointer-events-none">
            <header className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
                        <h3 className="text-2xl font-bold text-transparent bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse">{sectionTitle}</h3>
                        {section.sourceCredit && <p className="mt-2 text-xs h-3 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-semibold h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></p>
                        <p className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded mt-1 animate-pulse"></p>
                    </div>
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-semibold h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></h4>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-semibold h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></h4>
                    <div className="space-y-4">
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex flex-col items-center justify-center rounded-xl">
             <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-sm font-medium text-boun-blue dark:text-blue-400 hover:underline">
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                {UI_TEXT.bueptBackToSelection[language]}
            </button>
            <button
                onClick={() => setIsTestActive(true)}
                className="flex items-center justify-center py-4 px-8 border border-transparent rounded-full shadow-lg text-lg font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
                <PlayIcon className="w-6 h-6 mr-3" />
                {UI_TEXT.bueptStartSection[language]}
            </button>
        </div>
    </div>
  );
};

export default InteractiveReadingSection;