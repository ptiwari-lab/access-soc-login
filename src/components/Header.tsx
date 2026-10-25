import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; attempts: number; }

const stageStatus: Record<Stage, { text: string; color: string }> = {
  0: { text: 'SECURE',    color: '#00ff88' },
  1: { text: 'MONITORING',color: '#00d4ff' },
  2: { text: 'ELEVATED',  color: '#f59e0b' },
  3: { text: 'DANGER',    color: '#f59e0b' },
  4: { text: 'CRISIS',    color: '#ef4444' },
  5: { text: 'MELTDOWN',  color: '#ef4444' },
  6: { text: 'CRITICAL',  color: '#ef4444' },
  7: { text: 'LOCKDOWN',  color: '#ef4444' },
};

export default function Header({ stage, attempts }: Props) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = stageStatus[stage];
  const isAlert = stage >= 3;
  const isCrit  = stage >= 5;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-2"
      style={{
        background: isCrit
          ? 'linear-gradient(180deg, rgba(18,2,2,0.96) 0%, rgba(5,9,18,0.82) 100%)'
          : 'linear-gradient(180deg, rgba(5,11,22,0.96) 0%, rgba(5,9,18,0.78) 100%)',
        borderBottom: `1px solid ${isCrit ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.06)'}`,
        backdropFilter: 'blur(14px)',
        transition: 'all 0.8s ease',
        height: '48px',
      }}
    >
      {/* Left — brand */}
      <div className="flex items-center gap-2.5">
        <Shield size={16} style={{ color: isCrit ? '#ef4444' : '#00d4ff', filter: `drop-shadow(0 0 6px ${isCrit ? 'rgba(239,68,68,0.6)' : 'rgba(0,212,255,0.5)'})`, transition: 'all 0.5s' }} />
        <span className={isCrit ? 'glitch-active' : ''} style={{ color: isCrit ? '#ef4444' : '#00d4ff', fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '0.88rem', letterSpacing: '0.24em', textShadow: isCrit ? '0 0 14px rgba(239,68,68,0.6)' : '0 0 12px rgba(0,212,255,0.4)', transition: 'all 0.5s' }}>
          ACCESS™
        </span>
        <span style={{ color: 'rgba(255,255,255,0.18)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.08em' }}>
          SOC
        </span>

        {/* status nodes */}
        <div className="hidden md:flex items-center gap-3 ml-4">
          {(['PERIM','NET','ENDPT','INTEL'] as const).map((label, i) => {
            const isDown = (i >= 2 && stage >= 4) || (i >= 3 && stage >= 2);
            return (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full" style={{ background: isDown ? '#ef4444' : '#00ff88', boxShadow: `0 0 5px ${isDown ? '#ef4444' : '#00ff88'}`, animation: isDown ? 'pulseGlow 1.2s infinite' : 'none' }} />
                <span style={{ color: isDown ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.28)', fontFamily: "'Space Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.08em' }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right — status + clock */}
      <div className="flex items-center gap-3.5">
        {attempts > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ color: '#ef4444', fontFamily: "'Orbitron', monospace", fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em' }}>
              {attempts} FAIL
            </span>
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full heartbeat" style={{ background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
          <span style={{ color: status.color, fontFamily: "'Orbitron', monospace", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            {status.text}
          </span>
        </div>

        <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem' }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>

      {/* alert ping */}
      {isAlert && (
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-ping" style={{ background: '#ef4444' }} />
      )}
    </header>
  );
}
