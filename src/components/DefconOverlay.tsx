import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; }

/**
 * DEFCON 1 red alert lockdown visuals — activates at meltdown/critical.
 * Renders:
 *  - red ambient screen flash overlay (pulsing)
 *  - screen-shake glitch on the whole viewport
 *  - red border pulses around the screen
 *  - flashing DEFCON 1 alert banner top + bottom
 */
export default function DefconOverlay({ stage }: Props) {
  const isMeltdown = stage >= 5;
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (!isMeltdown) return;
    const id = setInterval(() => setFlashOn(f => !f), 700);
    return () => clearInterval(id);
  }, [isMeltdown]);

  if (stage < 4) return null;

  const isCritical = stage >= 6;
  const level = isCritical ? 'CRITICAL' : isMeltdown ? 'MELTDOWN' : 'INCIDENT';
  const defcon = isCritical ? 'DEFCON 1' : isMeltdown ? 'DEFCON 1' : 'DEFCON 2';

  return (
    <>
      {/* Red ambient screen flash overlay */}
      {isMeltdown && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: flashOn ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.02)',
            transition: 'background 0.35s ease',
            zIndex: 45,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Red border pulse frame */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow: isMeltdown
            ? `inset 0 0 ${flashOn ? 80 : 40}px rgba(239,68,68,${flashOn ? 0.25 : 0.12})`
            : 'inset 0 0 30px rgba(239,68,68,0.08)',
          transition: 'box-shadow 0.4s ease',
          zIndex: 46,
        }}
      />

      {/* Glitch shake wrapper — applied via a class on a fixed full-screen div */}
      {isMeltdown && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 47,
            animation: 'glitchShake 0.18s steps(2) infinite',
            background: 'repeating-linear-gradient(0deg, rgba(239,68,68,0.03) 0px, rgba(239,68,68,0.03) 1px, transparent 1px, transparent 3px)',
            opacity: flashOn ? 0.6 : 0.2,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Top DEFCON banner */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-center gap-3 px-4 py-1 pointer-events-none"
        style={{
          background: isMeltdown
            ? `linear-gradient(90deg, rgba(239,68,68,${flashOn ? 0.22 : 0.10}), rgba(120,0,0,${flashOn ? 0.18 : 0.06}), rgba(239,68,68,${flashOn ? 0.22 : 0.10}))`
            : 'rgba(239,68,68,0.08)',
          borderBottom: '1px solid rgba(239,68,68,0.3)',
          zIndex: 48,
          transition: 'background 0.3s',
        }}
      >
        <AlertTriangle size={12} style={{ color: '#ef4444', animation: isMeltdown ? 'pulseGlow 0.7s ease-in-out infinite' : 'none' }} />
        <span style={{
          color: '#ef4444',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.62rem',
          fontWeight: 900,
          letterSpacing: '0.24em',
          textShadow: '0 0 10px rgba(239,68,68,0.6)',
          animation: isMeltdown ? 'pulseGlow 0.7s ease-in-out infinite' : 'none',
        }}>
          {defcon} · {level} · LOCKDOWN ACTIVE
        </span>
        <AlertTriangle size={12} style={{ color: '#ef4444', animation: isMeltdown ? 'pulseGlow 0.7s ease-in-out infinite' : 'none' }} />
      </div>

      {/* Bottom DEFCON banner */}
      {isMeltdown && (
        <div
          className="fixed bottom-7 left-0 right-0 flex items-center justify-center gap-2 px-4 py-0.5 pointer-events-none"
          style={{
            background: `rgba(239,68,68,${flashOn ? 0.16 : 0.06})`,
            borderTop: '1px solid rgba(239,68,68,0.25)',
            zIndex: 48,
            transition: 'background 0.3s',
          }}
        >
          <span style={{
            color: '#ef4444',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.52rem',
            letterSpacing: '0.2em',
            opacity: flashOn ? 1 : 0.5,
            transition: 'opacity 0.3s',
          }}>
            ALL OPERATORS REPORT TO STATIONS · THIS IS NOT A DRILL · ATTEMPT LOG FROZEN
          </span>
        </div>
      )}
    </>
  );
}
