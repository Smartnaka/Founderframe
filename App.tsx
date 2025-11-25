
import React, { useState, useEffect } from 'react';
import { AppStep, StartupState, Slide, PitchTheme } from './types';
import { analyzeStartupIdea, generatePitchDeck, generateSlideImage } from './services/gemini';
import { StepIndicator } from './components/StepIndicator';
import { IdeaInput } from './views/IdeaInput';
import { MarketInsights } from './views/MarketInsights';
import { PitchBuilder } from './views/PitchBuilder';
import { ExportView } from './views/Export';
import { LandingPage } from './views/LandingPage';
import { AlertTriangle } from 'lucide-react';

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

  const [state, setState] = useState<StartupState>({
    ideaRaw: '',
    isAnalyzing: false,
    analysis: null,
    pitchDeck: [],
    isGeneratingPitch: false,
    theme: DEFAULT_THEME
  });

  // Scroll to top on step change (relevant for internal scroll containers)
  useEffect(() => {
    // Reset scroll of the scrollable container if it exists
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }
  }, [currentStep]);

  const handleAnalyzeIdea = async (idea: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true, ideaRaw: idea }));
    setError(null);
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
      setError(err.message || "Failed to analyze idea.");
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const generateAllSlideImages = async (slides: Slide[]) => {
    // Process in batches of 3 to avoid rate limits/overloading the model
    const BATCH_SIZE = 3;
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
          setState(prev => ({
            ...prev,
            pitchDeck: prev.pitchDeck.map(s => 
              s.id === slide.id ? { ...s, isLoadingImage: false } : s
            )
          }));
        }
      }));
    }
  };

  const handleBuildPitch = async () => {
    if (!state.analysis) return;
    setState(prev => ({ ...prev, isGeneratingPitch: true }));
    setError(null);
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
        setError(err.message || "Failed to generate pitch.");
        setState(prev => ({ ...prev, isGeneratingPitch: false }));
    }
  };

  const handleGenerateImage = async (slideId: string, prompt: string) => {
    setError(null);
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
      setState(prev => ({
        ...prev,
        pitchDeck: prev.pitchDeck.map(slide => 
          slide.id === slideId ? { ...slide, isLoadingImage: false } : slide
        )
      }));
      setError(err.message || "Failed to generate image.");
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
      setCurrentStep(AppStep.IDEA);
  };

  if (currentStep === AppStep.LANDING) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Global Error Toast */}
      {error && (
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
