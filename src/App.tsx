import { useState, useEffect, useCallback } from 'react';
import { useAccessSystem } from '@/hooks/useAccessSystem';
import Background  from '@/components/Background';
import HeroRings   from '@/components/HeroRings';
import HUDFrame    from '@/components/HUDFrame';
import HoloGlobe   from '@/components/HoloGlobe';
import Header      from '@/components/Header';
import LeftPanel   from '@/components/LeftPanel';
import AuthConsole from '@/components/AuthConsole';
import RightPanel  from '@/components/RightPanel';
import ToastSystem from '@/components/ToastSystem';
import CriticalOverlay from '@/components/CriticalOverlay';
import CaptchaModal from '@/components/CaptchaModal';
import DefconOverlay from '@/components/DefconOverlay';
import InteractiveTerminal from '@/components/InteractiveTerminal';
import BootSequence from '@/components/BootSequence';
import EscalationTimeline from '@/components/EscalationTimeline';
import OperatorConsole from '@/components/OperatorConsole';

export default function App() {
  const {
    attempts, stage, username, setUsername,
    password, setPassword, response, log,
    toasts, showCritical, isShaking,
    showCaptcha, triggerCaptcha, dismissCaptcha,
    handleLogin, dismissToast, dismissCritical,
    sounds,
  } = useAccessSystem();

  const isMeltdown = stage >= 5;
  const isCrisis   = stage >= 4;
  const dataLevel = stage >= 6 ? 'critical' : stage >= 5 ? 'meltdown' : stage >= 4 ? 'danger' : stage >= 2 ? 'warning' : 'normal';

  const [booting, setBooting] = useState(true);

  const finishBoot = useCallback(() => {
    setBooting(false);
  }, []);

  useEffect(() => {
    if (!booting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finishBoot();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [booting, finishBoot]);

  return (
    <div
      data-level={dataLevel}
      className={`min-h-screen relative overflow-hidden ${isMeltdown ? 'scanlines' : ''}`}
      style={{ background: 'transparent', fontFamily: 'Rajdhani, system-ui, sans-serif' }}
    >
      {booting && <BootSequence onComplete={finishBoot} />}

      {/* Layer 0 — matrix rain + node web */}
      <Background stage={stage} />
      {/* Layer 1 — concentric ring SOC backdrop */}
      <HeroRings stage={stage} />
      {/* Layer 2 — HUD framing overlay */}
      <HUDFrame stage={stage} />
      {/* Layer 3 — UI chrome */}
      <Header stage={stage} attempts={attempts} />

      {/* DEFCON 1 lockdown visuals */}
      <DefconOverlay stage={stage} />

      {/* Toast notifications — upper right */}
      <ToastSystem toasts={toasts} onDismiss={dismissToast} />
      {showCritical && <CriticalOverlay onDismiss={dismissCritical} />}
      {showCaptcha && <CaptchaModal onDismiss={dismissCaptcha} />}

      {/* ── Cinematic asymmetric composition ── */}
      <main
        className="relative mx-auto flex items-stretch gap-3"
        style={{
          paddingTop: '56px',
          paddingBottom: '40px',
          minHeight: '100vh',
          maxWidth: '1440px',
          zIndex: 10,
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Left rail — compact monitoring + escalation timeline */}
        <aside
          className="hidden lg:flex flex-col shrink-0 gap-3"
          style={{ width: '240px', paddingTop: '24px' }}
        >
          <LeftPanel stage={stage} attempts={attempts} />
          <EscalationTimeline stage={stage} attempts={attempts} />
        </aside>

        {/* Center — auth console as focal point */}
        <div className="flex-1 flex flex-col items-center justify-start" style={{ minWidth: 0, paddingTop: '6px' }}>
          {/* HUD chips */}
          <div className="flex items-center gap-3 mb-3 flex-wrap justify-center" style={{ whiteSpace: 'nowrap' }}>
            <span className="hud-chip"><span className="hud-chip-dot" /> LIVE THREAT SURFACE</span>
            <span className="hud-chip hud-chip-muted">GATEWAY · SECTOR ALPHA-7</span>
            <span className="hud-chip hud-chip-muted">CLEARANCE {isCrisis ? 'REVOKED' : 'LEVEL-3'}</span>
          </div>

          {/* Holographic globe centerpiece */}
          <div className="relative mb-2" style={{ width: '100%', maxWidth: '360px' }}>
            <HoloGlobe stage={stage} />
            <span className="absolute top-0 left-0" style={{ color: 'rgba(0,212,255,0.25)', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em' }}>
              HOLO-NET · GLOBAL GRID
            </span>
            <span className="absolute top-0 right-0" style={{ color: stage >= 4 ? 'rgba(239,68,68,0.4)' : 'rgba(0,255,136,0.4)', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em' }}>
              {stage >= 4 ? 'BREACH' : 'SYNC'}
            </span>
          </div>

          <div style={{ width: '100%', maxWidth: '480px' }}>
            <AuthConsole
              stage={stage} attempts={attempts}
              username={username} password={password}
              response={response} isShaking={isShaking}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onSubmit={handleLogin}
              onKeyClick={sounds.keyClick}
            />
          </div>

          <p className="mt-4 text-center" style={{ color: 'rgba(255,255,255,0.10)', fontFamily: "'Space Mono', monospace", fontSize: '0.52rem', maxWidth: '480px', lineHeight: 1.7, letterSpacing: '0.04em' }}>
            CLASSIFIED SYSTEM · UNAUTHORIZED ACCESS PROHIBITED · ALL SESSIONS MONITORED &amp; LOGGED
            <br />SIMULATED ENVIRONMENT — NO REAL CREDENTIALS COLLECTED
          </p>

          {/* Interactive terminal CLI */}
          <div className="mt-4" style={{ width: '100%', maxWidth: '480px' }}>
            <InteractiveTerminal
              stage={stage} attempts={attempts}
              username={username} password={password}
              onOverride={triggerCaptcha}
            />
          </div>
        </div>

        {/* Right rail — audit log + diagnostics */}
        <aside
          className="hidden lg:flex flex-col shrink-0 gap-3"
          style={{ width: '268px', paddingTop: '24px' }}
        >
          <RightPanel log={log} stage={stage} attempts={attempts} />
        </aside>
      </main>

      {/* Mobile stacked panels */}
      <div className="lg:hidden px-4 pb-16 flex flex-col gap-3 relative z-10">
        <EscalationTimeline stage={stage} attempts={attempts} />
        <LeftPanel stage={stage} attempts={attempts} />
        <RightPanel log={log} stage={stage} attempts={attempts} />
      </div>

      {/* Operator console easter egg */}
      <OperatorConsole stage={stage} attempts={attempts} />

      {/* ── Bottom status bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-5 py-1"
        style={{ background: 'rgba(5,9,18,0.95)', borderTop: '1px solid rgba(0,212,255,0.06)', backdropFilter: 'blur(10px)', zIndex: 40, height: '28px' }}
      >
        <div className="flex items-center gap-3">
          {['TLS 1.3','AES-256-GCM','FIPS 140-3'].map(l => (
            <span key={l} style={{ color: 'rgba(255,255,255,0.14)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>{l}</span>
          ))}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>
          ACCESS™ SOC © 2026
        </span>
        <div className="flex items-center gap-3">
          {[1,2,3].map(n => (
            <div key={n} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full"
                style={{ background: stage >= 4 && n >= 2 ? '#ef4444' : '#00ff88', boxShadow: `0 0 4px ${stage >= 4 && n >= 2 ? '#ef4444' : '#00ff88'}` }} />
              <span style={{ color: 'rgba(255,255,255,0.14)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>N0{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
