
import React, { useMemo } from 'react';
import { EmotionState, ExpressionMode } from '../types';

interface ExpressiveLayerProps {
  emotion: EmotionState;
}

const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Professional SVG Icon Library for each mode
// Fix: Used React.ReactElement[] instead of JSX.Element[] to resolve "Cannot find namespace 'JSX'" error.
const ICON_LIBRARY: Record<string, React.ReactElement[]> = {
  melody: [
    <path d="M9 18V5l12-2v13" />, <circle cx="6" cy="18" r="3" />, <circle cx="18" cy="16" r="3" />,
    <path d="M12 19V5" />, <path d="M19 11V5" />, <path d="M5 11l7-3 7 3" />
  ],
  nature: [
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8h-3a3 3 0 0 0-3 3v7z" />,
    <path d="M7 20h.01" />, <path d="M10 20h.01" />, <path d="M13 20h.01" />,
    <path d="M12 2v20" />, <path d="M2 12h20" />, <circle cx="12" cy="12" r="3" />
  ],
  chaos: [
    <path d="M3 3h18v18H3z" />, <path d="m3 3 18 18" />, <path d="m21 3-18 18" />,
    <path d="M8 8h8v8H8z" />, <path d="M2 12h20" />, <path d="M12 2v20" />
  ],
  idea: [
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />,
    <path d="M12 2v4" />, <path d="M12 18v4" />, <path d="M4.93 4.93l2.83 2.83" />, <path d="M16.24 16.24l2.83 2.83" />,
    <path d="M2 12h4" />, <path d="M18 12h4" />, <path d="M4.93 19.07l2.83-2.83" />, <path d="M16.24 7.76l2.83-2.83" />
  ],
  love: [
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
    <path d="M12 10.5V12" />, <path d="M12 6.5V8" />, <path d="M10 8.5H8.5" />, <path d="M15.5 8.5H14" />
  ],
  drift: [
    <circle cx="12" cy="12" r="10" />, <circle cx="12" cy="12" r="6" />, <circle cx="12" cy="12" r="2" />,
    <path d="M12 2v20" />, <path d="M2 12h20" />
  ],
  pulse: [
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />, <path d="M12 2v20" />, <path d="M2 12h20" />
  ],
  flow: [
    <path d="M2 12h20" />, <path d="m15 5 7 7-7 7" />, <path d="m8 5 7 7-7 7" />,
    <path d="M2 7h16" />, <path d="M2 17h16" />
  ],
  rhythm: [
    <path d="M2 10v4" />, <path d="M6 6v12" />, <path d="M10 3v18" />, <path d="M14 8v8" />, <path d="M18 5v14" />, <path d="M22 10v4" />
  ]
};

export const ExpressiveLayer: React.FC<ExpressiveLayerProps> = ({ emotion }) => {
  const { expressionMode, energy, intensity, accentColor } = emotion;

  const particles = useMemo(() => {
    const countMap: Record<ExpressionMode, number> = {
      melody: 25, rhythm: 25, drift: 50, flow: 40, pulse: 20, nature: 35, chaos: 60, idea: 40, love: 30, none: 0
    };
    
    const count = countMap[expressionMode] || 0;
    const modeKey = expressionMode.toLowerCase();
    const icons = ICON_LIBRARY[modeKey] || [];

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: random(0, 100),
      y: random(0, 100),
      size: random(0.6, 1.4),
      delay: random(0, 8),
      duration: random(4, 10),
      iconIndex: Math.floor(random(0, icons.length)),
      rotation: random(0, 360),
    }));
  }, [expressionMode]);

  if (expressionMode === 'none') return null;
  const speedMultiplier = 2.5 - (energy * 1.8); 

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes floatUp { 
          0% { transform: translateY(110vh) rotate(var(--rotation)); opacity: 0; } 
          15% { opacity: var(--max-opacity); } 
          100% { transform: translateY(-15vh) rotate(calc(var(--rotation) + 20deg)); opacity: 0; } 
        }
        @keyframes vibrate { 
          0%, 100% { transform: translate(0,0) rotate(var(--rotation)); } 
          25% { transform: translate(3px, -3px) rotate(calc(var(--rotation) - 2deg)); } 
          50% { transform: translate(-3px, 3px) rotate(calc(var(--rotation) + 2deg)); } 
          75% { transform: translate(2px, 2px) rotate(var(--rotation)); } 
        }
        @keyframes sink { 
          0% { transform: scale(1.4) translateY(-20vh) rotate(var(--rotation)); opacity: 0; } 
          30% { opacity: calc(var(--max-opacity) * 0.8); } 
          100% { transform: scale(0.6) translateY(110vh) rotate(calc(var(--rotation) - 15deg)); opacity: 0; } 
        }
        @keyframes subtleScale {
          0%, 100% { transform: scale(1) rotate(var(--rotation)); }
          50% { transform: scale(1.1) rotate(var(--rotation)); }
        }
      `}</style>
      
      {particles.map((p) => {
        const modeKey = expressionMode.toLowerCase();
        const iconSet = ICON_LIBRARY[modeKey] || [];
        const icon = iconSet[p.iconIndex];

        return (
          <div key={p.id} className="absolute opacity-0"
            style={{
              left: `${p.x}%`, 
              top: expressionMode === 'pulse' ? `${p.y}%` : 'auto',
              color: accentColor, 
              width: `${p.size * 32}px`,
              height: `${p.size * 32}px`,
              animationName: expressionMode === 'drift' ? 'sink' : expressionMode === 'pulse' ? 'vibrate' : 'floatUp',
              animationDuration: expressionMode === 'pulse' ? '0.15s' : `${p.duration * speedMultiplier + 5}s`,
              animationDelay: `${p.delay}s`, 
              animationIterationCount: 'infinite',
              '--max-opacity': 0.15 + (intensity * 0.45),
              '--rotation': `${p.rotation}deg`,
            } as React.CSSProperties}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-full h-full drop-shadow-sm"
              style={{ opacity: 0.8 }}
            >
              {icon}
            </svg>
          </div>
        );
      })}
    </div>
  );
};
