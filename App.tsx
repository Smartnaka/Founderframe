import React, { useState, useEffect } from 'react';
import { AppStep, StartupState, Slide, PitchTheme } from './types';
import { analyzeStartupIdea, generatePitchDeck, generateSlideImage } from './services/gemini';
import { StepIndicator } from './components/StepIndicator';
import { IdeaInput } from './views/IdeaInput';
import { MarketInsights } from './views/MarketInsights';
import { PitchBuilder } from './views/PitchBuilder';
import { ExportView } from './views/Export';
import { LandingPage } from './views/LandingPage';
import { AlertTriangle, Key, Settings, ZapOff } from 'lucide-react';

const DEFAULT_THEME: PitchTheme = {
  id: 'blue',
  name: 'Professional Blue',
  primaryColor: '#2563eb', // brand-600
  accentColor: '#eff6ff', // brand-50
  font: 'Inter, sans-serif'
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.LANDING);
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [quotaError, setQuotaError] = useState(false);

  const [state, setState] = useState<StartupState>({
    ideaRaw: '',
    isAnalyzing: false,
    analysis: null,
    pitchDeck: [],
    isGeneratingPitch: false,
    theme: DEFAULT_THEME
  });

  // Check for API key on mount if in AI Studio environment
  useEffect(() => {
    const checkApiKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsApiKey(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleConnectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        // Assume success to avoid race condition with environment variable injection
        setNeedsApiKey(false);
        setError(null);
        setConfigError(false);
        setQuotaError(false);
      } catch (e) {
        console.error("Failed to select key", e);
      }
    }
  };

  // Scroll to top on step change (relevant for internal scroll containers)
  useEffect(() => {
    // Reset scroll of the scrollable container if it exists
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }
  }, [currentStep]);

  const handleApiError = async (err: any) => {
    const errorMessage = err.message || '';
    
    // 1. Quota / Rate Limit Errors (429)
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("resource_exhausted")) {
       setQuotaError(true);
       return true;
    }

    // 2. Auth / Missing Key Errors
    if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key")) {
       if ((window as any).aistudio) {
         setNeedsApiKey(true);
         setError("Please select a valid paid API Key to continue.");
         return true; // handled
       } else {
         // Not in AI Studio, but API key is missing or invalid
         setConfigError(true);
         return true; // handled
       }
    }
    return false; // not handled
  };

  const handleAnalyzeIdea = async (idea: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true, ideaRaw: idea }));
    setError(null);
    setQuotaError(false);
    try {
      const analysis = await analyzeStartupIdea(idea);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        analysis 
      }));
      setCompletedSteps(prev => [...new Set([...prev, AppStep.IDEA])]);
      setCurrentStep(AppStep.INSIGHTS);
    } catch (err: any) {
      const handled = await handleApiError(err);
      if (!handled) {
        setError(err.message || "Failed to analyze idea.");
      }
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const generateAllSlideImages = async (slides: Slide[]) => {
    // REDUCED BATCH SIZE TO 1: To prevent hitting rate limits (429) on free/standard tiers.
    const BATCH_SIZE = 1;
    const slidesToProcess = [...slides];

    for (let i = 0; i < slidesToProcess.length; i += BATCH_SIZE) {
      const batch = slidesToProcess.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (slide) => {
        try {
          const imageUrl = await generateSlideImage(slide.visualPrompt);
          setState(prev => ({
            ...prev,
            pitchDeck: prev.pitchDeck.map(s => 
              s.id === slide.id ? { ...s, imageUrl, isLoadingImage: false } : s
            )
          }));
        } catch (err) {
          console.error(`Failed to generate image for slide ${slide.id}`, err);
          // Don't show global error for background image gen failures, just stop loader
          setState(prev => ({
            ...prev,
            pitchDeck: prev.pitchDeck.map(s => 
              s.id === slide.id ? { ...s, isLoadingImage: false } : s
            )
          }));
        }
      }));
      
      // Add a small delay between batches to be nice to the API
      if (i + BATCH_SIZE < slidesToProcess.length) {
         await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const handleBuildPitch = async () => {
    if (!state.analysis) return;
    setState(prev => ({ ...prev, isGeneratingPitch: true }));
    setError(null);
    setQuotaError(false);
    try {
        const slides = await generatePitchDeck(state.analysis);
        
        // Initialize slides with loading state for images
        const slidesWithLoading = slides.map(s => ({ ...s, isLoadingImage: true }));

        setState(prev => ({
            ...prev,
            isGeneratingPitch: false,
            pitchDeck: slidesWithLoading
        }));
        
        setCompletedSteps(prev => [...new Set([...prev, AppStep.INSIGHTS])]);
        setCurrentStep(AppStep.PITCH);

        // Automatically trigger image generation for all slides
        generateAllSlideImages(slidesWithLoading);

    } catch (err: any) {
        const handled = await handleApiError(err);
        if (!handled) {
            setError(err.message || "Failed to generate pitch.");
        }
        setState(prev => ({ ...prev, isGeneratingPitch: false }));
    }
  };

  const handleGenerateImage = async (slideId: string, prompt: string) => {
    setError(null);
    setQuotaError(false);
    setState(prev => ({
      ...prev,
      pitchDeck: prev.pitchDeck.map(slide => 
        slide.id === slideId ? { ...slide, isLoadingImage: true } : slide
      )
    }));

    try {
      const imageUrl = await generateSlideImage(prompt);
      setState(prev => ({
        ...prev,
        pitchDeck: prev.pitchDeck.map(slide => 
          slide.id === slideId ? { ...slide, imageUrl, isLoadingImage: false } : slide
        )
      }));
    } catch (err: any) {
      const handled = await handleApiError(err);
      if (!handled) {
          setState(prev => ({
            ...prev,
            pitchDeck: prev.pitchDeck.map(slide => 
              slide.id === slideId ? { ...slide, isLoadingImage: false } : slide
            )
          }));
          setError(err.message || "Failed to generate image.");
      } else {
           // If handled (quota or auth), reset loading state
           setState(prev => ({
            ...prev,
            pitchDeck: prev.pitchDeck.map(slide => 
              slide.id === slideId ? { ...slide, isLoadingImage: false } : slide
            )
          }));
      }
    }
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    setState(prev => ({
        ...prev,
        pitchDeck: prev.pitchDeck.map(s => s.id === updatedSlide.id ? updatedSlide : s)
    }));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newDeck = [...state.pitchDeck];
    if (direction === 'up' && index > 0) {
      [newDeck[index], newDeck[index - 1]] = [newDeck[index - 1], newDeck[index]];
    } else if (direction === 'down' && index < newDeck.length - 1) {
      [newDeck[index], newDeck[index + 1]] = [newDeck[index + 1], newDeck[index]];
    }
    setState(prev => ({ ...prev, pitchDeck: newDeck }));
  };

  const handleDeleteSlide = (index: number) => {
    if (state.pitchDeck.length <= 1) {
      setError("You must have at least one slide.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this slide?")) {
      const newDeck = state.pitchDeck.filter((_, i) => i !== index);
      setState(prev => ({ ...prev, pitchDeck: newDeck }));
    }
  };

  const handleThemeChange = (theme: PitchTheme) => {
    setState(prev => ({ ...prev, theme }));
  };

  const handleExportClick = () => {
      setCompletedSteps(prev => [...new Set([...prev, AppStep.PITCH])]);
      setCurrentStep(AppStep.EXPORT);
  };

  const handleStepClick = (step: AppStep) => {
      setCurrentStep(step);
  };

  const handleGetStarted = () => {
      if (needsApiKey) {
          // If key is missing, trigger selection instead of navigation
          handleConnectKey();
      } else {
          setCurrentStep(AppStep.IDEA);
      }
  };

  // Render blocking API Key view if needed and we are trying to use the app
  const renderApiKeyOverlay = () => {
    // 1. Quota Error Overlay (Priority)
    if (quotaError) {
      return (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-amber-200 animate-fade-in">
             <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
               <ZapOff size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-3">Quota Exceeded</h2>
             <p className="text-slate-600 mb-6 leading-relaxed">
               You've hit the usage limit for the Gemini API. This is common on free tier accounts.
             </p>
             <div className="text-sm bg-slate-50 p-4 rounded-lg text-slate-500 mb-6">
               Please wait a few minutes before trying again, or check your billing status in Google AI Studio.
             </div>
             <button 
               onClick={() => setQuotaError(false)}
               className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
             >
               Dismiss & Try Later
             </button>
          </div>
        </div>
      );
    }

    // 2. AI Studio Case: API Key Selection UI
    if (needsApiKey && currentStep !== AppStep.LANDING) {
      return (
        <div className="absolute inset-0 z-50 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
             <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
               <Key size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-3">API Key Required</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">
               To use the advanced AI features of FounderFrame, please connect your Gemini API key from Google AI Studio.
             </p>
             <button 
               onClick={handleConnectKey}
               className="w-full bg-brand-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-700 transition-colors shadow-lg hover:shadow-brand-500/30 flex items-center justify-center space-x-2"
             >
               <span>Connect Gemini API Key</span>
             </button>
             <p className="mt-4 text-xs text-slate-400">
               You will be asked to select a Google Cloud Project with billing enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">Learn more</a>
             </p>
          </div>
        </div>
      );
    }

    // 3. Deployment/Local Case: Configuration Error
    if (configError) {
      return (
        <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-200">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
               <Settings size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-3">Configuration Error</h2>
             <p className="text-slate-600 mb-4 leading-relaxed">
               The application cannot find the <code>API_KEY</code> environment variable.
             </p>
             <div className="bg-slate-100 p-4 rounded-lg text-left text-sm text-slate-700 mb-6 space-y-2">
                <p className="font-semibold text-slate-900">For Vercel Deployments:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to your Project Settings on Vercel.</li>
                  <li>Click on <strong>Environment Variables</strong>.</li>
                  <li>Add <strong>Key:</strong> <code>API_KEY</code></li>
                  <li>Add <strong>Value:</strong> <code>your-gemini-api-key</code></li>
                  <li>Redeploy your project.</li>
                </ol>
             </div>
             <button 
               onClick={() => setConfigError(false)}
               className="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors"
             >
               Close and Retry
             </button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (currentStep === AppStep.LANDING) {
    return (
        <>
            <LandingPage onGetStarted={handleGetStarted} />
            {needsApiKey && (
                <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
                    <button 
                        onClick={handleConnectKey}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-2 hover:bg-slate-800 transition-colors"
                    >
                        <Key size={14} />
                        <span>Connect API Key</span>
                    </button>
                </div>
            )}
        </>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Global Error Toast */}
      {error && !needsApiKey && !configError && !quotaError && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center animate-bounce">
            <AlertTriangle className="mr-2" size={20}/>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
          </div>
      )}

      {currentStep !== AppStep.EXPORT && (
        <StepIndicator 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
            onStepClick={handleStepClick}
        />
      )}

      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* API Key Blocker for Main App */}
        {renderApiKeyOverlay()}

        {/* Scrollable Container for standard content pages */}
        {(currentStep === AppStep.IDEA || currentStep === AppStep.INSIGHTS || currentStep === AppStep.EXPORT) && (
            <div id="main-scroll-container" className="h-full w-full overflow-y-auto">
                <div className="min-h-full flex flex-col">
                    {currentStep === AppStep.IDEA && (
                    <IdeaInput 
                        initialIdea={state.ideaRaw} 
                        onAnalyze={handleAnalyzeIdea} 
                        isLoading={state.isAnalyzing} 
                    />
                    )}

                    {currentStep === AppStep.INSIGHTS && state.analysis && (
                    <MarketInsights 
                        analysis={state.analysis}
                        onContinue={handleBuildPitch}
                        isGeneratingPitch={state.isGeneratingPitch}
                    />
                    )}

                    {currentStep === AppStep.EXPORT && (
                    <ExportView 
                        slides={state.pitchDeck}
                        analysis={state.analysis}
                        theme={state.theme}
                        onBack={() => setCurrentStep(AppStep.PITCH)}
                    />
                    )}
                    
                    <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto">
                        <p>© {new Date().getFullYear()} FounderFrame. Powered by Gemini.</p>
                    </footer>
                </div>
            </div>
        )}

        {/* Fixed Container for Application Views (Pitch Builder) */}
        {currentStep === AppStep.PITCH && (
            <div className="h-full w-full overflow-hidden">
                <PitchBuilder 
                    slides={state.pitchDeck}
                    theme={state.theme}
                    onExport={handleExportClick}
                    onGenerateImage={handleGenerateImage}
                    onUpdateSlide={handleUpdateSlide}
                    onMoveSlide={handleMoveSlide}
                    onDeleteSlide={handleDeleteSlide}
                    onThemeChange={handleThemeChange}
                />
            </div>
        )}
      </main>
    </div>
  );
}