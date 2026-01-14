export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number; // 0-3
  category: 'logic' | 'math' | 'spatial' | 'verbal';
}

export type AppState = 'intro' | 'generating' | 'test' | 'calculating' | 'paywall' | 'result' | 'error';

export interface UserResult {
  rawScore: number; // Correct answers count
  totalQuestions: number;
  estimatedIQ: number;
  percentile: number;
  summary: string;
  generatedDate: string;
  durationSeconds: number; // For commercial analysis
  validity: 'High' | 'Moderate' | 'Low - Rapid Response'; // Academic validity flag
}

export type LanguageCode = 'en' | 'es' | 'zh' | 'fr' | 'de' | 'ja' | 'hi' | 'ar' | 'pt' | 'ru';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  ui: {
    start: string;
    generating: string; // Used for button loading state now
    generatingTest: string; // For dedicated loading screen
    question: string;
    next: string;
    finish: string;
    calculating: string;
    paywallTitle: string;
    paywallDesc: string;
    paywallFeaturesTitle: string;
    paywallFeatures: string[];
    paywallNote: string;
    payButton: string;
    crypto: string;
    card: string;
    resultTitle: string;
    downloadPdf: string;
    iqLabel: string;
    restart: string;
    exit: string;
    errorTitle: string;
    errorDesc: string;
    errorAction: string;
  };
}
