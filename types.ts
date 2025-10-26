
export enum ThreatRating {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface AudioSample {
  id: string;
  name: string;
  audioSrc?: string;
}

export interface Keyword {
  id:string;
  term: string;
  initialRating: ThreatRating;
  samples: AudioSample[];
}

export interface Alert {
  id: string;
  timestamp: string;
  keywordDetected: string;
  threatRating: ThreatRating;
  semanticSummary: string;
  fullTranscript: string;
  audioSrc?: string;
  analysisState?: 'preliminary' | 'complete';
  englishTranslation?: string;
}

// Response from the fast, initial scan
export interface InitialScanResponse {
  keyword_detected: string;
  threat_rating: ThreatRating;
  full_transcript: string;
}

// Response from the deep, thinking-enabled analysis
export interface DeepAnalysisResponse {
    threat_rating: ThreatRating;
    semantic_summary: string;
    english_translation: string;
}

export interface GeminiAnalysisResponse {
  threat_rating: ThreatRating;
  semantic_summary: string;
  full_transcript: string;
  english_translation: string;
}

// New interface for the audio scan feature's response
export interface ScanAnalysisResponse extends GeminiAnalysisResponse {
  keyword_detected: string;
}