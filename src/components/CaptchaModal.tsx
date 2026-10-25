import { useState, useMemo } from 'react';
import { X, ShieldAlert, RotateCcw } from 'lucide-react';

interface Props { onDismiss: () => void; }

const PROMPTS = [
  'Select all images containing passwords you reused on Neopets in 2008',
  'Select all squares containing your actual bank password (we already know it)',
  'Select all tiles that show a password stronger than "password123"',
  'Select all images of you typing the same wrong password 40 times',
  'Select all panels containing a hint of self-awareness',
];

const TILE_LABELS = [
  'qwerty', '123456', 'iloveyou', 'password1', 'admin', 'letmein',
  'dragon', 'monkey', 'sunshine', 'abc123', 'football', '111111',
  'princess', 'shadow', 'master', 'batman', 'superman', 'baseball',
];

export default function CaptchaModal({ onDismiss }: Props) {
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [verified, setVerified] = useState(false);
  const [shake, setShake] = useState(false);

  /* randomize tile labels each open */
  const tiles = useMemo(() => {
    const shuffled = [...TILE_LABELS].sort(() => Math.random() - 0.5).slice(0, 9);
    return shuffled;
  }, []);

  const toggle = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const verify = () => {
    /* it's never correct — the captcha is a nightmare */
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const reset = () => {
    setSelected(new Set());
    setVerified(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(3,6,10,0.85)', backdropFilter: 'blur(8px)', zIndex: 100 }}
    >
      <div
        className={`relative rounded-xl overflow-hidden ${shake ? 'animate-shake' : ''}`}
        style={{
          width: 'min(440px, 92vw)',
          background: 'linear-gradient(175deg, rgba(239,68,68,0.04), rgba(5,9,18,0.96))',
          border: '1px solid rgba(239,68,68,0.35)',
          boxShadow: '0 0 60px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* top edge */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #ef444480, transparent)' }} />

        {/* corner brackets */}
        <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: '1.5px solid #ef444466', borderLeft: '1.5px solid #ef444466' }} />
        <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: '1.5px solid #ef444466', borderRight: '1.5px solid #ef444466' }} />

        {/* header */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
          <ShieldAlert size={18} style={{ color: '#ef4444' }} />
          <div className="flex-1">
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.82rem', color: '#ef4444', letterSpacing: '0.14em', fontWeight: 800 }}>
              HUMAN VERIFICATION
            </h3>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              reCAPTCHA-NIGHTMARE · v6.66
            </p>
          </div>
          <button onClick={onDismiss} aria-label="close"
            className="p-1 rounded transition-opacity" style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
            <X size={16} />
          </button>
        </div>

        {/* prompt */}
        <div className="px-5 pb-3">
          <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', lineHeight: 1.6 }}>
            {prompt}
          </p>
        </div>

        {/* grid */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-1.5">
            {tiles.map((label, i) => {
              const isSel = selected.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="relative rounded-md flex items-center justify-center transition-all"
                  style={{
                    aspectRatio: '1.2 / 1',
                    background: isSel ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSel ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isSel ? 'inset 0 0 12px rgba(239,68,68,0.2)' : 'none',
                  }}
                >
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.6rem',
                    color: isSel ? '#ef4444' : 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.04em',
                  }}>
                    {label}
                  </span>
                  {isSel && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <button onClick={reset} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", fontSize: '0.56rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RotateCcw size={11} /> RESET
          </button>
          {!verified ? (
            <button onClick={verify}
              className="px-5 py-2 rounded-md font-black transition-all"
              style={{
                background: 'linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#ef4444',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
              }}>
              VERIFY
            </button>
          ) : (
            <span style={{ color: '#00ff88', fontFamily: "'Orbitron', sans-serif", fontSize: '0.7rem' }}>VERIFIED</span>
          )}
        </div>

        {/* taunt */}
        <div className="px-5 pb-4">
          <p style={{ color: 'rgba(255,255,255,0.18)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem', textAlign: 'center', letterSpacing: '0.04em' }}>
            {selected.size === 0 ? 'select all relevant tiles. there are no relevant tiles.' : `${selected.size} selected · verification will fail anyway`}
          </p>
        </div>
      </div>
    </div>
  );
}
