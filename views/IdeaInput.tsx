import React, { useState, useCallback } from 'react';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface IdeaInputProps {
  initialIdea: string;
  onAnalyze: (idea: string) => void;
  isLoading: boolean;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ initialIdea, onAnalyze, isLoading }) => {
  const [idea, setIdea] = useState(initialIdea);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (!idea.trim() || idea.length < 10) {
      setError('Please provide a bit more detail about your idea (at least 10 characters).');
      return;
    }
    setError('');
    onAnalyze(idea);
  }, [idea, onAnalyze]);

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 animate-fade-in">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Turn your spark into a strategy.
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Describe your startup concept. Our AI will analyze the market, identify competitors, and build your pitch deck structure instantly.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <label htmlFor="idea-input" className="block text-sm font-semibold text-slate-700 mb-2">
          Your Startup Idea
        </label>
        <div className="relative">
          <textarea
            id="idea-input"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={isLoading}
            className="w-full h-48 p-4 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-base md:text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none placeholder:text-slate-400"
            placeholder="e.g., A subscription service for ugly produce to reduce food waste, targeting eco-conscious urban millennials..."
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-400">
            {idea.length} chars
          </div>
        </div>
        
        {error && (
          <p className="mt-2 text-red-500 text-sm flex items-center">
            <span className="mr-1">⚠️</span> {error}
          </p>
        )}

        <div className="mt-6 md:mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              flex items-center justify-center space-x-2 w-full md:w-auto px-8 py-3 rounded-full font-semibold text-white shadow-lg transition-all
              ${isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/30 transform hover:-translate-y-0.5'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing Market...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Analyze Strategy</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center text-slate-500">
        <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-1">Market Sizing</h3>
          <p className="text-xs md:text-sm">Instant TAM/SAM/SOM estimation based on industry data.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-1">Competitive Analysis</h3>
          <p className="text-xs md:text-sm">Identify key rivals and your unique winning angle.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-1">Pitch Generation</h3>
          <p className="text-xs md:text-sm">Auto-generate a structured 10-slide investor deck.</p>
        </div>
      </div>
    </div>
  );
};