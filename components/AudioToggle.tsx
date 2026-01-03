import React from 'react';

interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  color: string;
  isReady: boolean;
  isAnalyzing: boolean;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ isMuted, onToggle, color, isReady, isAnalyzing }) => {
  return (
    <div className="fixed top-6 right-6 md:top-10 md:right-10 z-50 flex flex-col items-center gap-2">
      <button
        onClick={onToggle}
        aria-label={isMuted ? "Unmute Ambient Audio" : "Mute Ambient Audio"}
        title="Toggle Audio"
        className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-500 bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 group shadow-lg overflow-visible"
        style={{ color }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Subtle Outer Spinner while not ready */}
          {!isReady && (
            <div className="absolute inset-[-4px] flex items-center justify-center pointer-events-none">
              <svg className="animate-spin w-full h-full opacity-30" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          )}
          
          {/* Main Icon */}
          <div className={`transition-all duration-500 ${!isReady ? 'opacity-30 scale-75' : 'opacity-100 scale-100'}`}>
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            )}
          </div>

          {/* Activity Dot */}
          {(isAnalyzing || (!isMuted && isReady)) && (
            <span 
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-current ${isAnalyzing ? 'animate-pulse' : 'animate-ping'}`}
              style={{ animationDuration: isAnalyzing ? '0.6s' : '3s' }}
            />
          )}
        </div>
      </button>
      
      {/* Smart, small status text */}
      {!isReady && (
        <span className="text-[9px] font-mono tracking-widest opacity-30 uppercase animate-pulse" style={{ color }}>
          Syncing
        </span>
      )}
    </div>
  );
};
