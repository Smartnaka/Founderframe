
import React, { useState } from 'react';
import { AppStep, User } from '../types';
import { Lightbulb, TrendingUp, Presentation, Download, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
  completedSteps: AppStep[];
  user: User | null;
  onLogout: () => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick, completedSteps, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <div className="w-full bg-white border-b border-slate-200 py-3 md:py-4 px-4 md:px-6 sticky top-0 z-40 no-print shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 mr-6 md:mr-0">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">F</div>
            <span className="font-bold text-slate-800 text-lg tracking-tight hidden md:inline">FounderFrame</span>
        </div>
        
        {/* Only show steps if we are not in Auth or Landing */}
        {currentStep !== AppStep.LANDING && currentStep !== AppStep.AUTH && (
          <nav aria-label="Progress" className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide w-full md:w-auto pb-1 md:pb-0 mx-4">
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
                  <span className="font-medium text-xs md:text-sm whitespace-nowrap hidden lg:inline">{step.label}</span>
                  {index < steps.length - 1 && (
                    <div className="h-0.5 w-4 md:w-6 bg-slate-200 ml-2 md:ml-4 hidden xl:block" />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center space-x-4 ml-auto">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 bg-slate-50"
              >
                <div className="w-6 h-6 bg-brand-200 text-brand-700 rounded-full flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
             <div className="w-8"></div> // Spacer
          )}
        </div>
      </div>
    </div>
  );
};
