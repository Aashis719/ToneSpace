import React, { useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { EmotionState, UIState } from './types';
import { analyzeEmotion } from './services/geminiService';
import { AmbientBackground } from './components/AmbientBackground';
import { InfoHud } from './components/InfoHud';
import { ExpressiveLayer } from './components/ExpressiveLayer';
import { AudioEngine } from './components/AudioEngine';
import { AudioToggle } from './components/AudioToggle';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';

const INITIAL_EMOTION: EmotionState = {
  primaryEmotion: 'Waiting',
  intensity: 0.1,
  energy: 0.5,
  baseColor: '#f3f4f6',
  accentColor: '#9ca3af',
  textColor: '#1f2937',
  expressionMode: 'none',
  reply: "I'm right here when you're ready to share."
};

export default function App() {
  const [emotion, setEmotion] = useState<EmotionState>(INITIAL_EMOTION);
  const [uiState, setUiState] = useState<UIState>(UIState.IDLE);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const lastProcessedText = useRef<string>('');

  const handleToggleAudio = async () => {
    // Robust context activation
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    setIsMuted(prev => !prev);
  };

  const handleAnalysis = useCallback(async () => {
    if (!inputText.trim() || inputText === lastProcessedText.current || uiState === UIState.ANALYZING) return;

    // Pre-emptively start audio context on user action if unmuted
    if (!isMuted && Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    setUiState(UIState.ANALYZING);
    try {
      const res = await analyzeEmotion(inputText);
      setEmotion({
        primaryEmotion: res.primaryEmotion,
        intensity: res.intensity,
        energy: res.energy,
        baseColor: res.colors.baseColor,
        accentColor: res.colors.accentColor,
        textColor: res.colors.textColor,
        expressionMode: res.expressionMode.toLowerCase() as any,
        reply: res.reply
      });
      lastProcessedText.current = inputText;
      setUiState(UIState.ADAPTED);
    } catch (error: any) {

      if (error.message === "QUOTA_EXHAUSTED") {
        setEmotion(prev => ({
          ...prev,
          reply: "The reflection pool is full for now. Please wait.."
        }));
      } else {
        setUiState(UIState.ERROR);
      }
    } finally {
      setTimeout(() => {
        setUiState(prev => prev === UIState.ERROR ? UIState.ERROR : UIState.IDLE);
      }, 500);
    }
  }, [inputText, uiState, isMuted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalysis();
    }
  };

  const containerPadding = emotion.intensity > 0.7 ? 'p-4 md:p-12' : 'p-6 md:p-32';
  const maxWidth = emotion.intensity > 0.7 ? 'max-w-md md:max-w-xl' : 'max-w-lg md:max-w-3xl';

  return (
    <>
      <LoadingScreen />
      <AmbientBackground emotion={emotion} />
      <ExpressiveLayer emotion={emotion} />
      <AudioEngine emotion={emotion} isMuted={isMuted} onReady={() => setIsAudioReady(true)} />
      <AudioToggle
        isMuted={isMuted}
        onToggle={handleToggleAudio}
        color={emotion.textColor}
        isReady={isAudioReady}
        isAnalyzing={uiState === UIState.ANALYZING}
      />

      <main className={`relative min-h-[100dvh] flex flex-col justify-center items-center transition-all duration-1000 ease-in-out ${containerPadding} overflow-hidden`}>
        <InfoHud emotion={emotion} isAnalyzing={uiState === UIState.ANALYZING} />

        <div className={`w-full ${maxWidth} transition-all duration-1000 z-10 relative mt-20 md:mt-0`}>
          <div className="relative group" style={{ transform: `scale(${1 + emotion.energy * 0.02})`, transition: 'transform 1000ms ease-out' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How does it feel?"
              className="w-full bg-white/10 backdrop-blur-md rounded-[2rem] p-6 md:p-10 shadow-2xl resize-none outline-none border border-white/20 text-xl md:text-2xl transition-all duration-500 placeholder-current"
              style={{ color: emotion.textColor, minHeight: emotion.energy > 0.6 ? '180px' : '140px', boxShadow: `0 20px 50px -10px ${emotion.accentColor}40` }}
              disabled={uiState === UIState.ANALYZING}
            />
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-3">
              <span className="text-[10px] opacity-40 font-bold hidden md:block tracking-widest" style={{ color: emotion.textColor }}>PRESS ENTER</span>
              <button onClick={handleAnalysis} disabled={!inputText.trim() || uiState === UIState.ANALYZING} className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg group" style={{ backgroundColor: emotion.accentColor, color: emotion.baseColor }}>
                {uiState === UIState.ANALYZING ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                )}
              </button>
            </div>
          </div>
          <div className="mt-6 md:mt-8 text-center transition-opacity duration-1000 px-4" style={{ color: emotion.textColor }}>
            <p className="text-sm md:text-xl font-light italic opacity-70 max-w-lg mx-auto leading-relaxed">
              {uiState === UIState.ANALYZING ? "Processing sense-data..." : emotion.reply}
            </p>
          </div>
        </div>
      </main>
      <Footer emotion={emotion} />
    </>
  );
}
