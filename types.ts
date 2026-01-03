export type ExpressionMode = 
  | 'melody' 
  | 'rhythm' 
  | 'drift' 
  | 'pulse' 
  | 'flow' 
  | 'nature' 
  | 'chaos'  
  | 'idea'   
  | 'love'   
  | 'none';

export interface EmotionState {
  primaryEmotion: string;
  intensity: number; 
  energy: number; 
  baseColor: string; 
  accentColor: string; 
  textColor: string; 
  expressionMode: ExpressionMode;
  reply?: string;
}

export interface AnalysisResponse {
  primaryEmotion: string;
  expressionMode: 'Melody' | 'Rhythm' | 'Drift' | 'Flow' | 'Pulse' | 'Nature' | 'Chaos' | 'Idea' | 'Love';
  intensity: number;
  energy: number;
  colors: {
    baseColor: string;
    accentColor: string;
    textColor: string;
  };
  reply: string;
}

export enum UIState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  ADAPTED = 'ADAPTED',
  ERROR = 'ERROR'
}