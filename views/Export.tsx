
import React, { useState, useEffect } from 'react';
import { Slide, MarketAnalysis, PitchTheme } from '../types';
import { Download, Printer, ArrowLeft, X, ChevronRight, ChevronLeft, MonitorPlay, Image as ImageIcon, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportViewProps {
  slides: Slide[];
  analysis: MarketAnalysis | null;
  theme: PitchTheme;
  onBack: () => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ slides, analysis, theme, onBack }) => {
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, slides.length]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async (slideId: string, index: number, format: 'png' | 'jpeg') => {
    const element = document.getElementById(`slide-export-${index}`);
    if (!element) return;
    
    setExportingId(slideId);

    try {
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true, // For cross-origin images
        backgroundColor: '#ffffff',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `slide-${index + 1}-${analysis?.tagline.slice(0,10).replace(/\s+/g, '-') || 'pitch'}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
      link.click();
    } catch (e) {
      console.error("Image export failed", e);
      alert("Failed to generate image. Please try again.");
    } finally {
      setExportingId(null);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    slides.forEach((slide, index) => {
        if (index > 0) doc.addPage();
        
        // Background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 297, 210, 'F');
        
        // Accent Bar
        doc.setFillColor(theme.primaryColor);
        doc.rect(0, 0, 4, 210, 'F');

        // Header
        doc.setFontSize(28);
        // Note: jsPDF doesn't easily support custom web fonts without embedding, so we stick to standard mapping or Helvetica
        const fontName = theme.font.includes('serif') ? 'times' : 'helvetica';
        doc.setFont(fontName, "bold");
        doc.setTextColor(15, 23, 42); // Slate-900
        
        // Adjust title position for minimal layout
        if (slide.layout === 'minimal') {
             doc.text(slide.title, 148, 30, { align: 'center' });
             doc.setDrawColor(theme.primaryColor);
             doc.setLineWidth(1);
             doc.line(138, 38, 158, 38); // Centered underline
        } else {
             doc.text(slide.title, 20, 30);
             doc.setDrawColor(theme.primaryColor);
             doc.setLineWidth(1);
             doc.line(20, 38, 40, 38);
        }

        // Slide Number
        if (slide.layout !== 'minimal') {
            doc.setFontSize(40);
            doc.setTextColor(226, 232, 240); // Slate-200
            doc.text(String(index + 1).padStart(2, '0'), 270, 30, { align: 'right' });
        }

        // Content
        doc.setFontSize(14);
        doc.setFont(fontName, "normal");
        doc.setTextColor(51, 65, 85); // Slate-700
        let yPos = 60;
        
        // Layout Logic for PDF
        const isMinimal = slide.layout === 'minimal';
        const isContentHeavy = slide.layout === 'content_heavy';
        const isImageLeft = slide.layout === 'image_left';

        if (isMinimal) {
             // Centered Text, Full Width, No Image
             slide.content.forEach((point) => {
                doc.text(`• ${point}`, 148, yPos, { align: 'center', maxWidth: 200 });
                yPos += 14;
             });
        } else if (isContentHeavy) {
             // Full width text, No Image
             slide.content.forEach((point) => {
                const splitText = doc.splitTextToSize(`• ${point}`, 250);
                doc.text(splitText, 20, yPos);
                yPos += (splitText.length * 8) + 4;
             });
        } else {
             // Standard or Image Left (Split View)
             const textX = isImageLeft ? 140 : 20;
             const imageX = isImageLeft ? 20 : 170;
             const maxTextWidth = 140; // Approx 14cm

             slide.content.forEach((point) => {
                const splitText = doc.splitTextToSize(`• ${point}`, maxTextWidth);
                doc.text(splitText, textX, yPos);
                yPos += (splitText.length * 8) + 4;
            });

            // Image Column
            if (slide.imageUrl) {
                try {
                    const matches = slide.imageUrl.match(/^data:image\/(\w+);base64,/);
                    const format = matches ? matches[1].toUpperCase() : 'PNG';
                    doc.addImage(slide.imageUrl, format, imageX, 60, 110, 110, undefined, 'FAST');
                } catch (e) {
                    console.error("Failed to add image to PDF", e);
                }
            }
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text("CONFIDENTIAL - FounderFrame AI", 20, 200);
        doc.text(analysis?.tagline || "", 277, 200, { align: 'right' });
    });

    doc.save(`${analysis?.tagline.slice(0, 20).replace(/[^a-z0-9]/gi, '_') || 'pitch'}_deck.pdf`);
  };

  const startPresentation = () => {
    setCurrentSlideIndex(0);
    setIsPresenting(true);
  };

  const navigateSlide = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
    } else {
      setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
    }
  };

  // --- PRESENTATION MODE RENDER ---
  if (isPresenting) {
    const currentSlide = slides[currentSlideIndex];
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-slate-100 overflow-hidden">
        
        {/* Presentation Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700/50 bg-slate-900 z-20">
           <div className="flex items-center space-x-4">
             <span className="font-bold text-lg tracking-tight text-white">FounderFrame</span>
             <span className="text-slate-500 text-sm border-l border-slate-700 pl-4 hidden md:inline">{analysis?.tagline}</span>
           </div>
           <div className="flex items-center space-x-4">
             <span className="text-slate-400 text-sm font-mono">{currentSlideIndex + 1} / {slides.length}</span>
             <button 
               onClick={() => setIsPresenting(false)}
               className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
               title="Exit (Esc)"
             >
               <X size={20} />
             </button>
           </div>
        </div>

        {/* Slide Canvas - Responsive Container */}
        <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-slate-900 relative overflow-hidden">
            
            {/* Nav Buttons (Overlay) */}
            <button 
              onClick={(e) => { e.stopPropagation(); navigateSlide('prev'); }}
              disabled={currentSlideIndex === 0}
              className="absolute left-2 md:left-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 disabled:opacity-0 disabled:pointer-events-none transition-all z-30 backdrop-blur-sm"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); navigateSlide('next'); }}
              disabled={currentSlideIndex === slides.length - 1}
              className="absolute right-2 md:right-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 disabled:opacity-0 disabled:pointer-events-none transition-all z-30 backdrop-blur-sm"
            >
              <ChevronRight size={32} />
            </button>

            {/* Current Slide Display */}
            <div 
              key={currentSlideIndex} 
              className="w-full max-w-7xl bg-white text-slate-900 rounded-xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
              style={{ aspectRatio: '16/9', minHeight: '300px' }}
            >
                {/* Dynamic Font Application */}
                <div className="contents" style={{ fontFamily: theme.font }}>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-2 h-full z-10" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent skew-x-12 transform origin-top translate-x-12 pointer-events-none opacity-50" style={{ backgroundColor: theme.accentColor }} />

                    <div className={`relative z-10 flex flex-col h-full p-8 md:p-12 lg:p-16 ${currentSlide.layout === 'minimal' ? 'items-center text-center' : ''}`}>
                    {/* Header */}
                    <div className={`flex justify-between items-start mb-6 md:mb-10 w-full ${currentSlide.layout === 'minimal' ? 'flex-col items-center' : ''}`}>
                            <div className={`max-w-[80%] ${currentSlide.layout === 'minimal' ? 'w-full' : ''}`}>
                                <h2 className="text-2xl md:text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">{currentSlide.title}</h2>
                                <div className={`h-1.5 w-24 rounded-full ${currentSlide.layout === 'minimal' ? 'mx-auto' : ''}`} style={{ backgroundColor: theme.primaryColor }}></div>
                            </div>
                            <span className={`text-6xl font-bold text-slate-100 font-mono select-none hidden md:block ${currentSlide.layout === 'minimal' ? 'hidden' : ''}`}>
                                {String(currentSlideIndex + 1).padStart(2, '0')}
                            </span>
                        </div>
                    
                    {/* Content Body - Layout Logic */}
                    <div className={`flex-grow w-full ${
                        currentSlide.layout === 'minimal' ? 'flex flex-col justify-center items-center' :
                        currentSlide.layout === 'content_heavy' ? 'columns-1 md:columns-2 gap-8 md:gap-16' :
                        'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start'
                    }`}>
                        <div className={`space-y-4 md:space-y-6 ${
                            currentSlide.layout === 'image_left' ? 'order-2' : 
                            currentSlide.layout === 'default' ? 'order-1' : ''
                        }`}>
                                {currentSlide.content.map((point, idx) => (
                                    <div key={idx} className={`flex items-start text-lg md:text-xl lg:text-2xl text-slate-700 leading-relaxed ${currentSlide.layout === 'minimal' ? 'justify-center' : ''} ${currentSlide.layout === 'content_heavy' ? 'break-inside-avoid mb-6' : ''}`}>
                                        <span 
                                            className={`mt-2.5 mr-4 w-2 h-2 rounded-full flex-shrink-0 ${currentSlide.layout === 'minimal' ? 'hidden' : ''}`} 
                                            style={{ backgroundColor: theme.primaryColor }}
                                        />
                                        <span>{point}</span>
                                    </div>
                                ))}
                        </div>
                        
                        {(currentSlide.layout === 'default' || currentSlide.layout === 'image_left') && (
                            <div className={`hidden md:flex flex-col items-center justify-center h-full max-h-[50vh] ${
                                currentSlide.layout === 'image_left' ? 'order-1' : 'order-2'
                            }`}>
                                {currentSlide.imageUrl ? (
                                    <img 
                                    src={currentSlide.imageUrl} 
                                    alt="Slide visual" 
                                    className="max-h-full w-full object-contain rounded-lg drop-shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full aspect-square bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-8 opacity-50">
                                        <p className="text-center text-slate-400 italic font-medium">
                                            {currentSlide.visualPrompt}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                        <div className="mt-auto pt-8 flex justify-between text-xs md:text-sm font-semibold tracking-wider text-slate-300 uppercase w-full">
                            <span>Confidential - {analysis?.tagline}</span>
                            <span>FounderFrame</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-900 z-20 flex justify-center items-center text-xs md:text-sm text-slate-500">
          Use Arrow Keys or Space to Navigate
        </div>
      </div>
    );
  }

  // --- STANDARD LIST VIEW ---
  return (
    <div className="bg-slate-100 min-h-screen py-8">
        {/* Toolbar */}
        <div className="max-w-5xl mx-auto mb-8 px-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
            <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors w-full md:w-auto justify-center md:justify-start">
                <ArrowLeft size={18} className="mr-2"/> Back to Builder
            </button>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full md:w-auto">
                <button 
                    onClick={startPresentation}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-800 text-white px-4 md:px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-medium text-sm md:text-base"
                >
                    <MonitorPlay size={18} />
                    <span>Present</span>
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white text-slate-700 border border-slate-300 px-4 md:px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm md:text-base"
                >
                    <Printer size={18} />
                    <span>Print</span>
                </button>
                <button 
                    onClick={handleDownloadPDF}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 text-white px-4 md:px-6 py-2.5 rounded-lg hover:opacity-90 transition-colors shadow-md font-medium text-sm md:text-base"
                    style={{ backgroundColor: theme.primaryColor }}
                >
                    <Download size={18} />
                    <span>PDF</span>
                </button>
            </div>
        </div>

        {/* Preview Area (Rendered as the "Paper" for printing) */}
        <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0 pb-12 print:space-y-0 print:block print:w-full print:max-w-none print:px-0">
            
            {/* Cover Page */}
             <div className="bg-white w-full aspect-video shadow-xl print:shadow-none print:break-after-page flex flex-col items-center justify-center p-8 md:p-16 text-center border border-slate-200 print:border-none relative overflow-hidden group" style={{ fontFamily: theme.font }}>
                 {/* Decorative */}
                 <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 rounded-bl-full -mr-12 -mt-12 opacity-50" style={{ backgroundColor: theme.accentColor }}></div>
                 <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-slate-50 rounded-tr-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight leading-tight">{analysis?.tagline || "Startup Concept"}</h1>
                    <div className="h-1.5 md:h-2 w-16 md:w-24 mx-auto mb-4 md:mb-8 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                    <p className="text-lg md:text-2xl text-slate-500 font-light leading-relaxed px-4">{analysis?.valueProposition}</p>
                </div>
                
                <div className="absolute bottom-6 md:bottom-12 text-slate-400 font-bold tracking-widest text-xs md:text-sm uppercase">Confidential Pitch Deck</div>
            </div>

            {/* Slides Loop */}
            {slides.map((slide, index) => (
                <div key={slide.id} className="group relative">
                    {/* Export Image Actions for this specific slide */}
                    <div className="absolute top-0 right-0 p-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 no-print">
                        <div className="bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg flex space-x-1 shadow-lg border border-slate-700/50">
                             <button
                                onClick={() => handleDownloadImage(slide.id, index, 'png')}
                                disabled={exportingId === slide.id}
                                className="px-3 py-1.5 hover:bg-white/10 rounded text-xs font-medium text-white flex items-center space-x-1 transition-colors"
                                title="Download PNG"
                             >
                                {exportingId === slide.id ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                <span className="hidden sm:inline">PNG</span>
                             </button>
                             <div className="w-px bg-slate-600 my-1"></div>
                             <button
                                onClick={() => handleDownloadImage(slide.id, index, 'jpeg')}
                                disabled={exportingId === slide.id}
                                className="px-3 py-1.5 hover:bg-white/10 rounded text-xs font-medium text-white flex items-center space-x-1 transition-colors"
                                title="Download JPG"
                             >
                                {exportingId === slide.id ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                <span className="hidden sm:inline">JPG</span>
                             </button>
                        </div>
                    </div>

                    <div 
                      id={`slide-export-${index}`}
                      className="bg-white w-full aspect-video shadow-xl print:shadow-none print:break-after-page flex flex-col relative page-break overflow-hidden border border-slate-200 print:border-none"
                      style={{ fontFamily: theme.font }}
                    >
                        {/* Consistent Slide Design */}
                        <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full z-10" style={{ backgroundColor: theme.primaryColor, WebkitPrintColorAdjust: 'exact' }}></div>
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 skew-x-12 transform origin-top translate-x-12 pointer-events-none print:hidden"></div>

                        <div className={`relative z-10 flex flex-col h-full p-6 md:p-12 lg:p-16 ${slide.layout === 'minimal' ? 'items-center text-center' : ''}`}>
                            <div className={`flex justify-between items-start mb-6 md:mb-12 w-full ${slide.layout === 'minimal' ? 'flex-col items-center' : ''}`}>
                                 <div className={`max-w-[75%] ${slide.layout === 'minimal' ? 'w-full' : ''}`}>
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2 md:mb-4">{slide.title}</h2>
                                    <div className={`h-1 md:h-1.5 w-16 md:w-20 rounded-full ${slide.layout === 'minimal' ? 'mx-auto' : ''}`} style={{ backgroundColor: theme.primaryColor, WebkitPrintColorAdjust: 'exact' }}></div>
                                 </div>
                                 <span className={`text-4xl md:text-6xl font-bold text-slate-100 font-mono print:text-slate-200 ${slide.layout === 'minimal' ? 'hidden' : ''}`}>
                                    {String(index + 1).padStart(2, '0')}
                                 </span>
                            </div>
                           
                           <div className={`flex-grow flex gap-6 md:gap-12 items-start w-full ${
                               slide.layout === 'minimal' ? 'justify-center items-center' :
                               slide.layout === 'content_heavy' ? 'block' :
                               ''
                           }`}>
                               <div className={`space-y-3 md:space-y-6 ${
                                   slide.layout === 'default' ? 'w-full md:w-3/5 order-1' :
                                   slide.layout === 'image_left' ? 'w-full md:w-3/5 order-2' :
                                   slide.layout === 'content_heavy' ? 'w-full columns-1 md:columns-2 gap-12' :
                                   'max-w-3xl'
                               }`}>
                                    {slide.content.map((point, idx) => (
                                        <div key={idx} className={`flex items-start text-base md:text-lg lg:text-xl text-slate-700 leading-relaxed ${slide.layout === 'minimal' ? 'justify-center' : ''} ${slide.layout === 'content_heavy' ? 'break-inside-avoid mb-4 md:mb-6' : ''}`}>
                                            <span 
                                                className={`mt-1.5 md:mt-2.5 mr-3 md:mr-4 w-1.5 md:w-2 h-1.5 md:h-2 rounded-full flex-shrink-0 ${slide.layout === 'minimal' ? 'hidden' : ''}`} 
                                                style={{ backgroundColor: theme.primaryColor, WebkitPrintColorAdjust: 'exact' }}
                                            />
                                            <span>{point}</span>
                                        </div>
                                    ))}
                               </div>

                               {(slide.layout === 'default' || slide.layout === 'image_left') && (
                                 <div className={`hidden md:flex w-2/5 flex-col items-center justify-center ${
                                     slide.layout === 'image_left' ? 'order-1' : 'order-2'
                                 }`}>
                                     {slide.imageUrl ? (
                                         <img 
                                          src={slide.imageUrl} 
                                          alt="Slide visual" 
                                          className="max-h-[200px] md:max-h-[350px] w-full object-contain rounded-lg drop-shadow-md"
                                         />
                                     ) : (
                                         <div className="w-full aspect-square bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-8">
                                             <p className="text-center text-slate-400 text-xs md:text-sm italic">
                                                 {slide.visualPrompt}
                                             </p>
                                         </div>
                                     )}
                                 </div>
                               )}
                           </div>

                            <div className="mt-auto pt-4 flex justify-between text-[10px] md:text-xs font-semibold tracking-wider text-slate-300 uppercase w-full">
                                <span>Confidential - {analysis?.tagline}</span>
                                <span>FounderFrame</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
