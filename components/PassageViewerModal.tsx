import React, { useMemo } from 'react';
import { jsPDF } from 'jspdf';
import type { LessonPlan, ComprehensionQuestion } from '../types';
import CollapseIcon from './icons/CollapseIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import PdfIcon from './icons/PdfIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';

interface PassageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonPlan: LessonPlan | null;
}

const PassageViewerModal: React.FC<PassageViewerModalProps> = ({ isOpen, onClose, lessonPlan }) => {
  if (!isOpen || !lessonPlan) return null;

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
  
  const highlightedPassage = (() => {
    const { readingPassage, keyVocabulary } = lessonPlan;
    if (!keyVocabulary || keyVocabulary.length === 0) {
      return <p className="whitespace-pre-wrap">{readingPassage}</p>;
    }
    const wordsToHighlight = keyVocabulary.map(v => v.word);
    const escapedWords = wordsToHighlight.map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    const parts = readingPassage.split(regex);
    return (
        <div className="whitespace-pre-wrap">
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
  })();

  const handleDownloadPdf = () => {
    if (!lessonPlan) return;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let yPos = margin;

    const addTextWithWrap = (text: string, options: { size?: number, style?: 'normal' | 'bold' | 'italic', color?: string | number, isListItem?: boolean } = {}) => {
      const { size = 11, style = 'normal', color = '#000000', isListItem = false } = options;
      
      doc.setFont('Helvetica', style);
      doc.setFontSize(size);
       if (typeof color === 'string') doc.setTextColor(color); else doc.setTextColor(Number(color));

      const prefix = isListItem ? "•  " : "";
      const splitText = doc.splitTextToSize(prefix + text, maxLineWidth - (isListItem ? 3 : 0));
      const textBlockHeight = doc.getTextDimensions(splitText).h;

      if (yPos + textBlockHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.text(splitText, margin + (isListItem ? 3 : 0), yPos);
      yPos += textBlockHeight + (size / 3.5);
    };
    
    addTextWithWrap(lessonPlan.title, { size: 20, style: 'bold' });
    yPos += 2;
    
    addTextWithWrap(`CEFR Level: ${lessonPlan.cefrLevel}`, { size: 12, style: 'italic', color: '#555555' });
    yPos += 8;
    
    addTextWithWrap("Reading Passage", { size: 16, style: 'bold' });
    yPos -= 2;

    const addStyledParagraph = (paragraph: string) => {
        if (!paragraph.trim()) return;

        const { keyVocabulary } = lessonPlan;
        const wordsToHighlight = keyVocabulary.map(v => v.word);
        const escapedWords = wordsToHighlight.map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const regex = new RegExp(`(\\b(?:${escapedWords.join('|')})\\b)`, 'gi');

        const parts = paragraph.split(regex).filter(p => p);

        const fontSize = 11;
        doc.setFontSize(fontSize);
        const lineHeight = doc.getTextDimensions('M').h * 1.15;
        
        let currentX = margin;

        if (yPos + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }

        parts.forEach(part => {
            const isHighlight = wordsToHighlight.some(w => w.toLowerCase() === part.toLowerCase());
            
            doc.setFont('Helvetica', isHighlight ? 'bold' : 'normal');
            doc.setTextColor(isHighlight ? '#003366' : '#000000');

            const words = part.split(/(\s+)/).filter(w => w.length > 0);

            words.forEach(word => {
                const wordWidth = doc.getStringUnitWidth(word) * fontSize / doc.internal.scaleFactor;
                
                if (currentX > margin && currentX + wordWidth > maxLineWidth) {
                    yPos += lineHeight;
                    currentX = margin;
                    if (yPos + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        yPos = margin;
                    }
                }

                doc.text(word, currentX, yPos, { flags: { underline: isHighlight } });
                currentX += wordWidth;
            });
        });

        doc.setTextColor('#000000');
        yPos += lineHeight;
    };
    
    lessonPlan.readingPassage.split('\n\n').forEach(p => addStyledParagraph(p.trim()));
    yPos += 10;

    addTextWithWrap("Comprehension Questions", { size: 16, style: 'bold' });
    yPos -= 2;

    const renderQuestions = (qs: ComprehensionQuestion[], title: string) => {
      if (!qs || qs.length === 0) return;
      addTextWithWrap(title, { size: 14, style: 'bold' });
      qs.forEach((q, i) => {
        addTextWithWrap(`${i + 1}. ${q.question}`, { size: 11 });
        if (q.type === 'multiple-choice' && q.options) {
          q.options.forEach((opt, j) => {
            const isAnswer = opt === q.answer;
            addTextWithWrap(`${String.fromCharCode(97 + j)}) ${opt}`, { size: 11, style: isAnswer ? 'bold' : 'normal', color: isAnswer ? '#003366' : '#000000' });
          });
        }
         addTextWithWrap(`Answer Key: ${q.answer}`, { size: 11, style: 'italic', color: '#003366' });
         yPos += 4;
      });
      yPos += 5;
    };
    
    renderQuestions(categorizedQuestions?.['true-false'], "True / False");
    renderQuestions(categorizedQuestions?.['multiple-choice'], "Multiple Choice");
    renderQuestions(categorizedQuestions?.['short-answer'], "Short Answer");

    if (lessonPlan.writingPrompts && lessonPlan.writingPrompts.length > 0) {
        yPos += 5;
        addTextWithWrap("Writing Prompts", { size: 16, style: 'bold' });
         yPos -= 2;
        lessonPlan.writingPrompts.forEach(prompt => {
            addTextWithWrap(prompt, { size: 11, isListItem: true });
        });
    }


    doc.save(`${lessonPlan.title.replace(/[\s\W]+/g, '_')}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg z-50 flex justify-center p-4 sm:p-6 lg:p-8"
      aria-labelledby="passage-viewer-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col">
        <header className="flex-shrink-0 p-4 sm:p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
          <div>
             <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-boun-blue dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                {lessonPlan.cefrLevel}
            </span>
            <h2 id="passage-viewer-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {lessonPlan.title}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              title="Download as PDF"
              aria-label="Download as PDF"
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
              <PdfIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              title="Collapse View"
              aria-label="Collapse View"
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-boun-light-blue"
            >
              <CollapseIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        
        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
            <article className="prose prose-lg dark:prose-invert max-w-none">
                 <div className="flex items-center mb-4">
                    <span className="text-boun-light-blue dark:text-blue-400"><BookOpenIcon className="w-7 h-7" /></span>
                    <h3 className="ml-3 text-2xl font-semibold text-slate-800 dark:text-slate-200 not-prose">Reading Passage</h3>
                </div>
                {highlightedPassage}

                <hr className="my-8" />
                
                <div className="flex items-center mb-4">
                    <span className="text-boun-light-blue dark:text-blue-400"><QuestionMarkCircleIcon className="w-7 h-7" /></span>
                    <h3 className="ml-3 text-2xl font-semibold text-slate-800 dark:text-slate-200 not-prose">Comprehension Questions</h3>
                </div>
                <div className="space-y-6">
                    {categorizedQuestions?.['true-false'] && (
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 not-prose">True / False</h4>
                            <ol className="list-decimal list-inside space-y-4">
                                {categorizedQuestions['true-false'].map((q, i) => <QuestionItem key={`tf-${i}`} question={q} />)}
                            </ol>
                        </div>
                    )}
                     {categorizedQuestions?.['multiple-choice'] && (
                         <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 not-prose">Multiple Choice</h4>
                             <ol className="list-decimal list-inside space-y-4">
                                {categorizedQuestions['multiple-choice'].map((q, i) => <QuestionItem key={`mc-${i}`} question={q} />)}
                            </ol>
                        </div>
                    )}
                    {categorizedQuestions?.['short-answer'] && (
                         <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 not-prose">Short Answer</h4>
                             <ol className="list-decimal list-inside space-y-4">
                                {categorizedQuestions['short-answer'].map((q, i) => <QuestionItem key={`sa-${i}`} question={q} />)}
                            </ol>
                        </div>
                    )}
                </div>

                {lessonPlan.writingPrompts && lessonPlan.writingPrompts.length > 0 && (
                  <>
                    <hr className="my-8" />
                    <div className="flex items-center mb-4">
                        <span className="text-boun-light-blue dark:text-blue-400"><PencilSquareIcon className="w-7 h-7" /></span>
                        <h3 className="ml-3 text-2xl font-semibold text-slate-800 dark:text-slate-200 not-prose">Writing Prompts</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2">
                        {lessonPlan.writingPrompts.map((prompt, i) => (
                            <li key={i}>{prompt}</li>
                        ))}
                    </ul>
                  </>
                )}
            </article>
        </div>
      </div>
    </div>
  );
};


const QuestionItem: React.FC<{question: ComprehensionQuestion}> = ({ question }) => (
    <li>
        <span>{question.question}</span>
        {question.type === 'multiple-choice' && question.options && (
            <ul className="pl-6 mt-2 space-y-1 text-base list-[lower-alpha]">
                {question.options.map((opt, i) => (
                    <li key={i} className={opt === question.answer ? 'font-semibold text-boun-blue dark:text-blue-400' : ''}>
                        {opt}
                    </li>
                ))}
            </ul>
        )}
        <p className="mt-2 pl-1 text-base">
            <strong className="font-semibold text-slate-500 dark:text-slate-400">Answer Key: </strong>
            <span className="text-boun-blue dark:text-blue-400 italic">{question.answer}</span>
        </p>
    </li>
);

export default PassageViewerModal;
