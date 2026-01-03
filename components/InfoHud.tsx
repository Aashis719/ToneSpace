import React from 'react';
import { EmotionState } from '../types';

interface InfoHudProps {
  emotion: EmotionState;
  isAnalyzing: boolean;
}

export const InfoHud: React.FC<InfoHudProps> = ({ emotion, isAnalyzing }) => {
  return (
    <div 
      className="absolute top-6 left-6 md:top-10 md:left-10 flex flex-col gap-1 transition-all duration-1000"
      style={{ color: emotion.textColor, opacity: isAnalyzing ? 0.3 : 0.6 }}
    >
      <div className="flex items-center gap-2">
        <div 
            className="w-1.5 h-1.5 rounded-full transition-colors duration-1000" 
            style={{ backgroundColor: emotion.accentColor }}
        />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50">
          Reflection
        </span>
      </div>
      
      <h1 className="text-2xl md:text-4xl font-light tracking-tight capitalize transition-all duration-1000 mb-4">
        {emotion.primaryEmotion}
      </h1>

      <div className="space-y-3 opacity-40 text-[9px] font-mono hidden md:block">
        <div className="flex items-center gap-4">
          <span className="w-16">INTENSITY</span>
          <div className="w-32 h-[1px] bg-current opacity-20 relative">
             <div 
                className="absolute inset-y-0 left-0 bg-current transition-all duration-1000 ease-out"
                style={{ width: `${emotion.intensity * 100}%` }}
             />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16">ENERGY</span>
           <div className="w-32 h-[1px] bg-current opacity-20 relative">
             <div 
                className="absolute inset-y-0 left-0 bg-current transition-all duration-1000 ease-out"
                style={{ width: `${emotion.energy * 100}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
};