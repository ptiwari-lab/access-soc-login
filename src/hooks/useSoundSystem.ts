import { useRef, useCallback, useEffect } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';

/**
 * Web Audio API synthesizer — generates all sounds procedurally,
 * no external audio files. Sounds:
 *  - keyclick: short futuristic beep on typing
 *  - submit:   high-pitched processing sweep on login submit
 *  - error:    low error buzz on failed validation
 *  - siren:    dual-tone emergency siren pulses at stage >= 5
 */
export function useSoundSystem(stageRef: { current: Stage }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const sirenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSirenStageRef = useRef<Stage>(0);
  const enabledRef = useRef<boolean>(true);

  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    } catch {
      return null;
    }
    return ctxRef.current;
  }, []);

  /* resume on first user gesture — browsers suspend until interaction */
  useEffect(() => {
    const resume = () => {
      const ctx = ensureCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [ensureCtx]);

  /* ── primitive tone helper ── */
  const tone = useCallback((opts: {
    freq: number; freqEnd?: number; duration: number;
    type?: OscillatorType; gain?: number; delay?: number;
  }) => {
    const ctx = ensureCtx();
    if (!ctx || !masterRef.current || !enabledRef.current) return;
    const now = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.freq, now);
    if (opts.freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), now + opts.duration);
    }
    const g = opts.gain ?? 0.3;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(g, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);
    osc.connect(gain);
    gain.connect(masterRef.current);
    osc.start(now);
    osc.stop(now + opts.duration + 0.05);
  }, [ensureCtx]);

  /* ── public sound triggers ── */
  const keyClick = useCallback(() => {
    tone({ freq: 1800 + Math.random() * 400, duration: 0.04, type: 'square', gain: 0.08 });
  }, [tone]);

  const submitSweep = useCallback(() => {
    tone({ freq: 400, freqEnd: 2400, duration: 0.5, type: 'sawtooth', gain: 0.12 });
    tone({ freq: 800, freqEnd: 3200, duration: 0.5, type: 'sine', gain: 0.06, delay: 0.02 });
  }, [tone]);

  const errorBuzz = useCallback(() => {
    tone({ freq: 160, freqEnd: 90, duration: 0.35, type: 'square', gain: 0.2 });
    tone({ freq: 120, freqEnd: 70, duration: 0.4, type: 'sawtooth', gain: 0.1, delay: 0.05 });
  }, [tone]);

  const sirenPulse = useCallback(() => {
    /* dual-tone emergency siren — two alternating tones */
    tone({ freq: 760, freqEnd: 980, duration: 0.5, type: 'sawtooth', gain: 0.15 });
    tone({ freq: 380, freqEnd: 490, duration: 0.5, type: 'square', gain: 0.08 });
  }, [tone]);

  /* ── manage the looping emergency siren based on stage ── */
  useEffect(() => {
    const current = stageRef.current;
    const shouldSiren = current >= 5;
    const stageChanged = current !== lastSirenStageRef.current;
    lastSirenStageRef.current = current;

    if (shouldSiren && !sirenTimerRef.current) {
      const ctx = ensureCtx();
      if (ctx) sirenPulse();
      sirenTimerRef.current = setInterval(() => {
        sirenPulse();
      }, 1200);
    } else if (!shouldSiren && sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    } else if (shouldSiren && stageChanged && sirenTimerRef.current) {
      /* restart to reset cadence on stage transitions within siren range */
      clearInterval(sirenTimerRef.current);
      sirenPulse();
      sirenTimerRef.current = setInterval(sirenPulse, 1200);
    }

    return () => {
      if (sirenTimerRef.current && !shouldSiren) {
        clearInterval(sirenTimerRef.current);
        sirenTimerRef.current = null;
      }
    };
  }, [stageRef, ensureCtx, sirenPulse]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (sirenTimerRef.current) clearInterval(sirenTimerRef.current);
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v;
    if (masterRef.current) masterRef.current.gain.value = v ? 0.18 : 0;
  }, []);

  return { keyClick, submitSweep, errorBuzz, sirenPulse, setEnabled };
}
