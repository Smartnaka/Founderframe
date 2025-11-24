
import React, { useState, useEffect } from 'react';
import { Slide, SlideLayout, PitchTheme } from '../types';
import { Monitor, ChevronRight, Image as ImageIcon, Loader2, RefreshCw, Sparkles, Plus, Trash2, Edit3, LayoutTemplate, AlignLeft, AlignCenter, Image, ChevronUp, ChevronDown, Palette } from 'lucide-react';

interface PitchBuilderProps {
  slides: Slide[];
  theme: PitchTheme;
  onExport: () => void;
  onGenerateImage: (slideId: string, prompt: string) => Promise<void>;
  onUpdateSlide: (slide: Slide) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  onDeleteSlide: (index: number) => void;
  onThemeChange: (theme: PitchTheme) => void;
}

const THEMES: PitchTheme[] = [
  { id: 'blue', name: 'Professional Blue', primaryColor: '#2563eb', accentColor: '#eff6ff', font: 'Inter, sans-serif' },
  { id: 'emerald', name: 'Eco Green', primaryColor: '#059669', accentColor: '#ecfdf5', font: 'Inter, sans-serif' },
  { id: 'violet', name: 'Creative Violet', primaryColor: '#7c3aed', accentColor: '#f5f3ff', font: 'Inter, sans-serif' },
  { id: 'rose', name: 'Bold Rose', primaryColor: '#e11d48', accentColor: '#fff1f2', font: 'Inter, sans-serif' },
  { id: 'slate', name: 'Modern Slate', primaryColor: '#334155', accentColor: '#f8fafc', font: 'Inter, sans-serif' },
  { id: 'serif', name: 'Classic Serif', primaryColor: '#2563eb', accentColor: '#eff6ff', font: 'Georgia, serif' },
];

