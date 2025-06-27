
import React from 'react';
import { SUBJECTS } from '../constants';
import { Subject } from '../types';
import { XIcon, BookOpenIcon } from './icons'; // Added BookOpenIcon for consistency

export const Sidebar: React.FC<SidebarProps> = ({ selectedSubject, onSelectSubject, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-30 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <aside className={`fixed lg:static top-0 left-0 h-full bg-slate-800 text-white w-64 p-4 sm:p-5 space-y-4 sm:space-y-6 transform ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 lg:shadow-lg flex flex-col pt-20 lg:pt-5`}> {/* Responsive padding and spacing */}
        <div className="flex justify-between items-center lg:hidden mb-2">
           <div className="flex items-center text-lg sm:text-xl font-display font-semibold text-slate-100">
            <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 sm:mr-2 text-brand-light" /> 
            Learnova
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-light">
            <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <div className="hidden lg:flex items-center text-lg sm:text-xl font-display font-semibold text-slate-100 mb-2">
           Subjects
        </div>

        <nav className="flex-grow overflow-y-auto pr-1 -mr-1"> {/* Custom scrollbar styling might need this parent */}
          <ul className="space-y-1 sm:space-y-1.5">
            {SUBJECTS.map((subject) => (
              <li key={subject.id}>
                <button
                  onClick={() => {
                     onSelectSubject(subject);
                     if (isOpen) onClose(); 
                  }}
                  className={`w-full flex items-center px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-md text-left text-xs sm:text-sm font-medium transition-all duration-150 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-opacity-50
                    ${selectedSubject?.id === subject.id 
                      ? 'bg-brand text-white shadow-lg' 
                      : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                >
                  {subject.icon && React.cloneElement(subject.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0' })} {/* No cast needed if subject.icon is React.ReactElement */}
                  {subject.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-[10px] sm:text-xs">Learnova v1.0.0</p>
            <p className="text-xs text-slate-400 text-[10px] sm:text-xs">&copy; {new Date().getFullYear()} AI Study Helper</p>
        </div>
      </aside>
    </>
  );
};

interface SidebarProps {
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
  isOpen: boolean;
  onClose: () => void;
}
