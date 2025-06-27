
import React from 'react';
import { StarIcon, XIcon } from './icons';
import { PREMIUM_PRICE_INR } from '../constants';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full transform transition-all animate-fadeInScaleUp">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-3 sm:mb-4">
            <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mr-2 sm:mr-3" />
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 leading-tight">Unlock Learnova Premium!</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300">
            <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
          You've reached your free query limit or are trying to access a premium feature. Upgrade to Learnova Premium for:
        </p>
        
        <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8 text-sm sm:text-base text-slate-700">
          <li className="flex items-center"><StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-2.5 flex-shrink-0" /> Unlimited AI Queries</li>
          <li className="flex items-center"><StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-2.5 flex-shrink-0" /> Export Answers to PDF</li>
          <li className="flex items-center"><StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-2.5 flex-shrink-0" /> Priority Support (Coming Soon)</li>
          <li className="flex items-center"><StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-2.5 flex-shrink-0" /> Ad-Free Experience (Coming Soon)</li>
        </ul>
        
        <button
          onClick={onUpgrade}
          className="w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3.5 text-base sm:text-lg font-medium text-white bg-gradient-to-r from-brand-DEFAULT to-purple-600 hover:from-brand-dark hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-all duration-150"
        >
          Upgrade Now for ₹{PREMIUM_PRICE_INR}/month
        </button>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-3 sm:mt-4 text-center">
          This is a simulated upgrade. No actual payment will be processed.
        </p>
      </div>
      {/* Removed <style jsx global> block */}
    </div>
  );
};
