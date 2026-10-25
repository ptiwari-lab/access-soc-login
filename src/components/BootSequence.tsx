import { useEffect, useState, useRef } from 'react';

const BOOT_STEPS = [
  'INITIALIZING MONITORING SYSTEM',
  'LOADING NETWORK VISUALIZATION',
  'CALIBRATING THREAT RADAR',
  'AUTHENTICATION MODULE READY',
];

interface Props {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      completeRef.current();
      return;
    }

    let current = 0;
    let timer: ReturnType<typeof setTimeout>;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setDone(true);
      setTimeout(() => completeRef.current(), 300);
    };

    const tick = () => {
      if (skipRef.current) { finish(); return; }
      current++;
      if (current >= BOOT_STEPS.length) {
        setStep(BOOT_STEPS.length);
        finish();
        return;
      }
      setStep(current);
      timer = setTimeout(tick, 550);
    };

    timer = setTimeout(tick, 550);
    return () => clearTimeout(timer);
  }, []);

  const skip = () => {
    skipRef.current = true;
  };

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: '#050912', transition: 'opacity 0.4s ease' }}
    >
      <div className="flex flex-col items-center gap-6" style={{ width: '380px', maxWidth: '90vw' }}>
        <div className="text-center">
          <h1 style={{ color: '#00d4ff', fontFamily: "'Orbitron', sans-serif", fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.26em', textShadow: '0 0 30px rgba(0,212,255,0.5)' }}>
            ACCESS™
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em', marginTop: '4px' }}>
            SECURITY OPERATIONS CENTER · v4.2.1
          </p>
        </div>

        <div className="w-full flex flex-col gap-2">
          {BOOT_STEPS.map((label, i) => {
            const isActive = i === step;
            const isPast = i < step;
            return (
              <div key={label} className="flex items-center gap-2.5 fade-up" style={{ opacity: i <= step ? 1 : 0.2 }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                  background: isPast ? '#00ff88' : isActive ? '#00d4ff' : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive ? '0 0 8px #00d4ff' : 'none',
                  animation: isActive ? 'pulseGlow 1s infinite' : 'none',
                }} />
                <span style={{
                  color: isPast ? 'rgba(0,255,136,0.7)' : isActive ? '#00d4ff' : 'rgba(255,255,255,0.2)',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.58rem',
                  letterSpacing: '0.08em',
                }}>
                  {label}
                </span>
                {isPast && <span style={{ color: 'rgba(0,255,136,0.5)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', marginLeft: 'auto' }}>OK</span>}
                {isActive && (
                  <span style={{ color: '#00d4ff', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', marginLeft: 'auto' }}>
                    <span className="heartbeat">...</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={skip}
          className="mt-2"
          style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.08em', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          [ SKIP ] or press ESC
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)' }} />
    </div>
  );
}
