import React from 'react';
import { MarketAnalysis } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, Users, Zap, ShieldAlert, ArrowRight, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

interface MarketInsightsProps {
  analysis: MarketAnalysis;
  onContinue: () => void;
  isGeneratingPitch: boolean;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ analysis, onContinue, isGeneratingPitch }) => {
  const marketData = [
    { name: 'TAM', value: analysis.marketSize.tam, fill: '#93c5fd' }, // brand-300
    { name: 'SAM', value: analysis.marketSize.sam, fill: '#3b82f6' }, // brand-500
    { name: 'SOM', value: analysis.marketSize.som, fill: '#1d4ed8' }, // brand-700
  ];

  const formatCurrency = (val: number) => {
    return `${analysis.marketSize.currency}${val}${analysis.marketSize.unit}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:py-10 space-y-6 md:space-y-8 animate-fade-in pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Strategic Framework</h2>
           <p className="text-slate-500">Analysis for: <span className="italic font-medium text-slate-700">"{analysis.tagline}"</span></p>
        </div>
        <button
          onClick={onContinue}
          disabled={isGeneratingPitch}
          className="w-full md:w-auto flex justify-center items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
        >
            {isGeneratingPitch ? <span>Building Deck...</span> : <span>Build Pitch Deck</span>}
            {!isGeneratingPitch && <ArrowRight size={18} />}
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Value Prop - Full Width */}
        <div className="col-span-1 md:col-span-12 bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-start space-x-4">
                <Zap className="mt-1 text-yellow-300 flex-shrink-0" size={28} />
                <div>
                    <h3 className="text-lg font-semibold text-brand-100 uppercase tracking-wider text-xs mb-2">Value Proposition</h3>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed">"{analysis.valueProposition}"</p>
                </div>
            </div>
            {/* Background decoration */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>

        {/* Problem & Solution */}
        <div className="md:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
            <h3 className="flex items-center text-rose-600 font-bold mb-4">
                <div className="p-1.5 bg-rose-100 rounded-md mr-2"><ShieldAlert size={18}/></div>
                Problem
            </h3>
            <p className="text-slate-700 text-lg leading-relaxed flex-grow">{analysis.problemSummary}</p>
        </div>
        <div className="md:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
            <h3 className="flex items-center text-emerald-600 font-bold mb-4">
                <div className="p-1.5 bg-emerald-100 rounded-md mr-2"><Target size={18}/></div>
                Solution
            </h3>
            <p className="text-slate-700 text-lg leading-relaxed flex-grow">{analysis.solutionSummary}</p>
        </div>

        {/* SWOT Analysis - Full Width */}
        {analysis.swot && (
          <div className="col-span-1 md:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
               <h3 className="font-bold text-slate-800 flex items-center">
                 <TrendingUp className="mr-2 text-brand-600" size={20} />
                 SWOT Analysis
               </h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Strengths */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-emerald-50/30">
                  <h4 className="font-semibold text-emerald-800 flex items-center mb-4 text-sm uppercase tracking-wide">
                    <CheckCircle size={16} className="mr-2" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.swot.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Weaknesses */}
                <div className="p-6 border-b border-slate-200 bg-rose-50/30">
                   <h4 className="font-semibold text-rose-800 flex items-center mb-4 text-sm uppercase tracking-wide">
                    <Ban size={16} className="mr-2" /> Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {analysis.swot.weaknesses.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Opportunities */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-blue-50/30">
                   <h4 className="font-semibold text-blue-800 flex items-center mb-4 text-sm uppercase tracking-wide">
                    <Zap size={16} className="mr-2" /> Opportunities
                  </h4>
                   <ul className="space-y-2">
                    {analysis.swot.opportunities.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Threats */}
                <div className="p-6 bg-amber-50/30">
                   <h4 className="font-semibold text-amber-800 flex items-center mb-4 text-sm uppercase tracking-wide">
                    <AlertTriangle size={16} className="mr-2" /> Threats
                  </h4>
                   <ul className="space-y-2">
                    {analysis.swot.threats.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
          </div>
        )}

        {/* Market Sizing Chart */}
        <div className="col-span-1 md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
            <h3 className="flex items-center text-slate-800 font-bold mb-4">
                <DollarSign className="mr-2 text-brand-600" size={20}/> Market Potential
            </h3>
            {/* Wrapper with explicit dimensions for Recharts reliability */}
            <div className="w-full flex-grow relative" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={marketData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {marketData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[80%] text-center pointer-events-none">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">SOM</div>
                    <div className="font-bold text-slate-900 text-lg">{formatCurrency(analysis.marketSize.som)}</div>
                </div>
            </div>
        </div>

        {/* Target Audience */}
        <div className="col-span-1 md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="flex items-center text-slate-800 font-bold mb-4">
                <Users className="mr-2 text-brand-600" size={20}/> Target Audience
            </h3>
            <ul className="space-y-3">
                {analysis.targetAudience.map((persona, idx) => (
                    <li key={idx} className="flex items-start bg-slate-50 p-3 rounded-lg">
                        <span className="inline-block w-2 h-2 bg-brand-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-700 font-medium">{persona}</span>
                    </li>
                ))}
            </ul>
        </div>

        {/* Competitors */}
        <div className="col-span-1 md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="flex items-center text-slate-800 font-bold mb-4">
                <ShieldAlert className="mr-2 text-brand-600" size={20}/> Competition
            </h3>
            <div className="space-y-3">
                {analysis.competitors.map((comp, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-slate-900 text-sm">{comp.name}</div>
                        <div className="text-xs text-slate-500 mt-1">Weakness: <span className="text-slate-700">{comp.weakness}</span></div>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Plan */}
         <div className="col-span-1 md:col-span-12 bg-slate-900 text-slate-200 p-6 rounded-xl shadow-inner flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
            <div className="p-2 bg-slate-800 rounded-lg"><Target size={24} className="text-brand-400"/></div>
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Recommended Next Step</h3>
                <p className="text-white font-medium text-lg">{analysis.goToAction}</p>
            </div>
        </div>

      </div>
    </div>
  );
};