
import React, { useState } from 'react';
import { EmotionState } from '../types';

interface FooterProps {
    emotion: EmotionState;
}

export const Footer: React.FC<FooterProps> = ({ emotion }) => {
    const [showAbout, setShowAbout] = useState(false);

    return (
        <>
            <footer
                className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-10 pointer-events-none"
            >
                <div className="max-w-7xl mx-auto flex flex-row justify-between items-center px-2">

                    {/* Left Side: Brand & Credit */}
                   <div
  className="flex items-center gap-2 px-2.5 py-1 md:px-5 md:py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto transition-all duration-500 hover:bg-black/70 group"
>
  <div className="flex items-center gap-2 md:gap-3 text-[7px] md:text-[10px] font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase text-white">
    <span className="opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap sm:inline">
      ToneSpace
    </span>

    <div className="w-1 h-[1px] md:w-1.5 bg-white/20 sm:block" />

    <div className="relative">
      <a
        href="https://x.com/Aashis_19"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 md:gap-1.5 transition-all"
      >
        <span className="opacity-90 group-hover:opacity-100 italic">By</span>

        <span className="relative font-black tracking-widest bg-white/20 px-1.5 py-0.5 rounded-md group-hover:bg-white/30 transition-colors uppercase cursor-pointer">
          AASHIS

          {/* Tooltip with official X SVG logo */}
          <span className="absolute -top-12 left-1/ -translate-x-1/2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none">
            <span className="w-8 h-8 rounded-full bg-black/80 flex items-center justify-center shadow-lg">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/0a/X_logo_2023_%28white%29.svg"
                alt="X Logo"
                className="w-4 h-4 object-contain"
              />
            </span>
          </span>
        </span>
      </a>
    </div>
  </div>
</div>


                    {/* Right Side: Documentation Toggle */}
                    <div className="pointer-events-auto">
                        <button
                            onClick={() => setShowAbout(true)}
                            className="group flex items-center gap-2 md:gap-3 px-2.5 py-1 md:px-5 md:py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg transition-all duration-500 hover:bg-black/70 hover:-translate-y-1 active:scale-95 translate-y-0"
                        >
                            <span className="text-[7px] md:text-[10px] font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                Overview
                            </span>
                            <div className="flex items-center justify-center border border-white/20 rounded-md px-1 py-0.5 md:px-2 md:py-1 bg-white/20 group-hover:bg-white/30 transition-colors">
                                <span className="text-[6px] md:text-[9px] font-mono font-bold text-white uppercase">V0.1</span>
                            </div>
                        </button>
                    </div>

                </div>
            </footer>

            {/* Modern Professional Document Overlay */}
            {showAbout && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-sm transition-all duration-500 animate-in fade-in overflow-y-auto">
                    <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

                    <div
                        className="relative w-full max-w-2xl my-auto bg-white rounded-[32px] md:rounded-[40px] p-8 py-6 md:p-12 md:py-6 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.3)] border border-black/5 transition-transform duration-700 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar"
                        style={{ color: '#1a1a1a' }}
                    >
                        {/* Close button - Fixed to top-right of modal */}
                        <button
                            onClick={() => setShowAbout(false)}
                            className="sticky float-right -mt-2 -mr-2 md:-mt-4 md:-mr-4 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-black/5 transition-all duration-300 hover:rotate-90 active:scale-90 z-20"
                            style={{ color: '#1a1a1a' }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <div className="space-y-10 md:space-y-12 clear-both">
                            <header className="space-y-4 md:space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 md:w-8 h-[1px] bg-current opacity-20" />
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
                                        Technical Abstract
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-light tracking-tighter leading-none text-black">
                                    Tone <span className="italic block mt-1" style={{ color: emotion.accentColor }}>Space</span>
                                </h2>
                                <p className="text-lg md:text-xl opacity-70 leading-relaxed font-light max-w-lg">
                                    A generative mirror designed to bridge the gap between abstract human sentiment and digital form. 
                                </p>
                            </header>

                            <div className="grid md:grid-cols-2 gap-10 md:gap-12 pt-2 md:pt-4">
                                <section className="space-y-4 md:space-y-5">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black/5 pb-2 opacity-50">Core Logic</h3>
                                    <div className="space-y-4 text-[13px] leading-relaxed opacity-80 font-light">
                                        <p>
                                            <strong className="font-semibold block mb-1 text-black">Sentiment Mapping</strong>
                                            Distills text into intensity and energy vectors using Gemini-3-Flash.
                                        </p>
                                        <p>
                                            <strong className="font-semibold block mb-1 text-black">Sympathetic Audio</strong>
                                            Real-time synthesis via Tone.js, creating unique harmonic signatures.
                                        </p>
                                    </div>
                                </section>
                                <section className="space-y-4 md:space-y-5">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black/5 pb-2 opacity-50">Visual Engine</h3>
                                    <div className="space-y-4 text-[13px] leading-relaxed opacity-80 font-light">
                                        <p>
                                            <strong className="font-semibold block mb-1 text-black">Procedural Canvas</strong>
                                            GPU-accelerated SVG particles and CSS gradients that adapt to metabolic shifts.
                                        </p>
                                        <p>
                                            <strong className="font-semibold block mb-1 text-black">Dynamic Layout</strong>
                                            Physical padding and scaling response to emotional "weight."
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <footer className="pt-6 md:pt-8 flex justify-between items-end border-t border-black/5">
                                <div className="space-y-1">
                                    <p className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-30 font-bold">Document v0.1</p>
                                    <p className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-30 font-mono">Build 2026</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center opacity-50 style={{ color: emotion.accentColor }}">
                                    <svg width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        style={{ color: emotion.accentColor, borderColor: emotion.accentColor }}                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                            </footer>
                        </div>
                    </div>
                    {/* Click outside to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setShowAbout(false)} />
                </div>
            )}
        </>
    );
};
