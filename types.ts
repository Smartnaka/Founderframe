
export enum AppStep {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  IDEA = 'IDEA',
  INSIGHTS = 'INSIGHTS',
  PITCH = 'PITCH',
  EXPORT = 'EXPORT'
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface MarketSize {
  tam: number; // Total Addressable Market (in Billions/Millions)
  sam: number; // Serviceable Available Market
  som: number; // Serviceable Obtainable Market
  currency: string;
  unit: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface MarketAnalysis {
  tagline: string;
  problemSummary: string;
  solutionSummary: string;
  targetAudience: string[];
  competitors: { name: string; weakness: string }[];
  marketSize: MarketSize;
  swot: SwotAnalysis;
  valueProposition: string;
  revenueModel: string;
  goToAction: string;
}

export type SlideLayout = 'default' | 'image_left' | 'minimal' | 'content_heavy';

export interface Slide {
  id: string;
  title: string;
  type: 'title' | 'problem' | 'solution' | 'market' | 'business_model' | 'team' | 'generic';
  content: string[]; // Bullet points
  visualPrompt: string; // Description for a potential image
  speakerNotes: string;
  imageUrl?: string; // Base64 image data
  isLoadingImage?: boolean;
  layout: SlideLayout;
}

export interface PitchTheme {
  id: string;
  name: string;
  primaryColor: string; // Hex
  accentColor: string; // Hex (usually light version of primary)
  font: string;
}

export interface StartupState {
  ideaRaw: string;
  isAnalyzing: boolean;
  analysis: MarketAnalysis | null;
  pitchDeck: Slide[];
  isGeneratingPitch: boolean;
  theme: PitchTheme;
}
