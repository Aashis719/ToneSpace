
import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { EmotionState, ExpressionMode } from '../types';

interface AudioEngineProps {
  emotion: EmotionState;
  isMuted: boolean;
  onReady?: () => void;
}

const SILENCE_DB = -100;
const MASTER_GAIN = 0.65;

export const AudioEngine: React.FC<AudioEngineProps> = ({ emotion, isMuted, onReady }) => {
  const { expressionMode, energy, intensity } = emotion;

  // Shared audio nodes
  const masterLimiter = useRef<Tone.Limiter | null>(null);
  const masterCompressor = useRef<Tone.Compressor | null>(null);
  const masterBus = useRef<Tone.Volume | null>(null);
  const globalReverb = useRef<Tone.Reverb | null>(null);
  const ambientBed = useRef<{ filter: Tone.Filter, noise: Tone.Noise, lfo: Tone.LFO } | null>(null);

  // State tracking
  const currentMode = useRef<ExpressionMode>('none');
  const activeNodes = useRef<Tone.ToneAudioNode[]>([]);
  const activeSequence = useRef<Tone.Loop | null>(null);
  const isInitialized = useRef(false);

  // Initialize Core Audio Engine
  useEffect(() => {
    const init = async () => {
      // 1. Final chain: Limiter -> Destination
      masterLimiter.current = new Tone.Limiter(-1).toDestination();

      // 2. Compression to glue sounds and prevent spikes
      masterCompressor.current = new Tone.Compressor({
        threshold: -24,
        ratio: 4,
        attack: 0.01,
        release: 0.25
      }).connect(masterLimiter.current);

      // 3. Main gain control
      masterBus.current = new Tone.Volume(SILENCE_DB).connect(masterCompressor.current);

      // 4. Global Reverb
      globalReverb.current = new Tone.Reverb({
        decay: 4,
        preDelay: 0.1,
        wet: 0.3
      }).connect(masterBus.current);
      await globalReverb.current.generate();

      // 5. Ambient Base (Pink Noise for smoothness)
      const airNoise = new Tone.Noise("pink");
      const airFilter = new Tone.Filter(400, "lowpass", -12);
      const airLfo = new Tone.LFO(0.05, 200, 600);

      // Only start if context is already running to avoid console warnings
      if (Tone.getContext().state === 'running') {
        airNoise.start();
        airLfo.start();
      }

      airNoise.connect(airFilter);
      airFilter.connect(masterBus.current);
      airLfo.connect(airFilter.frequency);
      airNoise.volume.value = SILENCE_DB;

      ambientBed.current = { filter: airFilter, noise: airNoise, lfo: airLfo };

      // Set scheduling lookahead for more stability
      Tone.getContext().lookAhead = 0.1;

      isInitialized.current = true;
      if (onReady) onReady();
    };

    init();

    return () => {
      cleanupAudio();
      masterLimiter.current?.dispose();
      masterCompressor.current?.dispose();
      masterBus.current?.dispose();
      globalReverb.current?.dispose();
      ambientBed.current?.noise.dispose();
      ambientBed.current?.filter.dispose();
      ambientBed.current?.lfo.dispose();
    };
  }, []);

  // Handle Mute and Dynamics
  useEffect(() => {
    if (!isInitialized.current || !masterBus.current || !ambientBed.current) return;

    const applyDynamics = async () => {
      if (Tone.getContext().state !== 'running') return;

      try {
        if (!masterBus.current) return;
        Tone.getDestination().mute = isMuted;

        const gainBase = MASTER_GAIN + (intensity * 0.2);
        const targetVol = isMuted ? SILENCE_DB : Tone.gainToDb(Math.max(0.01, gainBase));

        // Use a more stable ramp
        masterBus.current.volume.cancelScheduledValues(Tone.now());
        masterBus.current.volume.rampTo(targetVol, 0.5);

        if (expressionMode !== 'none' && !isMuted && ambientBed.current) {
          const noiseTarget = -55 + (intensity * 10);
          const filterFreq = 300 + (energy * 800);

          ambientBed.current.noise.volume.cancelScheduledValues(Tone.now());
          ambientBed.current.noise.volume.rampTo(noiseTarget, 0.8);

          ambientBed.current.filter.frequency.cancelScheduledValues(Tone.now());
          ambientBed.current.filter.frequency.rampTo(Math.max(20, filterFreq), 0.8);
        } else if (ambientBed.current) {
          ambientBed.current.noise.volume.cancelScheduledValues(Tone.now());
          ambientBed.current.noise.volume.rampTo(SILENCE_DB, 0.4);
        }
      } catch (e) {
        // Silently handle dynamics errors to keep user console clean
      }
    };

    applyDynamics();
  }, [isMuted, intensity, energy, expressionMode]);

  // Handle Mode Transitions
  useEffect(() => {
    if (!isInitialized.current) return;

    const transition = async () => {
      // 1. Handle Mute Case
      if (isMuted) {
        if (currentMode.current !== 'none') {
          cleanupAudio();
          currentMode.current = 'none';
        }
        return;
      }

      // 2. Handle same-mode repeat
      if (expressionMode === currentMode.current) return;

      // 3. Ensure Context
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
        // Start background nodes once running if they exist
        if (ambientBed.current) {
          try {
            ambientBed.current.noise.start();
            ambientBed.current.lfo.start();
          } catch (e) { }
        }
      }

      // 4. Perform Transition
      cleanupAudio();
      currentMode.current = expressionMode;

      if (expressionMode !== 'none') {
        // Slight delay to ensure hardware buffers are clear
        await new Promise(r => setTimeout(r, 60));
        if (currentMode.current === expressionMode && !isMuted) {
          setupExpression(expressionMode);
        }
      }
    };

    transition();
  }, [expressionMode, isMuted]);

  const cleanupAudio = () => {
    // Stop and cancel all scheduled events
    try {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    } catch (e) { }

    if (activeSequence.current) {
      activeSequence.current.stop().dispose();
      activeSequence.current = null;
    }

    const nodes = [...activeNodes.current];
    activeNodes.current = [];

    nodes.forEach(node => {
      try {
        // Disconnect immediately to stop audio signal flow
        node.disconnect();
        // Dispose with a small delay to avoid pops in the engine's internal buffer
        setTimeout(() => {
          try { node.dispose(); } catch (e) { }
        }, 100);
      } catch (e) { }
    });
  };

  const setupExpression = (mode: ExpressionMode) => {
    const ctx = Tone.getContext();
    if (ctx.state !== 'running' || !masterBus.current || !globalReverb.current) return;

    Tone.getTransport().start();

    const connectNode = (node: Tone.ToneAudioNode) => {
      node.connect(globalReverb.current!);
      node.connect(masterBus.current!);
      activeNodes.current.push(node);
      return node;
    };

    // Helper to prevent triggering too many notes
    const triggerSafe = (synth: any, note: any, duration: any, time: any) => {
      if (!synth || synth.disposed) return;
      try {
        // Tone.js 15+ handles polyphony internally but logs warnings. 
        // We catch to prevent UI-level impacts.
        synth.triggerAttackRelease(note, duration, time);
      } catch (e) { }
    };

    switch (mode) {
      case 'melody': {
        // FIX: Moved maxPolyphony out of options object to fix TS error
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          volume: -10,
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 1.5 }
        });
        synth.maxPolyphony = 8;
        connectNode(synth);

        const scale = ["C4", "D4", "E4", "G4", "A4", "C5"];
        activeSequence.current = new Tone.Loop(time => {
          if (Math.random() > 0.4) {
            const note = scale[Math.floor(Math.random() * scale.length)];
            triggerSafe(synth, note, "4n", time);
          }
        }, "4n").start(0);
        break;
      }
      case 'drift': {
        // FIX: Moved maxPolyphony out of options object to fix TS error
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          volume: -12,
          envelope: { attack: 3, decay: 1, sustain: 1, release: 4 }
        });
        synth.maxPolyphony = 12;
        connectNode(synth);

        const chord = ["C3", "G3", "Bb3", "Eb4"];
        activeSequence.current = new Tone.Loop(time => {
          triggerSafe(synth, chord, "2n", time);
        }, "1n").start(0);
        break;
      }
      case 'rhythm': {
        const drum = connectNode(new Tone.MembraneSynth({ volume: -10 })) as Tone.MembraneSynth;
        const tick = connectNode(new Tone.MetalSynth({ volume: -28, envelope: { decay: 0.05, release: 0.05 } })) as Tone.MetalSynth;
        activeSequence.current = new Tone.Loop(time => {
          triggerSafe(drum, "C1", "16n", time);
          if (Math.random() > 0.7) triggerSafe(tick, "G5", "32n", time + 0.125);
        }, "4n").start(0);
        break;
      }
      case 'flow': {
        const synth = connectNode(new Tone.MonoSynth({
          volume: -16,
          oscillator: { type: 'sine' },
          envelope: { attack: 1, release: 2 }
        })) as Tone.MonoSynth;
        activeSequence.current = new Tone.Loop(time => {
          triggerSafe(synth, "F2", "2n", time);
        }, "1n").start(0);
        break;
      }
      case 'pulse': {
        const synth = connectNode(new Tone.MetalSynth({
          volume: -24,
          envelope: { attack: 0.001, decay: 0.02, release: 0.02 }
        })) as Tone.MetalSynth;
        activeSequence.current = new Tone.Loop(time => {
          triggerSafe(synth, "C7", "128n", time);
        }, "8n").start(0);
        break;
      }
      case 'nature': {
        const synth = connectNode(new Tone.MetalSynth({
          volume: -28,
          resonance: 400,
          envelope: { attack: 0.1, release: 0.4 }
        })) as Tone.MetalSynth;
        activeSequence.current = new Tone.Loop(time => {
          if (Math.random() > 0.6) {
            triggerSafe(synth, 400 + Math.random() * 800, "64n", time);
          }
        }, "8n").start(0);
        break;
      }
      case 'chaos': {
        const synth = connectNode(new Tone.FMSynth({ volume: -26, harmonicity: 2.5 })) as Tone.FMSynth;
        activeSequence.current = new Tone.Loop(time => {
          if (Math.random() > 0.5) {
            triggerSafe(synth, Math.random() * 2000, "128n", time);
          }
        }, "16n").start(0);
        break;
      }
      case 'idea': {
        // FIX: Moved maxPolyphony out of options object to fix TS error
        const synth = new Tone.PolySynth(Tone.Synth, {
          volume: -18,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, release: 3 }
        });
        synth.maxPolyphony = 8;
        connectNode(synth);

        activeSequence.current = new Tone.Loop(time => {
          if (Math.random() > 0.85) {
            triggerSafe(synth, 2500 + Math.random() * 2000, "2n", time);
          }
        }, "4n").start(0);
        break;
      }
      case 'love': {
        // Disabled generative logic in favor of the requested YouTube track
        break;
      }
    }
  };

  return (
    <div className="hidden pointer-events-none" aria-hidden="true">
      {expressionMode === 'love' && !isMuted && (
        <iframe
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/aO9KoEaEkMg?autoplay=1&loop=1&playlist=aO9KoEaEkMg&controls=0`}
          allow="autoplay"
          frameBorder="0"
        />
      )}
    </div>
  );
};
