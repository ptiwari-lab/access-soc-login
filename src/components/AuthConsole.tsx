import { useState, useRef } from 'react';
import { Fingerprint, User, KeyRound, ChevronRight, Cpu, Eye, EyeOff, ShieldCheck, ScanFace } from 'lucide-react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props {
  stage: Stage; attempts: number;
  username: string; password: string; response: string; isShaking: boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyClick?: () => void;
}

type Cfg = {
  accent: string; accentRgb: string; border: string; glow: string;
  statusColor: string; statusText: string; badge: string; badgeColor: string;
};

const CFG: Record<Stage, Cfg> = {
  0: { accent: '#00d4ff', accentRgb: '0,212,255', border: 'rgba(0,212,255,0.20)', glow: 'rgba(0,212,255,0.14)', statusColor: '#00ff88', statusText: 'All systems nominal', badge: '', badgeColor: '' },
  1: { accent: '#00d4ff', accentRgb: '0,212,255', border: 'rgba(0,212,255,0.28)', glow: 'rgba(0,212,255,0.18)', statusColor: '#00d4ff', statusText: 'Session under observation', badge: 'MONITORING ACTIVE', badgeColor: '#00d4ff' },
  2: { accent: '#f59e0b', accentRgb: '251,191,36', border: 'rgba(251,191,36,0.30)', glow: 'rgba(251,191,36,0.18)', statusColor: '#f59e0b', statusText: 'Threat pattern confirmed', badge: 'ANOMALY DETECTED', badgeColor: '#f59e0b' },
  3: { accent: '#f59e0b', accentRgb: '251,191,36', border: 'rgba(251,191,36,0.38)', glow: 'rgba(251,191,36,0.24)', statusColor: '#f59e0b', statusText: 'Brute-force signature confirmed', badge: 'ACTIVE BREACH DETECTED', badgeColor: '#f59e0b' },
  4: { accent: '#ef4444', accentRgb: '239,68,68', border: 'rgba(239,68,68,0.38)', glow: 'rgba(239,68,68,0.26)', statusColor: '#ef4444', statusText: 'Incident declared · Forensic capture running', badge: 'INCIDENT DECLARED — CASE OPENED', badgeColor: '#ef4444' },
  5: { accent: '#ef4444', accentRgb: '239,68,68', border: 'rgba(239,68,68,0.46)', glow: 'rgba(239,68,68,0.32)', statusColor: '#ef4444', statusText: 'Emergency protocols active', badge: 'MELTDOWN — ALL SYSTEMS CRITICAL', badgeColor: '#ef4444' },
  6: { accent: '#ef4444', accentRgb: '239,68,68', border: 'rgba(239,68,68,0.58)', glow: 'rgba(239,68,68,0.40)', statusColor: '#ef4444', statusText: 'Attempt 67 reached · Non-recoverable', badge: 'PROTOCOL OMEGA — POINT OF NO RETURN', badgeColor: '#ef4444' },
  7: { accent: '#ef4444', accentRgb: '239,68,68', border: 'rgba(239,68,68,0.40)', glow: 'rgba(239,68,68,0.24)', statusColor: '#ef4444', statusText: 'Session permanently flagged', badge: 'LOCKED OUT — PERMANENTLY', badgeColor: '#ef4444' },
};

const TICKER_MSGS = [
  'INTRUSION DETECTION ACTIVE',
  'ZERO TRUST ENFORCED',
  'TLS 1.3 · AES-256-GCM',
  'SESSION LOGGED',
  'UNAUTHORIZED ACCESS IS A CRIMINAL OFFENCE',
  'SIMULATED ENVIRONMENT — NO REAL CREDENTIALS',
];

