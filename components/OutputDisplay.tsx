import React, { useMemo } from 'react';
import { jsPDF } from 'jspdf';
import type { LessonPlan, Source, Language, ComprehensionQuestion, UserRole } from '../types';
import Loader from './Loader';
import Feedback from './Feedback';
import SaveIcon from './icons/SaveIcon';
import PrintIcon from './icons/PrintIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ListIcon from './icons/ListIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import LinkIcon from './icons/LinkIcon';
import ExpandIcon from './icons/ExpandIcon';
import PencilIcon from './icons/PencilIcon';
import PdfIcon from './icons/PdfIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { UI_TEXT } from '../translations';

interface OutputDisplayProps {
  lessonPlan: LessonPlan | null;
  sources: Source[] | null;
  isLoading: boolean;
  isSearchingSources: boolean;
  error: string | null;
  loadingMessage: string;
  onSave: () => void;
  language: Language;
  userRole: UserRole;
  onExpandPassage: () => void;
  onStartTest: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  lessonPlan,
  sources,
  isLoading,
  isSearchingSources,
  error,
  loadingMessage,
  onSave,
  language,
  userRole,
  onExpandPassage,
  onStartTest,
}) => {

  const categorizedQuestions = useMemo(() => {
    if (!lessonPlan) return null;
    return lessonPlan.comprehensionQuestions.reduce((acc, q) => {
      if (!acc[q.type]) {
        acc[q.type] = [];
      }
      acc[q.type].push(q);
      return acc;
    }, {} as Record<ComprehensionQuestion['type'], ComprehensionQuestion[]>);
  }, [lessonPlan]);

  const highlightedPassage = useMemo(() => {
    if (!lessonPlan) return null;
    const { readingPassage, keyVocabulary } = lessonPlan;
    if (!keyVocabulary || keyVocabulary.length === 0) {
      return <p className="prose prose-slate dark:prose-invert print:prose-sm whitespace-pre-wrap">{readingPassage}</p>;
    }

    const wordsToHighlight = keyVocabulary.map(v => v.word);
    const escapedWords = wordsToHighlight.map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    
    const parts = readingPassage.split(regex);
    
    return (
        <div className="prose prose-slate dark:prose-invert print:prose-sm whitespace-pre-wrap">
            {parts.map((part, i) => {
                const isWordToHighlight = i % 2 === 1;
                if (isWordToHighlight) {
                    return (
                        <strong key={i} className="font-semibold text-boun-blue dark:text-blue-400 underline decoration-boun-light-blue/70 dark:decoration-blue-500/70 decoration-2 underline-offset-2">
                            {part}
                        </strong>
                    );
                }
                return part;
            })}
        </div>
    );
  }, [lessonPlan]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPracticePdf = () => {
    if (!lessonPlan) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;
    
    const addTextWithWrap = (text: string, options: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: string | number } = {}) => {
        const { size = 11, style = 'normal', color = '#000000' } = options;
        const maxLineWidth = pageWidth - margin * 2;
        doc.setFont('Helvetica', style);
        doc.setFontSize(size);
        if (typeof color === 'string') doc.setTextColor(color); else doc.setTextColor(color);
        const lines = doc.splitTextToSize(text, maxLineWidth);
        const lineHeight = doc.getTextDimensions('M').h * 1.15; 
        lines.forEach((line: string) => {
            if (yPos + lineHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += size / 4;
    };
    
    addTextWithWrap(lessonPlan.title, { size: 18, style: 'bold' });
    yPos += 5;
    addTextWithWrap(UI_TEXT.passageTitle[language], { size: 14, style: 'bold' });
    lessonPlan.readingPassage.split('\n').filter(p => p.trim()).forEach(p => addTextWithWrap(p));
    yPos += 8;
    addTextWithWrap(UI_TEXT.questionsTitle[language], { size: 14, style: 'bold' });
    lessonPlan.comprehensionQuestions.forEach((q, i) => {
        addTextWithWrap(`${i + 1}. ${q.question}`, { size: 11, style: 'bold' });
        if (q.type === 'multiple-choice' && q.options) {
            q.options.forEach((opt, j) => addTextWithWrap(`${String.fromCharCode(65 + j)}) ${opt}`));
        }
        if (q.type === 'true-false') {
            addTextWithWrap('True / False');
        }
        yPos += 6;
    });
    doc.save(`${lessonPlan.title.replace(/[\s\W]+/g, '_')}_Practice.pdf`);
  };

  if (isLoading) {
    return <Loader message={loadingMessage} language={language} />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">{UI_TEXT.generationFailed[language]}</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
        <BookOpenIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
        <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">{UI_TEXT.outputPlaceholderTitle[language]}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{UI_TEXT.outputPlaceholderSubtitle[language]}</p>
      </div>
    );
  }

  // STUDENT VIEW - CHOICE SCREEN
  if (userRole === 'student') {
    return (
       <div className="p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
        <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{UI_TEXT.studentChoiceTitle[language]}</h2>
        <p className="mt-2 max-w-xl mx-auto text-slate-500 dark:text-slate-400">
          {lessonPlan.title}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
           <button
                onClick={onStartTest}
                className="flex-grow flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              {UI_TEXT.studentChoiceTakeTest[language]}
            </button>
             <button
                onClick={handleDownloadPracticePdf}
                className="flex-grow flex justify-center items-center py-3 px-6 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
              <PdfIcon className="w-5 h-5 mr-2" />
              {UI_TEXT.studentChoiceDownloadPdf[language]}
            </button>
        </div>
      </div>
    );
  }
  
  // INSTRUCTOR VIEW - FULL LESSON PLAN
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex justify-between items-start">
        <div>
          <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-boun-blue dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            {lessonPlan.cefrLevel}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{lessonPlan.title}</h2>
        </div>
        <div className="flex space-x-2 print:hidden">
          <button
            onClick={onSave}
            title={UI_TEXT.saveTooltip[language]}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
          >
            <SaveIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            title={UI_TEXT.printTooltip[language]}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
          >
            <PrintIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <Section 
              icon={<BookOpenIcon className="w-6 h-6" />} 
              title={UI_TEXT.passageTitle[language]}
              actionButton={
                <button
                  onClick={onExpandPassage}
                  title={UI_TEXT.expandTooltip[language]}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue print:hidden"
                >
                  <ExpandIcon className="w-5 h-5" />
                </button>
              }
            >
              <div className="relative h-96 overflow-hidden">
                {highlightedPassage}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-slate-800/50 pointer-events-none" aria-hidden="true"></div>
              </div>
            </Section>
          </Card>
          <Card>
            <Section icon={<QuestionMarkCircleIcon className="w-6 h-6" />} title={UI_TEXT.questionsTitle[language]}>
              <div className="space-y-6">
                {categorizedQuestions?.['true-false'] && (
                  <QuestionCategory title={UI_TEXT.questionTrueFalseTitle[language]}>
                    {categorizedQuestions['true-false'].map((q, i) => <QuestionItem key={`tf-${i}`} question={q} language={language}/>)}
                  </QuestionCategory>
                )}
                {categorizedQuestions?.['multiple-choice'] && (
                  <QuestionCategory title={UI_TEXT.questionMultipleChoiceTitle[language]}>
                    {categorizedQuestions['multiple-choice'].map((q, i) => <QuestionItem key={`mc-${i}`} question={q} language={language}/>)}
                  </QuestionCategory>
                )}
                {categorizedQuestions?.['short-answer'] && (
                   <QuestionCategory title={UI_TEXT.questionShortAnswerTitle[language]}>
                    {categorizedQuestions['short-answer'].map((q, i) => <QuestionItem key={`sa-${i}`} question={q} language={language}/>)}
                  </QuestionCategory>
                )}
              </div>
            </Section>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <Section icon={<AcademicCapIcon className="w-6 h-6" />} title={UI_TEXT.rationaleTitle[language]}>
              <p className="prose prose-slate dark:prose-invert print:prose-sm">{lessonPlan.pedagogicalRationale}</p>
            </Section>
            <hr className="my-6 border-slate-200 dark:border-slate-700" />
            <Section icon={<ListIcon className="w-6 h-6" />} title={UI_TEXT.vocabularyTitle[language]}>
              <ul className="space-y-4">
                {lessonPlan.keyVocabulary.map((item, index) => (
                  <li key={index}>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.word} <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">({item.partOfSpeech})</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{item.definition}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 italic">"{item.exampleSentence}"</p>
                  </li>
                ))}
              </ul>
            </Section>
          </Card>
          
          <Card>
            <Section icon={<LinkIcon className="w-6 h-6" />} title={UI_TEXT.sourcesTitle[language]}>
              {isSearchingSources ? (
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                      <span>{UI_TEXT.searchingSources[language]}</span>
                  </div>
              ) : sources && sources.length > 0 ? (
                  <ul className="space-y-2">
                      {sources.map((source, index) => (
                          <li key={index}>
                              <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-boun-blue dark:text-blue-400 hover:underline break-all">
                                  {source.title || source.uri}
                              </a>
                          </li>
                      ))}
                  </ul>
              ) : sources ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{UI_TEXT.noSourcesFound[language]}</p>
              ) : null}
            </Section>
          </Card>
        </div>
      </div>
      
      <div className="print:hidden">
        <Feedback language={language} />
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
    {children}
  </div>
);

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children, actionButton }) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <span className="text-boun-light-blue dark:text-blue-400">{icon}</span>
        <h3 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      {actionButton}
    </div>
    <div>{children}</div>
  </section>
);

const QuestionCategory: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h4>
    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
      {children}
    </ol>
  </div>
);

const QuestionItem: React.FC<{question: ComprehensionQuestion; language: Language}> = ({ question, language }) => (
    <li>
        <span>{question.question}</span>
        {question.type === 'multiple-choice' && question.options && (
            <ul className="pl-6 mt-2 space-y-1 text-sm list-[lower-alpha]">
                {question.options.map((opt, i) => (
                    <li key={i} className={opt === question.answer ? 'font-semibold text-boun-blue dark:text-blue-400' : ''}>
                        {opt}
                    </li>
                ))}
            </ul>
        )}
        <p className="mt-2 pl-1 text-sm">
            <strong className="font-semibold text-slate-500 dark:text-slate-400">{UI_TEXT.answerKey[language]}: </strong>
            <span className="text-boun-blue dark:text-blue-400 italic">{question.answer}</span>
        </p>
    </li>
);

export default OutputDisplay;