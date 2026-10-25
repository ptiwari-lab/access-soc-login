import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; }

/**
 * Full-screen HUD overlay: corner brackets, coordinate markings,
 * edge scan indicators, framing marks. Sits above canvases, below UI.
 */
export default function HUDFrame({ stage }: Props) {
  const accent = stage >= 4 ? '#ef4444' : stage >= 2 ? '#f59e0b' : '#00d4ff';
  const accentRgb = stage >= 4 ? '239,68,68' : stage >= 2 ? '251,191,36' : '0,212,255';
  const isDanger = stage >= 3;

  const cornerStyle = (position: string): React.CSSProperties => ({
    position: 'absolute',
    width: '24px',
    height: '24px',
    borderColor: accent,
    opacity: 0.4,
    animation: 'cornerPulse 3s ease-in-out infinite',
  });

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {/* Corner brackets — full screen */}
      <div style={{ ...cornerStyle(''), top: '52px', left: '12px', borderTop: '2px solid', borderLeft: '2px solid' }} />
      <div style={{ ...cornerStyle(''), top: '52px', right: '12px', borderTop: '2px solid', borderRight: '2px solid' }} />
      <div style={{ ...cornerStyle(''), bottom: '32px', left: '12px', borderBottom: '2px solid', borderLeft: '2px solid' }} />
      <div style={{ ...cornerStyle(''), bottom: '32px', right: '12px', borderBottom: '2px solid', borderRight: '2px solid' }} />

      {/* Edge tick marks — left and right */}
      <div style={{ position: 'absolute', top: '50%', left: '4px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: i === 2 ? '10px' : '6px', height: '1px', background: accent, opacity: i === 2 ? 0.4 : 0.2 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: '50%', right: '4px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: i === 2 ? '10px' : '6px', height: '1px', background: accent, opacity: i === 2 ? 0.4 : 0.2 }} />
        ))}
      </div>

      {/* Top center coordinate markings */}
      <div style={{ position: 'absolute', top: '52px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', alignItems: 'center' }}>
        <div style={{ width: '1px', height: '6px', background: accent, opacity: 0.3 }} />
        <span style={{ color: `rgba(${accentRgb},0.3)`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.15em' }}>
          N 40°42'46" W 74°00'21"
        </span>
        <div style={{ width: '1px', height: '6px', background: accent, opacity: 0.3 }} />
      </div>

      {/* Bottom-left system label */}
      <div style={{ position: 'absolute', bottom: '34px', left: '20px' }}>
        <span style={{ color: `rgba(${accentRgb},0.2)`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em' }}>
          GRID-REF: 18TWL 12345 67890
        </span>
      </div>

      {/* Bottom-right scan indicator */}
      <div style={{ position: 'absolute', bottom: '34px', right: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span className="w-1 h-1 rounded-full" style={{ background: isDanger ? '#ef4444' : '#00ff88', boxShadow: `0 0 4px ${isDanger ? '#ef4444' : '#00ff88'}`, animation: 'pulseGlow 1.5s infinite' }} />
        <span style={{ color: `rgba(${accentRgb},0.2)`, fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em' }}>
          SCAN ACTIVE
        </span>
      </div>

      {/* Vertical scan beam — occasional sweep across the viewport */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: `linear-gradient(180deg, transparent, rgba(${accentRgb},0.03), transparent)`,
          animation: 'scanBeam 8s ease-in-out infinite',
          animationDelay: '3s',
        }}
      />
    </div>
  );
}