export const PitchBuilder: React.FC<PitchBuilderProps> = ({ 
  slides, 
  theme,
  onExport, 
  onGenerateImage, 
  onUpdateSlide, 
  onMoveSlide, 
  onDeleteSlide,
  onThemeChange
}) => {
  const [activeSlideId, setActiveSlideId] = useState<string>(slides[0]?.id || '');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  const activeSlide = slides.find(s => s.id === activeSlideId);
  const activeIndex = slides.findIndex(s => s.id === activeSlideId);

  // Ensure active slide exists if slides change (e.g. deletion)
  useEffect(() => {
    if (!activeSlide && slides.length > 0) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlide]);

  const handleGenerateClick = async (slide: Slide) => {
    try {
      await onGenerateImage(slide.id, slide.visualPrompt);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (activeSlide) {
        onUpdateSlide({ ...activeSlide, title: newTitle });
    }
  };

  const handleContentChange = (index: number, newValue: string) => {
    if (activeSlide) {
        const newContent = [...activeSlide.content];
        newContent[index] = newValue;
        onUpdateSlide({ ...activeSlide, content: newContent });
    }
  };

  const handleAddPoint = () => {
      if (activeSlide) {
          onUpdateSlide({ ...activeSlide, content: [...activeSlide.content, "New point..."] });
      }
  };

  const handleDeletePoint = (index: number) => {
      if (activeSlide) {
          const newContent = activeSlide.content.filter((_, i) => i !== index);
          onUpdateSlide({ ...activeSlide, content: newContent });
      }
  };

  const handleNotesChange = (newNotes: string) => {
      if (activeSlide) {
          onUpdateSlide({ ...activeSlide, speakerNotes: newNotes });
      }
  };

  const handleLayoutChange = (layout: SlideLayout) => {
      if (activeSlide) {
          onUpdateSlide({ ...activeSlide, layout });
      }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-slate-50">
      
      {/* Responsive Sidebar */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col flex-shrink-0 z-20 shadow-sm md:shadow-none h-16 md:h-full overflow-x-auto md:overflow-y-auto scrollbar-hide md:scrollbar-default">
        <div className="hidden md:block p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 backdrop-blur-sm z-10">
          <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
             <span className="flex items-center"><LayoutTemplate className="mr-2" size={14}/> Slide Outline</span>
             <span className="text-slate-400 text-[10px]">{slides.length} Slides</span>
          </h2>
        </div>
        
        <div className="flex md:flex-col p-2 md:p-3 gap-2 md:gap-1">
          {slides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`
                flex-shrink-0 relative group flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200
                ${activeSlideId === slide.id 
                  ? 'bg-slate-100 ring-1 ring-slate-200 shadow-sm' 
                  : 'hover:bg-slate-50 border border-transparent'}
              `}
            >
              <button
                onClick={() => setActiveSlideId(slide.id)}
                className="flex items-center space-x-3 flex-grow text-left min-w-0"
              >
                <span className={`
                    flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors
                    ${activeSlideId === slide.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                `} style={activeSlideId === slide.id ? { backgroundColor: theme.primaryColor } : {}}>
                    {index + 1}
                </span>
                <span className={`truncate text-sm font-medium ${activeSlideId === slide.id ? 'text-slate-900' : 'text-slate-600'}`}>
                    {slide.title}
                </span>
              </button>
              
              {/* Slide Actions (Desktop Only) */}
              <div className="hidden md:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-100 ml-2">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMoveSlide(index, 'up'); }}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
                 >
                    <ChevronUp size={12} />
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onMoveSlide(index, 'down'); }}
                    disabled={index === slides.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
                 >
                    <ChevronDown size={12} />
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteSlide(index); }}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                 >
                    <Trash2 size={12} />
                 </button>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center space-x-2 ml-2 md:ml-0 md:hidden">
                 {slide.isLoadingImage && <Loader2 size={12} className="animate-spin text-slate-500" />}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block p-4 mt-auto border-t border-slate-100 bg-slate-50/50 sticky bottom-0">
            <button 
                onClick={onExport}
                className="w-full py-2.5 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 active:scale-95"
                style={{ backgroundColor: theme.primaryColor }}
            >
                <Monitor size={16} />
                <span>Export Deck</span>
            </button>
        </div>
      </div>

      {/* Main Content: Slide Editor */}
      <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4 md:p-8 relative">
        {activeSlide ? (
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-0">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:-mb-14 relative z-20 gap-4 md:gap-0 pointer-events-none">
              {/* Layout Selector */}
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-1 pointer-events-auto">
                 <button 
                   onClick={() => handleLayoutChange('default')}
                   className={`p-2 rounded-md transition-all ${activeSlide.layout === 'default' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                   title="Standard Layout"
                 >
                   <LayoutTemplate size={18} />
                 </button>
                 <button 
                   onClick={() => handleLayoutChange('image_left')}
                   className={`p-2 rounded-md transition-all ${activeSlide.layout === 'image_left' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                   title="Visual Focus"
                 >
                   <Image size={18} />
                 </button>
                 <button 
                   onClick={() => handleLayoutChange('minimal')}
                   className={`p-2 rounded-md transition-all ${activeSlide.layout === 'minimal' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                   title="Minimalist"
                 >
                   <AlignCenter size={18} />
                 </button>
                 <button 
                   onClick={() => handleLayoutChange('content_heavy')}
                   className={`p-2 rounded-md transition-all ${activeSlide.layout === 'content_heavy' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
                   title="Content Heavy"
                 >
                   <AlignLeft size={18} />
                 </button>
              </div>

              {/* Theme Selector */}
              <div className="relative pointer-events-auto">
                <button 
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Palette size={16} style={{ color: theme.primaryColor }} />
                  <span>{theme.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {showThemeSelector && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 grid gap-1 z-30">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { onThemeChange(t); setShowThemeSelector(false); }}
                        className={`flex items-center space-x-3 w-full p-2 rounded-lg text-left transition-colors ${theme.id === t.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: t.primaryColor }}></div>
                        <span className="text-sm text-slate-700">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {/* Close selector on click outside (simplified) */}
                {showThemeSelector && (
                  <div className="fixed inset-0 z-20" onClick={() => setShowThemeSelector(false)}></div>
                )}
              </div>
            </div>

            {/* Slide Preview Card */}
            <div className="w-full aspect-video bg-white rounded-xl shadow-xl ring-1 ring-slate-900/5 flex flex-col relative overflow-hidden group transition-all">
                
                {/* Dynamic Font Application */}
                <div className="contents" style={{ fontFamily: theme.font }}>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent skew-x-12 transform origin-top translate-x-12 pointer-events-none opacity-30" style={{ backgroundColor: theme.accentColor }} />
                    <div className="absolute top-0 left-0 w-1.5 h-full z-10" style={{ backgroundColor: theme.primaryColor }} />

                    <div className={`relative z-10 flex flex-col h-full p-6 md:p-10 lg:p-14 ${activeSlide.layout === 'minimal' ? 'items-center text-center' : ''}`}>
                        {/* Header */}
                        <div className={`flex justify-between items-start mb-6 md:mb-10 w-full ${activeSlide.layout === 'minimal' ? 'flex-col items-center' : ''}`}>
                            <div className={`w-full ${activeSlide.layout === 'minimal' ? 'text-center' : 'pr-8'}`}>
                                <div className="mb-4 relative group/edit inline-block w-full">
                                    <input
                                        value={activeSlide.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className={`w-full text-2xl md:text-4xl font-extrabold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-current focus:outline-none transition-all placeholder:text-slate-300 leading-tight ${activeSlide.layout === 'minimal' ? 'text-center' : ''}`}
                                        placeholder="Slide Title"
                                        style={{ '--tw-border-opacity': 1, borderColor: 'transparent' } as any}
                                    />
                                    <Edit3 size={16} className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-slate-300 opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <div className={`h-1 w-20 rounded-full ${activeSlide.layout === 'minimal' ? 'mx-auto' : ''}`} style={{ backgroundColor: theme.primaryColor }}></div>
                            </div>
                            <span className={`text-4xl md:text-5xl font-bold text-slate-100 font-mono select-none ${activeSlide.layout === 'minimal' ? 'hidden' : ''}`}>
                                {String(activeIndex + 1).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Body */}
                        <div className={`flex-grow w-full min-h-0 ${
                            activeSlide.layout === 'minimal' ? 'flex flex-col items-center justify-center max-w-2xl mx-auto' :
                            activeSlide.layout === 'content_heavy' ? 'flex flex-col' :
                            'grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12'
                        }`}>
                            
                            {/* Text Content */}
                            <div className={`flex flex-col overflow-y-auto pr-2 custom-scrollbar ${
                                activeSlide.layout === 'default' ? 'md:col-span-7 order-1' :
                                activeSlide.layout === 'image_left' ? 'md:col-span-5 order-2' :
                                activeSlide.layout === 'content_heavy' ? 'w-full columns-1 md:columns-2 gap-12' :
                                'w-full'
                            }`}>
                                <div className="space-y-4">
                                    {activeSlide.content.map((point, idx) => (
                                        <div key={idx} className={`flex items-start group/point ${activeSlide.layout === 'minimal' ? 'justify-center' : ''} ${activeSlide.layout === 'content_heavy' ? 'break-inside-avoid mb-6' : ''}`}>
                                            <div 
                                                className={`mt-1.5 mr-3 w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover/point:scale-125 transition-transform ${activeSlide.layout === 'minimal' ? 'hidden' : ''}`} 
                                                style={{ backgroundColor: theme.primaryColor }}
                                            />
                                            <div className="flex-grow relative">
                                                <textarea
                                                    value={point}
                                                    onChange={(e) => handleContentChange(idx, e.target.value)}
                                                    rows={Math.max(1, Math.ceil(point.length / 50))}
                                                    className={`w-full text-base md:text-xl text-slate-700 bg-transparent border border-transparent hover:border-slate-100 focus:bg-white rounded px-2 py-0.5 focus:outline-none resize-none overflow-hidden transition-all leading-relaxed ${activeSlide.layout === 'minimal' ? 'text-center font-medium md:text-2xl' : ''}`}
                                                    style={{ fontFamily: theme.font }}
                                                />
                                                <button 
                                                    onClick={() => handleDeletePoint(idx)}
                                                    className="absolute -right-6 top-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/point:opacity-100 transition-all p-1"
                                                    title="Delete point"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={handleAddPoint}
                                    className={`inline-flex items-center space-x-2 text-sm font-semibold mt-4 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-max ${activeSlide.layout === 'minimal' ? 'mx-auto' : ''}`}
                                    style={{ color: theme.primaryColor }}
                                >
                                    <Plus size={16} />
                                    <span>Add Point</span>
                                </button>
                            </div>

                            {/* Image Content */}
                            {(activeSlide.layout === 'default' || activeSlide.layout === 'image_left') && (
                            <div className={`flex flex-col h-full min-h-[200px] md:min-h-auto ${
                                activeSlide.layout === 'default' ? 'md:col-span-5 order-2' : 
                                'md:col-span-7 order-1'
                            }`}>
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-50 border-2 border-slate-100 group/image transition-colors hover:border-current" style={{ color: theme.accentColor }}>
                                    {activeSlide.imageUrl ? (
                                        <>
                                        <img 
                                            src={activeSlide.imageUrl} 
                                            alt="Slide Visual" 
                                            className="w-full h-full object-cover md:object-contain p-2 md:p-4" 
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors" />
                                        <button 
                                            onClick={() => handleGenerateClick(activeSlide)}
                                            disabled={activeSlide.isLoadingImage}
                                            className="absolute bottom-4 right-4 p-2.5 bg-white shadow-lg rounded-full text-slate-700 hover:text-current opacity-0 group-hover/image:opacity-100 transition-all transform translate-y-2 group-hover/image:translate-y-0"
                                            title="Regenerate Image"
                                            style={{ color: theme.primaryColor }}
                                        >
                                            {activeSlide.isLoadingImage ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18} />}
                                        </button>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                            {activeSlide.isLoadingImage ? (
                                                <>
                                                    <Loader2 className="animate-spin mb-3" size={32} style={{ color: theme.primaryColor }}/>
                                                    <p className="text-sm font-medium animate-pulse" style={{ color: theme.primaryColor }}>Designing visual...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover/image:bg-white transition-colors" style={{ backgroundColor: theme.accentColor }}>
                                                        <ImageIcon className="transition-colors" size={32} style={{ color: theme.primaryColor }}/>
                                                    </div>
                                                    <p className="text-xs font-medium mb-4 max-w-[200px]">
                                                        {activeSlide.visualPrompt.slice(0, 80)}...
                                                    </p>
                                                    <button 
                                                        onClick={() => handleGenerateClick(activeSlide)}
                                                        className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-sm hover:shadow-md hover:border-current transition-all flex items-center space-x-2"
                                                        style={{ color: theme.primaryColor }}
                                                    >
                                                        <Sparkles size={14} />
                                                        <span>Generate Visual</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-6 flex justify-between items-end text-[10px] md:text-xs text-slate-300 font-medium uppercase tracking-widest">
                            <span>Confidential - Draft</span>
                            <span>FounderFrame AI</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context & Notes Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                
                {/* Speaker Notes */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
                    <label className="flex items-center space-x-2 mb-3 text-slate-700 font-semibold text-sm">
                        <Monitor size={16} />
                        <span>Speaker Notes</span>
                    </label>
                    <textarea 
                        value={activeSlide.speakerNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        className="text-slate-600 text-sm leading-relaxed w-full min-h-[120px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-current focus:ring-1 focus:ring-current focus:outline-none resize-none transition-shadow"
                        style={{ '--tw-ring-color': theme.primaryColor, borderColor: 'transparent' } as any}
                        placeholder="Add notes for your presentation..."
                    />
                </div>

                {/* AI Visual Prompt */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
                     <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center space-x-2 font-semibold text-sm" style={{ color: theme.primaryColor }}>
                            <Sparkles size={16} />
                            <span>AI Visual Prompt</span>
                        </label>
                     </div>
                     <div className="rounded-lg p-3 border border-slate-100 flex-grow" style={{ backgroundColor: theme.accentColor }}>
                        <p className="text-slate-600 text-sm leading-relaxed italic">
                            "{activeSlide.visualPrompt}"
                        </p>
                     </div>
                    <div className="flex items-center justify-end pt-3">
                        <button
                            onClick={() => handleGenerateClick(activeSlide)}
                            disabled={activeSlide.isLoadingImage}
                            className="text-xs font-bold flex items-center space-x-1 disabled:opacity-50 transition-colors uppercase tracking-wide"
                            style={{ color: theme.primaryColor }}
                        >
                             {activeSlide.isLoadingImage ? (
                                <span>Generating...</span>
                             ) : (
                                <>
                                    <span>Regenerate</span>
                                    <ChevronRight size={12} />
                                </>
                             )}
                        </button>
                    </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                  <LayoutTemplate size={32} className="text-slate-400" />
              </div>
              <p>Select a slide from the list to start editing</p>
          </div>
        )}
        
        {/* Mobile FAB for Export */}
        <div className="md:hidden fixed bottom-6 right-6 z-30">
            <button 
                onClick={onExport}
                className="w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all"
                style={{ backgroundColor: theme.primaryColor }}
            >
                <Monitor size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};
