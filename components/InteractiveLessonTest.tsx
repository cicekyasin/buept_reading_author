import React, { useMemo, useState, useEffect } from 'react';
import type { LessonPlan, Language, UserAnswers, GradingResults, ComprehensionQuestion, GradingResult } from '../types';
import { UI_TEXT } from '../translations';
import XMarkIcon from './icons/XMarkIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface InteractiveLessonTestProps {
  lessonPlan: LessonPlan;
  language: Language;
  userAnswers: UserAnswers;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  gradingResults: GradingResults | null;
  isGrading: boolean;
  onGrade: () => void;
  onQuit: () => void;
}

const formatPassage = (passage: string) => {
    return passage.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
    ));
};

const InteractiveQuestion: React.FC<{ 
    q: ComprehensionQuestion,
    qNum: number,
    userAnswer: string, 
    onAnswerChange: (answer: string) => void,
    gradingResult: GradingResults[number] | null,
    language: Language
}> = ({ q, qNum, userAnswer, onAnswerChange, gradingResult, language }) => {
    const isGraded = !!gradingResult;
    const isCorrect = gradingResult?.result === 'correct';

    return (
        <div className={`py-4 transition-colors ${isGraded ? (isCorrect ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10') : ''}`}>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
                {qNum}. {q.question}
            </p>
            
            {q.type === 'true-false' && (
                <fieldset className="mt-3 space-y-2" disabled={isGraded}>
                    <legend className="sr-only">True or False</legend>
                    <label className="flex items-center p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                        <input type="radio" name={`q-${qNum}`} value="True" checked={userAnswer === 'True'} onChange={(e) => onAnswerChange(e.target.value)} className="h-4 w-4 text-boun-light-blue border-slate-400 focus:ring-boun-light-blue" />
                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">True</span>
                    </label>
                    <label className="flex items-center p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                        <input type="radio" name={`q-${qNum}`} value="False" checked={userAnswer === 'False'} onChange={(e) => onAnswerChange(e.target.value)} className="h-4 w-4 text-boun-light-blue border-slate-400 focus:ring-boun-light-blue" />
                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">False</span>
                    </label>
                </fieldset>
            )}
            
            {q.type === 'multiple-choice' && q.options && (
                <fieldset className="mt-3 space-y-2" disabled={isGraded}>
                    <legend className="sr-only">Options for question {qNum}</legend>
                    {q.options.map((opt, i) => (
                         <label key={i} className="flex items-start p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <input type="radio" name={`q-${qNum}`} value={opt} checked={userAnswer === opt} onChange={(e) => onAnswerChange(e.target.value)} className="h-4 w-4 mt-1 text-boun-light-blue border-slate-400 focus:ring-boun-light-blue" />
                            <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                        </label>
                    ))}
                </fieldset>
            )}

            {q.type === 'short-answer' && (
                <div className="mt-3">
                    <textarea
                        rows={3}
                        value={userAnswer}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        disabled={isGraded}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-boun-light-blue sm:text-sm"
                        placeholder="Your answer..."
                    />
                </div>
            )}

            {isGraded && (
                <div className="mt-3 p-3 rounded-md bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        {isCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-500" />}
                        <span className={`ml-2 text-sm font-bold ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {isCorrect ? UI_TEXT.lessonTestCorrect[language] : UI_TEXT.lessonTestIncorrect[language]}
                        </span>
                    </div>
                    {!isCorrect && (
                         <div className="mt-2 space-y-2 text-xs">
                            <p><strong className="font-medium text-slate-600 dark:text-slate-400">{UI_TEXT.lessonTestYourAnswer[language]}:</strong> <span className="text-red-700 dark:text-red-300 italic">"{gradingResult.userAnswer || 'No answer provided'}"</span></p>
                            <p><strong className="font-medium text-slate-600 dark:text-slate-400">{UI_TEXT.lessonTestCorrectAnswer[language]}:</strong> <span className="text-green-700 dark:text-green-300">"{gradingResult.correctAnswer}"</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const InteractiveLessonTest: React.FC<InteractiveLessonTestProps> = ({
  lessonPlan, language, userAnswers, onAnswerChange, gradingResults, isGrading, onGrade, onQuit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes for a standard lesson test

  const formattedPassage = useMemo(() => formatPassage(lessonPlan.readingPassage), [lessonPlan.readingPassage]);
  const score = useMemo(() => {
    if (!gradingResults) return null;
    // FIX: Explicitly type the filter callback parameter to resolve 'unknown' type error.
    const correctCount = Object.values(gradingResults).filter((r: GradingResult) => r.result === 'correct').length;
    return { correct: correctCount, total: lessonPlan.comprehensionQuestions.length };
  }, [gradingResults, lessonPlan.comprehensionQuestions.length]);

  useEffect(() => {
    let timer: number;
    if (!gradingResults) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [gradingResults]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleNext = () => {
      const isLastQuestion = currentQuestionIndex === lessonPlan.comprehensionQuestions.length - 1;
      if (!isLastQuestion) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          onGrade();
      }
  };

  const currentQuestion = lessonPlan.comprehensionQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lessonPlan.comprehensionQuestions.length - 1;

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col" role="dialog" aria-modal="true">
        <header className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
                <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs sm:max-w-md">{lessonPlan.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {gradingResults 
                            ? `${UI_TEXT.lessonTestScore[language]}: ${score?.correct} / ${score?.total}`
                            : `${UI_TEXT.lessonTestProgress[language]} ${currentQuestionIndex + 1} / ${lessonPlan.comprehensionQuestions.length}`
                        }
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    {!gradingResults && (
                        <div className="text-right">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{UI_TEXT.lessonTestTimeLeft[language]}</p>
                            <p className="font-mono text-lg text-boun-blue dark:text-blue-400">{formatTime(timeLeft)}</p>
                        </div>
                    )}
                    <button onClick={onQuit} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-boun-blue dark:hover:text-blue-400">
                        <XMarkIcon className="w-6 h-6 mr-1" />
                        {UI_TEXT.lessonTestQuit[language]}
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
                        lessonPlan.comprehensionQuestions.map((q, i) => (
                            <InteractiveQuestion
                                key={i}
                                q={q}
                                qNum={i + 1}
                                userAnswer={userAnswers[i + 1] || ''}
                                onAnswerChange={(answer) => onAnswerChange(i + 1, answer)}
                                gradingResult={gradingResults ? gradingResults[i + 1] : null}
                                language={language}
                            />
                        ))
                    ) : (
                        <InteractiveQuestion
                            q={currentQuestion}
                            qNum={currentQuestionIndex + 1}
                            userAnswer={userAnswers[currentQuestionIndex + 1] || ''}
                            onAnswerChange={(answer) => onAnswerChange(currentQuestionIndex + 1, answer)}
                            gradingResult={null}
                            language={language}
                        />
                    )}
                </div>
                {!gradingResults && (
                    <div className="mt-6 flex-shrink-0">
                        <button
                            onClick={handleNext}
                            disabled={isGrading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 disabled:bg-opacity-50"
                        >
                            {isGrading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                                    {UI_TEXT.lessonTestGrading[language]}
                                </>
                            ) : (
                                <>
                                    <span>{isLastQuestion ? UI_TEXT.lessonTestSubmit[language] : UI_TEXT.lessonTestNext[language]}</span>
                                    {!isLastQuestion && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default InteractiveLessonTest;