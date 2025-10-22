

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import CollapsedInput from './components/CollapsedInput';
import QuestionCustomizationModal from './components/QuestionCustomizationModal';
import PassageViewerModal from './components/PassageViewerModal';
import ExamGenerator from './components/ExamGenerator';
import InteractiveLessonTest from './components/InteractiveLessonTest';
import { generateLessonPlan, findSourcesForPassage, gradeOpenEndedAnswer } from './services/geminiService';
import type { CEFRLevel, LessonPlan, Source, UserRole, AppMode, UserAnswers, GradingResults, GradingResult, CreditSystemMode } from './types';
import { useCredits } from './hooks/useCredits';

const LOCAL_STORAGE_KEY_LESSON = 'fled-saved-lesson-plan';
const LOCAL_STORAGE_KEY_AUTOSAVE = 'fled-autosave-draft';
const LOCAL_STORAGE_KEY_THEME = 'fled-theme';
const LOCAL_STORAGE_KEY_ROLE = 'fled-user-role';
const LOCAL_STORAGE_KEY_CREDIT_MODE = 'fled-credit-system-mode';

type HistoryEntry = {
  lessonPlan: LessonPlan;
  sources: Source[] | null;
};

const App: React.FC = () => {
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    return sessionStorage.getItem('fled-dev-mode') === 'true';
  });
  const [togglingDevMode, setTogglingDevMode] = useState(false);
  const [creditSystemMode, setCreditSystemMode] = useState<CreditSystemMode>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEY_CREDIT_MODE) as CreditSystemMode) || 'simple';
  });
  
  const { credits, deductCredits, isLoading: isCreditsLoading } = useCredits(isDevMode, creditSystemMode);

  // App Mode State
  const [appMode, setAppMode] = useState<AppMode>('designer');

  // Lesson Plan Designer State
  const [topic, setTopic] = useState<string>('');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>('B1');
  const [passageLength, setPassageLength] = useState<number>(500);
  const [advancedInstructions, setAdvancedInstructions] = useState<string>('');
  const [exemplarPassage, setExemplarPassage] = useState<string>('');
  const [exemplarQuestions, setExemplarQuestions] = useState<string>('');
  const [pedagogicalFocus, setPedagogicalFocus] = useState<string>('');
  const [customVocabulary, setCustomVocabulary] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(6);
  
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchingSources, setIsSearchingSources] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Connecting to the FLED-AI...');
  const [savedLessonExists, setSavedLessonExists] = useState<boolean>(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState<boolean>(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [isPassageExpanded, setIsPassageExpanded] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);
  const [draftToRestore, setDraftToRestore] = useState<any | null>(null);

  // Interactive Lesson Test State
  const [isLessonTestActive, setIsLessonTestActive] = useState<boolean>(false);
  const [lessonUserAnswers, setLessonUserAnswers] = useState<UserAnswers>({});
  const [lessonGradingResults, setLessonGradingResults] = useState<GradingResults | null>(null);
  const [isLessonGrading, setIsLessonGrading] = useState<boolean>(false);

  // General App State
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userRole, setUserRole] = useState<UserRole>('student');

  const loadingIntervalRef = useRef<number | null>(null);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  
  const maxQuestions = useMemo(() => {
    if (passageLength <= 300) return 6; // For ~250 words
    if (passageLength <= 600) return 9; // For ~500 words
    if (passageLength <= 800) return 12; // for ~750 words
    return 15; // For 1000+ words
  }, [passageLength]);

  useEffect(() => {
    if (numberOfQuestions > maxQuestions) {
        setNumberOfQuestions(maxQuestions);
    }
  }, [maxQuestions, numberOfQuestions]);

  // Initialize Theme, Role, and check for drafts
  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    
    const savedRole = localStorage.getItem(LOCAL_STORAGE_KEY_ROLE) as UserRole | null;
    setUserRole(savedRole || 'student');

    const savedPlan = localStorage.getItem(LOCAL_STORAGE_KEY_LESSON);
    setSavedLessonExists(!!savedPlan);

    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY_AUTOSAVE);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.topic || parsedDraft.advancedInstructions || parsedDraft.exemplarPassage || parsedDraft.exemplarQuestions || parsedDraft.pedagogicalFocus || parsedDraft.customVocabulary) {
          setDraftToRestore(parsedDraft);
        }
      } catch (e) {
        console.error("Could not parse autosaved draft.", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY_AUTOSAVE);
      }
    }
  }, []);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [theme]);

  // Update localStorage when user role changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ROLE, userRole);
  }, [userRole]);

  // Auto-save form inputs
  const formState = useMemo(() => ({
    topic,
    cefrLevel,
    passageLength,
    advancedInstructions,
    exemplarPassage,
    exemplarQuestions,
    pedagogicalFocus,
    customVocabulary,
    numberOfQuestions,
  }), [topic, cefrLevel, passageLength, advancedInstructions, exemplarPassage, exemplarQuestions, pedagogicalFocus, customVocabulary, numberOfQuestions]);

  useEffect(() => {
    const hasContent = formState.topic.trim() || formState.advancedInstructions.trim() || formState.exemplarPassage.trim() || formState.exemplarQuestions.trim() || formState.pedagogicalFocus.trim() || formState.customVocabulary.trim();

    if (!hasContent || lessonPlan || isLoading || appMode !== 'designer') {
      return;
    }
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTOSAVE, JSON.stringify(formState));
    }, 1500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formState, lessonPlan, isLoading, appMode]);
  
  const startLoadingMessages = () => {
    const messages = [
      'Connecting to the FLED-AI...',
      'Crafting a level-appropriate reading passage...',
      'Selecting key Tier 2 vocabulary...',
      'Writing comprehension questions...',
      'Formulating the pedagogical rationale...',
      'Almost there...',
    ];
    let index = 0;
    setLoadingMessage(messages[index]);
    loadingIntervalRef.current = window.setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 2500);
  };

  const stopLoadingMessages = () => {
    if (loadingIntervalRef.current !== null) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };

  const clearAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTOSAVE);
  }, []);
  
  // Dev mode activation logic
  const handleToggleDevMode = useCallback(() => {
    setTogglingDevMode(true);
    const currentDevMode = sessionStorage.getItem('fled-dev-mode') === 'true';
    sessionStorage.setItem('fled-dev-mode', String(!currentDevMode));
    setTimeout(() => {
      window.location.reload();
    }, 1000); // Wait for message to be visible
  }, []);


  const handleGenerate = useCallback(() => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate a lesson plan.');
      return;
    }
    setError(null);
    setIsQuestionModalOpen(true);
  }, [topic]);
  
  const handleConfirmGeneration = useCallback(async () => {
    if (!credits || isCreditsLoading) return; // Wait for credits to load

    const canGenerate = creditSystemMode === 'simple'
        ? credits.shared >= credits.costs.lessonPlan
        : credits.lessonPlan.remaining > 0;

    if (!canGenerate && !isDevMode) {
        const message = creditSystemMode === 'simple'
            ? `You need ${credits.costs.lessonPlan} credits. Credits reset daily.`
            : `You have used your ${credits.lessonPlan.total} daily lesson plan generations.`;
        setError(message);
        setIsQuestionModalOpen(false);
        return;
    }

    setIsQuestionModalOpen(false);
    setIsLoading(true);
    setIsSearchingSources(true);
    setError(null);
    setLessonPlan(null);
    setSources(null);
    startLoadingMessages();

    try {
      const plan = await generateLessonPlan(
          topic, 
          cefrLevel, 
          advancedInstructions, 
          passageLength, 
          numberOfQuestions, 
          exemplarPassage,
          exemplarQuestions,
          pedagogicalFocus,
          customVocabulary
      );
      deductCredits('lessonPlan');
      const newHistoryEntry: HistoryEntry = { lessonPlan: plan, sources: null };
      
      setLessonPlan(plan);
      setHistory(prev => [newHistoryEntry, ...prev]);
      setActiveHistoryIndex(0);
      
      setIsLoading(false);
      setIsInputCollapsed(true);
      stopLoadingMessages();
      clearAutoSave(); // Clear draft on successful generation

      findSourcesForPassage(plan.readingPassage)
        .then(foundSources => {
          setSources(foundSources);
          setHistory(prev => {
            const newHistory = [...prev];
            if (newHistory[0]) {
              newHistory[0].sources = foundSources;
            }
            return newHistory;
          });
        })
        .catch(sourceError => {
          console.error("Failed to fetch sources:", sourceError);
          setSources([]);
        })
        .finally(() => {
          setIsSearchingSources(false);
        });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setIsLoading(false);
      stopLoadingMessages();
      setIsSearchingSources(false);
    }
  }, [
    topic, cefrLevel, advancedInstructions, passageLength, numberOfQuestions, exemplarPassage, 
    exemplarQuestions, pedagogicalFocus, customVocabulary, clearAutoSave, credits, deductCredits, creditSystemMode, isCreditsLoading, isDevMode
  ]);

  const handleSave = useCallback(() => {
    if (lessonPlan) {
      const dataToSave = {
        topic,
        cefrLevel,
        passageLength,
        advancedInstructions,
        exemplarPassage,
        exemplarQuestions,
        pedagogicalFocus,
        customVocabulary,
        numberOfQuestions,
        lessonPlan,
        sources,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_LESSON, JSON.stringify(dataToSave));
      setSavedLessonExists(true);
      clearAutoSave();
    }
  }, [lessonPlan, sources, topic, cefrLevel, passageLength, advancedInstructions, exemplarPassage, exemplarQuestions, pedagogicalFocus, customVocabulary, numberOfQuestions, clearAutoSave]);

  const handleLoad = useCallback(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_LESSON);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setTopic(parsedData.topic || '');
        setCefrLevel(parsedData.cefrLevel || 'B1');
        setPassageLength(parsedData.passageLength || 500);
        setAdvancedInstructions(parsedData.advancedInstructions || '');
        setExemplarPassage(parsedData.exemplarPassage || '');
        setExemplarQuestions(parsedData.exemplarQuestions || '');
        setPedagogicalFocus(parsedData.pedagogicalFocus || '');
        setCustomVocabulary(parsedData.customVocabulary || '');
        setNumberOfQuestions(parsedData.numberOfQuestions || 6);
        setLessonPlan(parsedData.lessonPlan);
        setSources(parsedData.sources || null);
        setError(null);
        setIsInputCollapsed(true);
        clearAutoSave();
        
        const newHistoryEntry = { lessonPlan: parsedData.lessonPlan, sources: parsedData.sources || null };
        setHistory([newHistoryEntry]);
        setActiveHistoryIndex(0);

      } catch (e) {
        setError('Could not load the saved lesson plan. It might be corrupted.');
        localStorage.removeItem(LOCAL_STORAGE_KEY_LESSON);
        setSavedLessonExists(false);
      }
    }
  }, [clearAutoSave]);
  
  const handleRestoreDraft = useCallback(() => {
    if (!draftToRestore) return;
    setTopic(draftToRestore.topic || '');
    setCefrLevel(draftToRestore.cefrLevel || 'B1');
    setPassageLength(draftToRestore.passageLength || 500);
    setAdvancedInstructions(draftToRestore.advancedInstructions || '');
    setExemplarPassage(draftToRestore.exemplarPassage || '');
    setExemplarQuestions(draftToRestore.exemplarQuestions || '');
    setPedagogicalFocus(draftToRestore.pedagogicalFocus || '');
    setCustomVocabulary(draftToRestore.customVocabulary || '');
    setNumberOfQuestions(draftToRestore.numberOfQuestions || 6);
    setDraftToRestore(null);
  }, [draftToRestore]);

  const handleDiscardDraft = useCallback(() => {
    clearAutoSave();
    setDraftToRestore(null);
  }, [clearAutoSave]);

  const handleSelectHistory = useCallback((index: number) => {
    const selectedEntry = history[index];
    if (selectedEntry) {
      setLessonPlan(selectedEntry.lessonPlan);
      setSources(selectedEntry.sources);
      setActiveHistoryIndex(index);
      setIsInputCollapsed(true);
    }
  }, [history]);

  const handleStartLessonTest = useCallback(() => {
    setLessonUserAnswers({});
    setLessonGradingResults(null);
    setIsLessonTestActive(true);
  }, []);

  const handleGradeLesson = useCallback(async (userAnswers: UserAnswers) => {
      if (!lessonPlan) return;
      
      setIsLessonGrading(true);
      const newGradingResults: GradingResults = {};

      const gradingPromises = lessonPlan.comprehensionQuestions.map(async (q, index): Promise<[number, GradingResult]> => {
          const questionNumber = index + 1;
          const userAnswer = userAnswers[questionNumber] || '';
          let result: 'correct' | 'incorrect';

          if (q.type === 'short-answer') {
              const grade = await gradeOpenEndedAnswer(q.question, q.answer, userAnswer);
              result = grade === 'Correct' ? 'correct' : 'incorrect';
          } else {
              result = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 'correct' : 'incorrect';
          }

          return [questionNumber, { result, correctAnswer: q.answer, userAnswer }];
      });
      
      const results = await Promise.all(gradingPromises);
      results.forEach(([qNum, grade]) => {
          newGradingResults[qNum] = grade;
      });

      setLessonGradingResults(newGradingResults);
      setIsLessonGrading(false);
  }, [lessonPlan]);


  const renderDesignerMode = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      { !isInputCollapsed && (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <InputForm
            topic={topic}
            setTopic={setTopic}
            cefrLevel={cefrLevel}
            setCefrLevel={setCefrLevel}
            advancedInstructions={advancedInstructions}
            setAdvancedInstructions={setAdvancedInstructions}
            exemplarPassage={exemplarPassage}
            setExemplarPassage={setExemplarPassage}
            exemplarQuestions={exemplarQuestions}
            setExemplarQuestions={setExemplarQuestions}
            pedagogicalFocus={pedagogicalFocus}
            setPedagogicalFocus={setPedagogicalFocus}
            customVocabulary={customVocabulary}
            setCustomVocabulary={setCustomVocabulary}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            onLoad={handleLoad}
            savedLessonExists={savedLessonExists}
            draftToRestore={draftToRestore}
            onRestoreDraft={handleRestoreDraft}
            onDiscardDraft={handleDiscardDraft}
            credits={credits}
            isCreditsLoading={isCreditsLoading}
            onActivateDevMode={handleToggleDevMode}
            isDevMode={isDevMode}
          />
        </div>
      )}

      <div className={isInputCollapsed && lessonPlan ? "md:col-span-2" : "md:col-span-1"}>
        { isInputCollapsed && lessonPlan && (
          <div className="mb-6 bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <CollapsedInput
                onExpand={() => setIsInputCollapsed(false)}
                onLoad={handleLoad}
                savedLessonExists={savedLessonExists}
              />
          </div>
        )}
         <OutputDisplay
            lessonPlan={lessonPlan}
            sources={sources}
            isLoading={isLoading}
            isSearchingSources={isSearchingSources}
            error={error}
            loadingMessage={loadingMessage}
            onSave={handleSave}
            userRole={userRole}
            onExpandPassage={() => setIsPassageExpanded(true)}
            onStartTest={handleStartLessonTest}
            isDevMode={isDevMode}
            creditSystemMode={creditSystemMode}
            setCreditSystemMode={setCreditSystemMode}
            onToggleDevMode={handleToggleDevMode}
          />
      </div>
    </div>
  );

  const renderExamMode = () => (
    <ExamGenerator
      credits={credits}
      isCreditsLoading={isCreditsLoading}
      deductCredits={deductCredits}
      isDevMode={isDevMode}
    />
  );


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {togglingDevMode && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm">
          <p className="text-2xl font-bold text-white animate-pulse">Dev Mode Toggled. Reloading...</p>
        </div>
      )}
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        userRole={userRole}
        setUserRole={setUserRole}
        history={history}
        activeHistoryIndex={activeHistoryIndex}
        onSelectHistory={handleSelectHistory}
        appMode={appMode}
        setAppMode={setAppMode}
        isDevMode={isDevMode}
      />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appMode === 'designer' ? renderDesignerMode() : renderExamMode()}
      </main>
      <footer className="text-center py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Made by Yasin İbrahim Çiçek
        </p>
      </footer>

      {appMode === 'designer' && (
        <>
          <QuestionCustomizationModal
            isOpen={isQuestionModalOpen}
            onClose={() => setIsQuestionModalOpen(false)}
            onConfirm={handleConfirmGeneration}
            passageLength={passageLength}
            setPassageLength={setPassageLength}
            numberOfQuestions={numberOfQuestions}
            setNumberOfQuestions={setNumberOfQuestions}
            maxQuestions={maxQuestions}
          />

          <PassageViewerModal
            isOpen={isPassageExpanded}
            onClose={() => setIsPassageExpanded(false)}
            lessonPlan={lessonPlan}
          />

          {isLessonTestActive && lessonPlan && (
            <InteractiveLessonTest 
              lessonPlan={lessonPlan}
              userAnswers={lessonUserAnswers}
              onAnswerChange={(qNum, ans) => setLessonUserAnswers(prev => ({...prev, [qNum]: ans}))}
              gradingResults={lessonGradingResults}
              isGrading={isLessonGrading}
              onGrade={() => handleGradeLesson(lessonUserAnswers)}
              onQuit={() => setIsLessonTestActive(false)}
            />
          )}
        </>
      )}

    </div>
  );
};

export default App;