import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import type { Language, BueptReadingSection, UserAnswers, GradingResults, GradingResult } from '../types';
import { UI_TEXT } from '../translations';
import Loader from './Loader';
import InteractiveReadingSection from './InteractiveReadingSection';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import PencilIcon from './icons/PencilIcon';
import PdfIcon from './icons/PdfIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { gradeOpenEndedAnswer, generateBueptSection } from '../services/geminiService';

interface ExamGeneratorProps {
  language: Language;
}

type View = 'selection' | 'choice' | 'test';
type GeneratedSectionData = {
    key: 'reading1' | 'reading2';
    section: BueptReadingSection;
};

const ExamGenerator: React.FC<ExamGeneratorProps> = ({ language }) => {
  const [view, setView] = useState<View>('selection');
  const [isLoading, setIsLoading] = useState<'reading1' | 'reading2' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [generatedSectionData, setGeneratedSectionData] = useState<GeneratedSectionData | null>(null);
  
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [gradingResults, setGradingResults] = useState<GradingResults | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);

  const handleGenerateSection = async (sectionKey: 'reading1' | 'reading2') => {
    setIsLoading(sectionKey);
    setError(null);
    try {
      const sectionData = await generateBueptSection(sectionKey);
      setGeneratedSectionData({ key: sectionKey, section: sectionData });
      setUserAnswers({}); // Reset answers
      setGradingResults(null); // Reset results
      setView('choice');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate BUEPT section. ${errorMessage}`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleGradeSection = async () => {
    if (!generatedSectionData) return;
    
    setIsGrading(true);
    const newGradingResults: GradingResults = {};

    const gradingPromises = generatedSectionData.section.questions.map(async (q): Promise<[number, GradingResult]> => {
      const userAnswer = userAnswers[q.questionNumber] || '';
      let result: 'correct' | 'incorrect';

      if (q.options) { // Multiple Choice
        result = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 'correct' : 'incorrect';
      } else { // Open Ended
        const grade = await gradeOpenEndedAnswer(q.questionText, q.answer, userAnswer);
        result = grade === 'Correct' ? 'correct' : 'incorrect';
      }

      return [q.questionNumber, { result, correctAnswer: q.answer, userAnswer }];
    });
    
    const results = await Promise.all(gradingPromises);
    results.forEach(([qNum, grade]) => {
      newGradingResults[qNum] = grade;
    });

    setGradingResults(newGradingResults);
    setIsGrading(false);
  };

  const handleDownloadPracticePdf = () => {
    if (!generatedSectionData) return;
    const { section } = generatedSectionData;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let yPos = margin;

    const addTextWithWrap = (text: string, options: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: string | number } = {}) => {
        const { size = 11, style = 'normal', color = '#000000' } = options;

        doc.setFont('Helvetica', style);
        doc.setFontSize(size);
        if (typeof color === 'string') {
            doc.setTextColor(color);
        } else {
            doc.setTextColor(color);
        }

        const lines = doc.splitTextToSize(text, maxLineWidth);
        // A more stable way to get line height for current font settings
        const lineHeight = doc.getTextDimensions('M').h * 1.15; 

        lines.forEach((line: string) => {
            if (yPos + lineHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                
                // Add a header to subsequent pages for clarity
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`${section.title} (cont.)`, margin, margin / 2);
                doc.setTextColor(0); // reset color
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
        yPos += size / 4; // Add a small gap after each block of text
    };

    // --- PDF Content ---

    // Title
    addTextWithWrap(section.title, { size: 18, style: 'bold' });
    yPos += 5;

    // Passage Title
    addTextWithWrap(UI_TEXT.passageTitle[language], { size: 14, style: 'bold' });
    yPos += 2;

    // Passage Content
    const passageParts = section.passage.split(/(\[P\d+\])/).filter(part => part.trim());
    passageParts.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart.match(/^\[P\d+\]/)) {
            addTextWithWrap(trimmedPart, { size: 11, style: 'bold', color: '#333333' });
        } else {
            // Split individual paragraphs by newline to preserve formatting
            const subParagraphs = trimmedPart.split('\n').filter(p => p.trim());
            subParagraphs.forEach(p => {
                addTextWithWrap(p, { size: 11, style: 'normal' });
                yPos += 2; // Add a bit of space between paragraphs
            });
        }
    });
    yPos += 8;

    // Questions Title
    addTextWithWrap(UI_TEXT.questionsTitle[language], { size: 14, style: 'bold' });
    yPos += 2;

    // Questions Content
    section.questions.forEach(q => {
        addTextWithWrap(`${q.questionNumber}. ${q.questionText}`, { size: 11, style: 'bold' });

        if (q.additionalPassage) {
            addTextWithWrap(`"${q.additionalPassage}"`, { size: 10, style: 'italic', color: '#555555' });
        }
        if (q.paragraphWithMarkers) {
             addTextWithWrap(q.paragraphWithMarkers, { size: 10, style: 'italic', color: '#555555' });
        }
        if (q.type === 'paragraph-matching' && q.matchOptions) {
            q.matchOptions.forEach((opt, i) => {
                addTextWithWrap(`${String.fromCharCode(65 + i)}) ${opt}`, { size: 10, style: 'italic' });
            });
        }
        yPos += 1;

        if (q.options) {
            q.options.forEach((opt, i) => {
                addTextWithWrap(`${String.fromCharCode(65 + i)}) ${opt}`, { size: 11 });
            });
        }
        yPos += 6; // Space between questions
    });

    doc.save(`${section.title.replace(/[\s\W]+/g, '_')}_Practice.pdf`);
  };

  const renderSelectionView = () => (
     <div className="p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
        <ClipboardCheckIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{UI_TEXT.bueptGeneratorTitle[language]}</h2>
        <p className="mt-2 max-w-xl mx-auto text-slate-500 dark:text-slate-400">{UI_TEXT.bueptGeneratorSubtitle[language]}</p>
        
        {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 dark:text-red-200">{UI_TEXT.generationFailed[language]}</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between">
            <BookOpenIcon className="w-10 h-10 mx-auto text-boun-blue dark:text-blue-400" />
            <div className="my-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{UI_TEXT.bueptReading1Title[language]}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">45 {UI_TEXT.bueptMinutes[language]}</p>
            </div>
            <button
                onClick={() => handleGenerateSection('reading1')}
                disabled={!!isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading === 'reading1' ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                        {UI_TEXT.bueptGeneratingButton[language]}
                    </>
                ) : (
                    UI_TEXT.bueptGenerateReading1[language]
                )}
            </button>
          </div>
           <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between">
            <BookOpenIcon className="w-10 h-10 mx-auto text-boun-blue dark:text-blue-400" />
            <div className="my-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{UI_TEXT.bueptReading2Title[language]}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">50 {UI_TEXT.bueptMinutes[language]}</p>
            </div>
            <button
                onClick={() => handleGenerateSection('reading2')}
                disabled={!!isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
                 {isLoading === 'reading2' ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                        {UI_TEXT.bueptGeneratingButton[language]}
                    </>
                ) : (
                    UI_TEXT.bueptGenerateReading2[language]
                )}
            </button>
          </div>
        </div>
      </div>
  );

  const renderChoiceView = () => {
    if (!generatedSectionData) return null;
    return (
      <div className="p-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
        <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{UI_TEXT.bueptPracticeReadyTitle[language]}</h2>
        <p className="mt-2 max-w-xl mx-auto text-slate-500 dark:text-slate-400">
          {generatedSectionData.section.title}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
           <button
                onClick={() => setView('test')}
                className="flex-grow flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-boun-light-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              {UI_TEXT.bueptTakeTestOnline[language]}
            </button>
             <button
                onClick={handleDownloadPracticePdf}
                className="flex-grow flex justify-center items-center py-3 px-6 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
              <PdfIcon className="w-5 h-5 mr-2" />
              {UI_TEXT.bueptDownloadPdf[language]}
            </button>
        </div>
        <button
            onClick={() => { setView('selection'); setGeneratedSectionData(null); }}
            className="mt-6 flex items-center mx-auto text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-boun-blue dark:hover:text-blue-400"
        >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            {UI_TEXT.bueptBackToGeneration[language]}
        </button>
      </div>
    );
  };
  
  const renderTestView = () => {
    if (!generatedSectionData) return null;
    const { key, section } = generatedSectionData;
    const title = key === 'reading1' ? UI_TEXT.bueptReading1Title[language] : UI_TEXT.bueptReading2Title[language];
    const time = key === 'reading1' ? 45 : 50;

    return (
       <InteractiveReadingSection
        section={section}
        sectionTitle={title}
        time={time}
        language={language}
        userAnswers={userAnswers}
        onAnswerChange={(qNum, ans) => setUserAnswers(prev => ({...prev, [qNum]: ans}))}
        gradingResults={gradingResults}
        isGrading={isGrading}
        onGrade={handleGradeSection}
        onBack={() => setView('choice')}
      />
    );
  };
  
  switch(view) {
    case 'selection': return renderSelectionView();
    case 'choice': return renderChoiceView();
    case 'test': return renderTestView();
    default: return renderSelectionView();
  }
};

export default ExamGenerator;