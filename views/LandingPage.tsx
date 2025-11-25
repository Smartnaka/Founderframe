
import React, { useState } from 'react';
import { ArrowRight, TrendingUp, Layout, PieChart, Zap, Rocket, Star, ChevronDown, ChevronUp, Lightbulb, PlayCircle, Hexagon, LogIn, LayoutDashboard } from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  user: User | null;
}

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button 
        className="flex justify-between items-center w-full py-4 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors pr-8">{question}</span>
        {isOpen ? <ChevronUp size={20} className="text-brand-600 flex-shrink-0" /> : <ChevronDown size={20} className="text-slate-400 flex-shrink-0 group-hover:text-brand-600" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">{answer}</p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, user }) => {
  return (
    <div className="h-full overflow-y-auto flex flex-col bg-white animate-fade-in font-sans">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white overflow-hidden shrink-0">
        {/* Abstract Shapes/Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-brand-300 blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-brand-400 blur-[100px] opacity-50"></div>
        </div>

        {/* Navbar */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto right-0">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold text-xl border border-white/30">F</div>
                <span className="font-bold text-white text-lg tracking-tight">FounderFrame</span>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                 <span className="hidden md:inline font-medium text-brand-100">Hi, {user.name}</span>
                 <button 
                    onClick={onGetStarted}
                    className="px-5 py-2 bg-white text-brand-700 hover:bg-brand-50 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 shadow-lg"
                >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                </button>
              </div>
            ) : (
              <button 
                  onClick={onLogin}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
              >
                  <LogIn size={16} />
                  <span>Log In</span>
              </button>
            )}
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-32 pb-24 md:pt-48 md:pb-32 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center space-x-2 bg-brand-800/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-400/30 mb-8 animate-fade-in shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs md:text-sm font-medium text-brand-100 uppercase tracking-wide">Enterprise-Grade Strategy Engine</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Launch your startup <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-200">with AI precision.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-brand-100 max-w-2xl mb-12 leading-relaxed font-light">
                FounderFrame transforms your raw ideas into structured market insights and professional pitch decks instantly using our next-generation neural strategy engine.
            </p>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <button 
                    onClick={onGetStarted}
                    className="w-full md:w-auto group flex items-center justify-center space-x-3 bg-white text-brand-700 hover:bg-brand-50 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_20px_50px_-12px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
                >
                    <span>{user ? 'Continue to Dashboard' : 'Start Building Free'}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-full text-lg font-medium text-white border border-white/20 hover:bg-white/10 transition-all">
                     <PlayCircle size={20} />
                     <span>Watch Demo</span>
                </button>
            </div>
            
            {/* UI Mockup/Visual */}
            <div className="mt-16 md:mt-24 relative w-full max-w-4xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-blue-400 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group cursor-pointer" onClick={onGetStarted}>
                    <div className="grid grid-cols-2 gap-8 p-8 w-full opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-4 w-full bg-slate-800 rounded"></div>
                            <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
                            <div className="h-32 w-full bg-slate-800 rounded mt-4 border border-slate-700"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-48 w-full bg-gradient-to-br from-brand-900 to-brand-700 rounded-lg flex items-center justify-center border border-slate-700">
                                <PieChart className="text-brand-400 opacity-50" size={48} />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-20 w-1/2 bg-slate-800 rounded border border-slate-700"></div>
                                <div className="h-20 w-1/2 bg-slate-800 rounded border border-slate-700"></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white font-mono text-sm shadow-xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Analyzing Market Dynamics...
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Trusted By Strip */}
      <div className="bg-slate-50 border-b border-slate-200 py-10 overflow-hidden shrink-0">
            <div className="max-w-6xl mx-auto px-4">
                <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Empowering founders from next-gen companies</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xl"><Hexagon size={24} className="text-brand-600"/> <span>Vertex</span></div>
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xl"><Zap size={24} className="text-amber-500"/> <span>BoltShift</span></div>
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xl"><TrendingUp size={24} className="text-emerald-500"/> <span>Acme Corp</span></div>
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xl"><Rocket size={24} className="text-purple-500"/> <span>LaunchLab</span></div>
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xl"><Layout size={24} className="text-blue-500"/> <span>Structura</span></div>
                </div>
            </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-24 shrink-0">
          <div className="text-center mb-20">
              <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm">Why FounderFrame?</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Everything you need to validate & pitch</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Stop guessing. Start executing with data-backed strategies generated in seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <PieChart size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Market Sizing</h3>
                  <p className="text-slate-600 leading-relaxed">Get instant estimates for TAM, SAM, and SOM along with a comprehensive competitive landscape analysis based on real industry sectors.</p>
              </div>
              
              <div className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Layout size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Pitch Deck Generation</h3>
                  <p className="text-slate-600 leading-relaxed">Auto-generate a 10-slide investor deck structure complete with content, speaker notes, and AI-generated visual prompts.</p>
              </div>
              
              <div className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Strategic Analysis</h3>
                  <p className="text-slate-600 leading-relaxed">Receive a detailed SWOT analysis and actionable next steps to take your venture from napkin idea to execution.</p>
              </div>
          </div>
      </div>

      {/* How It Works (Dark Section) */}
      <div className="bg-slate-900 text-white py-24 relative overflow-hidden shrink-0">
             {/* Background accents */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[128px] opacity-20 -mr-20 -mt-20"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[96px] opacity-20 -ml-10 -mb-10"></div>
             
             <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">From Napkin to Boardroom</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">Our AI guides you through a proven framework used by successful startups.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                     {[
                        { icon: Lightbulb, title: "1. Ideate", desc: "Input your raw startup concept. No prompt engineering required." },
                        { icon: PieChart, title: "2. Analyze", desc: "AI researches competitors and estimates market size instantly." },
                        { icon: Layout, title: "3. Structure", desc: "Auto-generate a 10-slide pitch deck tailored to your specific niche." },
                        { icon: Rocket, title: "4. Export", desc: "Download as PDF or present directly to potential investors." }
                     ].map((step, idx) => (
                        <div key={idx} className="relative group">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-brand-400 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 border border-slate-700 shadow-lg">
                                <step.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-300 transition-colors">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
                            
                            {/* Connector Line (Desktop) */}
                            {idx < 3 && (
                                <div className="hidden md:block absolute top-8 left-16 w-[calc(100%-4rem)] h-0.5 bg-slate-800 z-0">
                                    <div className="h-full bg-brand-600 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                                </div>
                            )}
                        </div>
                     ))}
                </div>
             </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 max-w-6xl mx-auto px-4 bg-white shrink-0">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">Don't just take our word for it</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { 
                        quote: "I went from a vague idea to a structured pitch deck in 15 minutes. This tool is a cheat code.", 
                        author: "Sarah Anyanwu", 
                        role: "Founder, EcoEats", 
                        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80"
                    },
                    { 
                        quote: "The market sizing analysis was surprisingly accurate. It saved me weeks of manual research.", 
                        author: "David Okafor", 
                        role: "Product Manager", 
                        image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80" 
                    },
                    { 
                        quote: "Finally, a tool that focuses on the business strategy, not just pretty slides.", 
                        author: "Zainab Diallo", 
                        role: "Serial Entrepreneur", 
                        image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=150&q=80" 
                    }
                ].map((t, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative hover:shadow-lg transition-shadow">
                        <div className="flex text-amber-400 mb-4 space-x-1">
                            {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-slate-700 italic mb-6 text-lg leading-relaxed">"{t.quote}"</p>
                        <div className="flex items-center mt-auto">
                            <img 
                                src={t.image} 
                                alt={t.author} 
                                className="w-10 h-10 rounded-full object-cover mr-3 border border-slate-200 shadow-sm"
                            />
                            <div>
                                <div className="font-bold text-slate-900">{t.author}</div>
                                <div className="text-sm text-slate-500">{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-50 py-24 border-t border-slate-200 shrink-0">
             <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-slate-500">Have questions? We're here to help.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 md:p-4 divide-y divide-slate-100">
                     <div className="p-2">
                        <FaqItem question="Is the market data real-time?" answer="Our AI estimates market sizes based on the latest available industry reports and economic data patterns to provide a realistic baseline for your pitch. While highly accurate for framing, we recommend verifying specific numbers for final due diligence." />
                     </div>
                     <div className="p-2">
                        <FaqItem question="Can I export to PowerPoint?" answer="Currently we support high-quality PDF exports and individual slide image downloads (PNG/JPG) which can be dropped into any presentation software like PowerPoint, Keynote, or Google Slides." />
                     </div>
                     <div className="p-2">
                        <FaqItem question="Do you own my startup idea?" answer="Absolutely not. Your data is processed securely and we claim no ownership over the intellectual property generated within the platform. Your ideas remain 100% yours." />
                     </div>
                     <div className="p-2">
                        <FaqItem question="Is this tool free?" answer="Yes, FounderFrame is currently free to use. You can generate unlimited strategies and pitch decks." />
                     </div>
                </div>
             </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white py-24 border-t border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-block p-4 bg-brand-50 rounded-3xl mb-8">
                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                    <Rocket size={32} />
                </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Ready to launch your idea?</h2>
            <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">Join thousands of founders using AI to streamline their strategic planning and fundraising.</p>
            <button 
                onClick={onGetStarted}
                className="bg-slate-900 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
                {user ? 'Continue to Dashboard' : 'Start Your Journey'}
            </button>
        </div>
      </div>

       {/* Footer */}
       <div className="border-t border-slate-200 py-12 bg-slate-50 shrink-0">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                     <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-white font-bold text-xs">F</div>
                     <span className="font-bold text-slate-700">FounderFrame</span>
                </div>
                <div className="flex space-x-6">
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Contact Support</a>
                </div>
                <p className="mt-4 md:mt-0">© {new Date().getFullYear()} FounderFrame AI. All rights reserved.</p>
            </div>
       </div>
    </div>
  );
};
