import React from 'react';
import { EmotionState } from '../types';

interface AmbientBackgroundProps {
  emotion: EmotionState;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ emotion }) => {
  // Determine animation duration based on energy (inverse: high energy = faster changes)
  // But for the background transition itself, we want it slow and smooth usually.
  const transitionDuration = emotion.energy > 0.8 ? '700ms' : '2000ms';

  return (
    <div
      className="fixed inset-0 -z-10 w-full h-full transition-colors ease-in-out"
      style={{
        backgroundColor: emotion.baseColor,
        transitionDuration: transitionDuration,
      }}
    >
      {/* Decorative Gradient Mesh 1 */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-60 blur-[100px] transition-all ease-in-out"
        style={{
          backgroundColor: emotion.accentColor,
          transitionDuration: '3000ms',
          transform: `scale(${1 + emotion.intensity * 0.5}) translate(${emotion.energy * 20}px, ${emotion.energy * 20}px)`,
        }}
      />
      
      {/* Decorative Gradient Mesh 2 */}
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-40 blur-[120px] transition-all ease-in-out"
        style={{
          backgroundColor: emotion.textColor, // Using text color purely for contrast in gradient
          transitionDuration: '4000ms',
          transform: `scale(${1 + emotion.intensity * 0.3})`,
          mixBlendMode: 'overlay'
        }}
      />
      
       {/* Noise Texture for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} 
      />
    </div>
  );
};
