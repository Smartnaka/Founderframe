import React from 'react';
import { AppStep } from '../types';
import { Lightbulb, TrendingUp, Presentation, Download } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
  completedSteps: AppStep[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick, completedSteps }) => {
  const steps = [
    { id: AppStep.IDEA, label: 'Ideation', icon: Lightbulb },
    { id: AppStep.INSIGHTS, label: 'Strategy', icon: TrendingUp },
    { id: AppStep.PITCH, label: 'Pitch Deck', icon: Presentation },
    { id: AppStep.EXPORT, label: 'Export', icon: Download },
  ];

  const getStepStatus = (stepId: AppStep) => {
    if (currentStep === stepId) return 'current';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 md:py-4 px-4 md:px-6 sticky top-0 z-10 no-print shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 mr-6 md:mr-0">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">F</div>
            <span className="font-bold text-slate-800 text-lg tracking-tight hidden md:inline">FounderFrame</span>
        </div>
        
        <nav aria-label="Progress" className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide w-full md:w-auto pb-1 md:pb-0">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <button
                key={step.id}
                onClick={() => completedSteps.includes(step.id) || status === 'current' ? onStepClick(step.id) : null}
                disabled={!(completedSteps.includes(step.id) || status === 'current')}
                className={`group flex items-center space-x-2 focus:outline-none transition-colors duration-200 flex-shrink-0
                  ${status === 'current' ? 'text-brand-600' : 
                    status === 'completed' ? 'text-slate-600 hover:text-slate-800' : 'text-slate-300 cursor-not-allowed'}`}
              >
                <div className={`
                  flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-colors
                  ${status === 'current' ? 'border-brand-600 bg-brand-50' : 
                    status === 'completed' ? 'border-slate-400 bg-slate-50' : 'border-slate-200'}
                `}>
                  <Icon size={14} className="md:w-4 md:h-4" />
                </div>
                <span className="font-medium text-xs md:text-sm whitespace-nowrap">{step.label}</span>
                {index < steps.length - 1 && (
                  <div className="h-0.5 w-4 md:w-6 bg-slate-200 ml-2 md:ml-4 hidden sm:block" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};