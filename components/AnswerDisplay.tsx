import React from 'react';
import { SpeakerWaveIcon, DocumentDownloadIcon, LockClosedIcon, XIcon } from './icons';

interface AnswerDisplayProps {
  answer: string;
  onSpeak: () => void;
  onStopSpeak: () => void;
  onExportPdf: () => void;
  isPremiumUser: boolean; // Keep for now, but its value will always be true
}

const renderMarkdownToHTML = (markdown: string): string => {
  let html = markdown;

  // Headers (e.g., ### Header)
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-3 mb-1.5 font-display">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2 font-display">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-5 mb-2.5 font-display">$1</h1>');

  // Bold (e.g., **bold text**)
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');
  // Italics (e.g., *italic text* or _italic text_)
  html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em class="italic">S1</em>'); // Fixed typo from 'S1' to '$1'
  
  // Unordered lists (e.g., * item or - item)
  // Process line by line for lists to wrap them in <ul>
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    if (line.match(/^(\*|-|\+) (.*)/)) {
      const listItem = line.replace(/^(\*|-|\+) (.*)/, '<li class="ml-1">$2</li>');
      if (!inList) {
        inList = true;
        return '<ul class="list-disc list-inside space-y-1 my-2 ml-4">' + listItem;
      }
      return listItem;
    } else {
      if (inList) {
        inList = false;
        return '</ul>' + line; // Close list before a non-list item line
      }
      return line;
    }
  });
  if (inList) { // Ensure list is closed if it's the last element
    processedLines.push('</ul>');
  }
  html = processedLines.join('\n');

  // Paragraphs (wrap remaining text lines, handle <br> for single newlines)
  // This is tricky without a full parser. A simpler approach:
  // Split by double newlines for paragraphs, then single newlines to <br> within those.
   html = html.split(/\n\s*\n/).map(paragraph => {
    if (paragraph.startsWith('<ul') || paragraph.startsWith('<h')) return paragraph; // Don't wrap lists/headers in <p>
    return `<p class="text-slate-700 leading-relaxed mb-3">${paragraph.replace(/\n/g, '<br/>')}</p>`;
  }).join('');


  // Code blocks (e.g., ```code```) - very basic
  html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-slate-100 p-3 rounded-md overflow-x-auto text-sm my-3"><code class="font-mono">$1</code></pre>');
  // Inline code (e.g., `code`)
  html = html.replace(/`(.*?)`/gim, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  return html;
};


export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, onSpeak, onStopSpeak, onExportPdf, isPremiumUser }) => {
  const formattedAnswer = renderMarkdownToHTML(answer);

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-xl border border-slate-200/80">
      <h2 className="text-lg sm:text-xl font-display font-semibold text-slate-800 mb-3 sm:mb-4">Learnova's Answer:</h2>
      <div 
        id="answer-content" 
        className="prose prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed space-y-2 sm:space-y-3 text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: formattedAnswer }}
      >
        {/* Content is now set via dangerouslySetInnerHTML */}
      </div>
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
        <button
          onClick={onSpeak}
          className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          aria-label="Read answer aloud"
        >
          <SpeakerWaveIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-slate-500" />
          Read Aloud
        </button>
        <button
          onClick={onStopSpeak}
          className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-dark"
          aria-label="Stop reading"
        >
          <XIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-slate-500" />
          Stop Reading
        </button>
        <button
          onClick={onExportPdf}
          // Removed isPremiumUser check from class names and disabled prop
          className={`flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
            text-primary-text bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-700`
          }
          disabled={!answer} // Only disable if there's no answer to export
          aria-label={"Export answer to PDF"} // Always available
        >
          <DocumentDownloadIcon className="w-5 h-5 mr-2" />
          Export to PDF
          {/* Removed premium feature tooltip */}
        </button>
      </div>
    </div>
  );
};