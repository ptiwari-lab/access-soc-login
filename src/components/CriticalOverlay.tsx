import { ShieldOff } from 'lucide-react';

interface Props {
  onDismiss: () => void;
}

export default function CriticalOverlay({ onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
    >
      {/* Radial red glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(239,68,68,0.2) 0%, transparent 70%)',
          animation: 'pulseGlow 1.5s ease-in-out infinite',
        }}
      />

      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239,68,68,0.15) 2px, rgba(239,68,68,0.15) 4px)',
        }}
      />

      <div
        className="relative max-w-2xl w-full mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(25,2,2,0.99) 0%, rgba(8,0,0,0.99) 100%)',
          border: '1px solid rgba(239,68,68,0.6)',
          boxShadow: '0 0 120px rgba(239,68,68,0.4), 0 0 40px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'criticalEntrance 0.5s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        {/* Top pulsing bar */}
        <div
          className="h-1 animate-pulse"
          style={{ background: 'linear-gradient(90deg, transparent, #ef4444, #ff6b6b, #ef4444, transparent)' }}
        />

        {/* Corner markers */}
        {[
          'top-4 left-4 border-t border-l',
          'top-4 right-4 border-t border-r',
          'bottom-4 left-4 border-b border-l',
          'bottom-4 right-4 border-b border-r',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: 'rgba(239,68,68,0.7)', borderWidth: '2px' }} />
        ))}

        <div className="px-10 py-10 text-center">
          {/* Big emoji */}
          <div className="text-6xl mb-4 animate-bounce">💀</div>

          <div
            className="text-xs font-black tracking-widest mb-3 animate-pulse"
            style={{
              color: '#ef4444',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: '0.4em',
              textShadow: '0 0 20px rgba(239,68,68,0.8)',
            }}
          >
            ⚠ PROTOCOL OMEGA INITIATED ⚠
          </div>

          <h2
            className="text-4xl font-black mb-6 leading-tight"
            style={{
              color: '#ef4444',
              fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
              textShadow: '0 0 60px rgba(239,68,68,0.8), 0 0 120px rgba(239,68,68,0.4)',
              letterSpacing: '0.05em',
            }}
          >
            ACCESS PERMANENTLY<br />
            <span style={{ color: '#ff4444' }}>OBLITERATED</span>
          </h2>

          <div
            className="rounded-xl p-6 mb-6 text-left space-y-3"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.25)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', lineHeight: 1.7 }}>
              <span style={{ color: '#ef4444' }}>{'>'}</span> <strong>SYSTEM:</strong> Even we can't use the 6–7 trend with you anymore. 😭
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: "'Space Mono', monospace", fontSize: '0.82rem', lineHeight: 1.7 }}>
              <span style={{ color: '#ef4444' }}>{'>'}</span> 67 failed attempts logged. Case <strong style={{ color: '#ef4444' }}>ACC-2026-0067</strong> escalated to all relevant authorities, irrelevant authorities, and your local neighbourhood watch. 🚨
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', lineHeight: 1.7 }}>
              <span style={{ color: '#ef4444' }}>{'>'}</span> Your keyboard has been flagged as a weapon of mass frustration. We are confiscating it digitally. 🔐
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', lineHeight: 1.7 }}>
              <span style={{ color: '#ef4444' }}>{'>'}</span> We called your mom. She sighed. It was a long sigh. The kind that speaks volumes. 😔
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', lineHeight: 1.7 }}>
              <span style={{ color: '#ef4444' }}>{'>'}</span> Goodbye. Not the good kind. ☠️
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onDismiss}
              className="px-8 py-3 rounded-xl font-black tracking-widest text-sm transition-all duration-300"
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.5)',
                color: '#ef4444',
                fontFamily: "'Orbitron', monospace",
                letterSpacing: '0.1em',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(239,68,68,0.28)';
                b.style.boxShadow = '0 0 30px rgba(239,68,68,0.4)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(239,68,68,0.15)';
                b.style.boxShadow = 'none';
              }}
            >
              ACKNOWLEDGE DEFEAT
            </button>
          </div>

          <p
            className="mt-5 text-xs"
            style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.05em' }}
          >
            (SIMULATED ENVIRONMENT — NO REAL CREDENTIALS COLLECTED OR TRANSMITTED)
          </p>
        </div>

        <div
          className="h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)' }}
        />
      </div>
    </div>
  );
}