export default function AuthConsole({
  stage, attempts, username, password, response, isShaking,
  onUsernameChange, onPasswordChange, onSubmit, onKeyClick,
}: Props) {
  const cfg = CFG[stage];
  const isAlert = stage >= 3;
  const isMeltdown = stage >= 5;
  const [showPwd, setShowPwd] = useState(false);
  const [focusedField, setFocusedField] = useState<'user' | 'pwd' | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  /* Runaway submit button — dodges the cursor at attempt >= 3 */
  const dodge = () => {
    if (authenticating || attempts < 3) return;
    const b = btnRef.current;
    if (!b) return;
    const maxX = 120, maxY = 40;
    const dx = (Math.random() - 0.5) * 2 * maxX;
    const dy = (Math.random() - 0.5) * 2 * maxY;
    const rot = (Math.random() - 0.5) * 12;
    b.style.transition = 'transform 0.18s cubic-bezier(.2,.9,.3,1.2)';
    b.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
  };
  const resetDodge = () => {
    const b = btnRef.current;
    if (!b) return;
    b.style.transition = 'transform 0.3s ease';
    b.style.transform = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticating) return;
    resetDodge();
    setAuthenticating(true);
    setTimeout(() => {
      setAuthenticating(false);
      onSubmit(e);
    }, 600);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onKeyClick?.();
    onUsernameChange(e.target.value);
  };
  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onKeyClick?.();
    onPasswordChange(e.target.value);
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden transition-all duration-700 ${isShaking ? 'animate-shake' : ''} ${isMeltdown ? 'heartbeat' : ''}`}
      style={{
        background: `linear-gradient(175deg, rgba(${cfg.accentRgb},0.03) 0%, rgba(5,9,18,0.92) 40%, rgba(4,8,16,0.97) 100%)`,
        border: `1px solid ${cfg.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 60px ${cfg.glow}, 0 0 120px ${cfg.glow}40, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Top edge light */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}80, transparent)` }} />

      {/* Corner brackets — all four corners */}
      <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: `1.5px solid ${cfg.accent}66`, borderLeft: `1.5px solid ${cfg.accent}66` }} />
      <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: `1.5px solid ${cfg.accent}66`, borderRight: `1.5px solid ${cfg.accent}66` }} />
      <div className="absolute bottom-7 left-3 w-5 h-5" style={{ borderBottom: `1.5px solid ${cfg.accent}66`, borderLeft: `1.5px solid ${cfg.accent}66` }} />
      <div className="absolute bottom-7 right-3 w-5 h-5" style={{ borderBottom: `1.5px solid ${cfg.accent}66`, borderRight: `1.5px solid ${cfg.accent}66` }} />

      {/* ── Body ── */}
      <div className="px-7 pt-7 pb-3 flex-1">

        {/* Brand block — left aligned, strong hierarchy */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-baseline gap-2.5 mb-1">
              <h1
                className={`font-black leading-none ${isMeltdown ? 'glitch-active' : ''}`}
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
                  color: cfg.accent,
                  letterSpacing: '0.26em',
                  textShadow: `0 0 30px ${cfg.accent}, 0 0 60px ${cfg.accent}50`,
                }}
              >
                ACCESS™
              </h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.22)', fontFamily: "'Space Mono', monospace", fontSize: '0.56rem', letterSpacing: '0.1em' }}>
              SECURITY OPERATIONS CENTER · v4.2.1
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex flex-col items-end gap-1.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.statusColor, boxShadow: `0 0 8px ${cfg.statusColor}`, animation: 'pulseGlow 1.8s ease-in-out infinite' }} />
              <span style={{ color: cfg.statusColor, fontFamily: "'Orbitron', monospace", fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                {cfg.statusText.split('·')[0].trim().toUpperCase()}
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>
              ATTEMPT {String(attempts).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Alert badge */}
        {cfg.badge && (
          <div
            className={`mb-5 py-2 px-3 rounded-md flex items-center gap-2.5 ${isMeltdown ? 'animate-pulse' : ''}`}
            style={{ background: `${cfg.badgeColor}08`, border: `1px solid ${cfg.badgeColor}30` }}
          >
            <span className="w-1 h-1 rounded-full" style={{ background: cfg.badgeColor, boxShadow: `0 0 6px ${cfg.badgeColor}` }} />
            <span style={{ color: cfg.badgeColor, fontFamily: "'Orbitron', monospace", fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em' }}>
              {cfg.badge}
            </span>
          </div>
        )}

        {/* Biometric scan visual */}
        <div className="flex items-center gap-3 mb-4 rounded-md p-3" style={{ background: `rgba(${cfg.accentRgb},0.03)`, border: `1px solid ${cfg.accent}10` }}>
          <div className="relative shrink-0" style={{ width: '44px', height: '44px' }}>
            {/* scanning ring */}
            <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${cfg.accent}30`, animation: 'spinSlow 8s linear infinite' }} />
            <div className="absolute inset-1 rounded-full" style={{ border: `1px dashed ${cfg.accent}20`, animation: 'spinSlowR 12s linear infinite' }} />
            {/* center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanFace size={18} style={{ color: cfg.accent, opacity: 0.7 }} />
            </div>
            {/* scan line */}
            <div className="absolute left-1 right-1 h-px" style={{ background: cfg.accent, boxShadow: `0 0 6px ${cfg.accent}`, animation: 'biometricScan 2.5s ease-in-out infinite', top: '0' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint size={10} style={{ color: cfg.accent, opacity: 0.6 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em', fontWeight: 700 }}>
                BIOMETRIC VERIFICATION
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: attempts === 0 ? '100%' : `${Math.max(10, 100 - attempts * 1.5)}%`,
                  background: cfg.accent,
                  boxShadow: `0 0 4px ${cfg.accent}`,
                }} />
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ color: `rgba(${cfg.accentRgb},0.4)`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.48rem' }}>
                {attempts === 0 ? 'READY' : `${Math.max(10, 100 - attempts * 1.5).toFixed(0)}% INTEGRITY`}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.48rem' }}>
                SIM
              </span>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-3.5">
          <ShieldCheck size={11} style={{ color: cfg.accent, opacity: 0.7 }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem', letterSpacing: '0.16em', fontWeight: 700 }}>
            IDENTITY VERIFICATION
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${cfg.accent}20, transparent)` }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Username */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: cfg.accent, opacity: focusedField === 'user' ? 0.9 : 0.5, transition: 'opacity 0.2s' }}>
              <User size={14} />
            </span>
            <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs" style={{ color: focusedField === 'user' ? cfg.accent : 'rgba(255,255,255,0.12)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', transition: 'color 0.2s' }}>
              ID:
            </span>
            <input
              type="text" value={username} onChange={handleUserChange}
              onFocus={() => setFocusedField('user')}
              onBlur={() => setFocusedField(null)}
              placeholder="operator identifier"
              className="w-full pl-16 pr-4 py-3 rounded-md outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${focusedField === 'user' ? `${cfg.accent}60` : 'rgba(255,255,255,0.06)'}`, color: 'rgba(255,255,255,0.88)', fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', caretColor: cfg.accent, boxShadow: focusedField === 'user' ? `inset 0 0 16px ${cfg.accent}0a, 0 0 0 1px ${cfg.accent}30` : 'none' }}
            />
            {focusedField === 'user' && (
              <span className="absolute right-3 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, transparent, ${cfg.accent}, transparent)`, animation: 'pulseGlow 1.5s ease-in-out infinite' }} />
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: cfg.accent, opacity: focusedField === 'pwd' ? 0.9 : 0.5, transition: 'opacity 0.2s' }}>
              <KeyRound size={14} />
            </span>
            <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs" style={{ color: focusedField === 'pwd' ? cfg.accent : 'rgba(255,255,255,0.12)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', transition: 'color 0.2s' }}>
              KEY:
            </span>
            <input
              type={showPwd ? 'text' : 'password'} value={password} onChange={handlePwdChange}
              onFocus={() => setFocusedField('pwd')}
              onBlur={() => setFocusedField(null)}
              placeholder="access code"
              className="w-full pl-16 pr-12 py-3 rounded-md outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${focusedField === 'pwd' ? `${cfg.accent}60` : 'rgba(255,255,255,0.06)'}`, color: 'rgba(255,255,255,0.88)', fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', caretColor: cfg.accent, boxShadow: focusedField === 'pwd' ? `inset 0 0 16px ${cfg.accent}0a, 0 0 0 1px ${cfg.accent}30` : 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all"
              style={{ color: showPwd ? cfg.accent : 'rgba(255,255,255,0.3)' }}
              aria-label={showPwd ? 'Hide password' : 'Reveal password'}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
            >
              {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            {focusedField === 'pwd' && (
              <span className="absolute right-10 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, transparent, ${cfg.accent}, transparent)`, animation: 'pulseGlow 1.5s ease-in-out infinite' }} />
            )}
          </div>

          {/* Button */}
          <button
            ref={btnRef}
            type="submit"
            disabled={authenticating}
            className="group relative w-full py-3.5 rounded-md font-black flex items-center justify-center gap-2 overflow-hidden transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, ${cfg.accent}18 0%, ${cfg.accent}06 100%)`,
              border: `1px solid ${cfg.accent}40`,
              color: cfg.accent,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.76rem',
              letterSpacing: '0.2em',
              boxShadow: `inset 0 0 20px ${cfg.accent}08`,
              opacity: authenticating ? 0.6 : 1,
              cursor: authenticating ? 'wait' : 'pointer',
            }}
            onMouseOver={e => {
              if (authenticating) return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = `linear-gradient(90deg, ${cfg.accent}28 0%, ${cfg.accent}12 100%)`;
              b.style.boxShadow = `inset 0 0 20px ${cfg.accent}12, 0 0 30px ${cfg.glow}`;
              b.style.borderColor = `${cfg.accent}80`;
              /* dodge the cursor at attempt >= 3 */
              if (attempts >= 3) dodge();
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = `linear-gradient(90deg, ${cfg.accent}18 0%, ${cfg.accent}06 100%)`;
              b.style.boxShadow = `inset 0 0 20px ${cfg.accent}08`;
              b.style.borderColor = `${cfg.accent}40`;
              resetDodge();
            }}
            onMouseDown={e => { if (!authenticating) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}12, transparent)` }} />
            {authenticating ? (
              <>
                <Cpu size={13} className="opacity-60 animate-spin" style={{ animationDuration: '1s' }} />
                VERIFYING...
              </>
            ) : (
              <>
                <Cpu size={13} className="opacity-60" />
                AUTHENTICATE
                <ChevronRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Response panel */}
        {response && (
          <div
            className="mt-4 rounded-md p-3.5 fade-up"
            style={{ background: stage >= 4 ? 'rgba(239,68,68,0.06)' : stage >= 2 ? 'rgba(251,191,36,0.05)' : 'rgba(0,212,255,0.04)', border: `1px solid ${cfg.accent}18` }}
          >
            <div className="flex items-start gap-2">
              <span style={{ color: cfg.accent, fontFamily: 'monospace', marginTop: 1, fontSize: '0.9rem', flexShrink: 0 }}>{'>'}</span>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', lineHeight: 1.75 }}>
                {response}
              </p>
            </div>
          </div>
        )}

        {/* Footer info row */}
        <div className="mt-3 flex items-center justify-between">
          <span style={{ color: 'rgba(255,255,255,0.12)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>
            {new Date().toISOString().substring(0,10)} · UTC
          </span>
          {attempts > 0 && (
            <span className={`font-black tracking-widest ${isAlert ? 'animate-pulse' : ''}`}
              style={{ color: cfg.accent, fontFamily: "'Orbitron', monospace", fontSize: '0.58rem' }}>
              #{String(attempts).padStart(3,'0')}
            </span>
          )}
        </div>
      </div>

      {/* Ticker strip */}
      <div className="overflow-hidden" style={{ borderTop: `1px solid ${cfg.accent}10`, background: `${cfg.accent}04`, height: '24px' }}>
        <div className="flex items-center h-full whitespace-nowrap" style={{ animation: 'ticker 30s linear infinite' }}>
          {[...TICKER_MSGS, ...TICKER_MSGS].map((msg, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 px-5" style={{ color: `${cfg.accent}55`, fontFamily: "'Space Mono', monospace", fontSize: '0.52rem', letterSpacing: '0.12em' }}>
              <span style={{ color: cfg.accent, opacity: 0.4 }}>·</span>
              {msg}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}40, transparent)` }} />
    </div>
  );
}
