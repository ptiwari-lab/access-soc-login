import { X } from 'lucide-react';
import type { Toast } from '@/hooks/useAccessSystem';

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const config = {
  info: {
    border: 'rgba(0,212,255,0.4)',
    bg: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(2,12,24,0.95) 100%)',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.25)',
    topLine: '#00d4ff',
  },
  warn: {
    border: 'rgba(251,191,36,0.45)',
    bg: 'linear-gradient(135deg, rgba(251,191,36,0.14) 0%, rgba(2,12,24,0.95) 100%)',
    color: '#f59e0b',
    glow: 'rgba(251,191,36,0.3)',
    topLine: '#f59e0b',
  },
  danger: {
    border: 'rgba(239,68,68,0.45)',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(2,12,24,0.95) 100%)',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    topLine: '#ef4444',
  },
  critical: {
    border: 'rgba(239,68,68,0.6)',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(30,2,2,0.98) 100%)',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.5)',
    topLine: '#ef4444',
  },
};

export default function ToastSystem({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-1/2 left-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-none"
      style={{ maxWidth: '420px', width: 'calc(100vw - 48px)', transform: 'translate(-50%, -50%)' }}
    >
      {toasts.map(toast => {
        const cfg = config[toast.severity];
        const isCrit = toast.severity === 'critical';
        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative overflow-hidden rounded-xl"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 80px ${cfg.glow}, 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
              width: '100%',
              maxWidth: '420px',
              animation: 'toastPopCenter 0.55s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-0.5 w-full"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${cfg.topLine} 30%, ${cfg.topLine} 70%, transparent 100%)` }}
            />

            {/* Corner HUD markers */}
            <div className="absolute top-2 left-2 w-3 h-3" style={{ borderTop: `1.5px solid ${cfg.color}`, borderLeft: `1.5px solid ${cfg.color}`, opacity: 0.7 }} />
            <div className="absolute top-2 right-2 w-3 h-3" style={{ borderTop: `1.5px solid ${cfg.color}`, borderRight: `1.5px solid ${cfg.color}`, opacity: 0.7 }} />
            <div className="absolute bottom-2 left-2 w-3 h-3" style={{ borderBottom: `1.5px solid ${cfg.color}`, borderLeft: `1.5px solid ${cfg.color}`, opacity: 0.7 }} />
            <div className="absolute bottom-2 right-2 w-3 h-3" style={{ borderBottom: `1.5px solid ${cfg.color}`, borderRight: `1.5px solid ${cfg.color}`, opacity: 0.7 }} />

            <div className="px-5 py-3.5 flex items-center gap-3">
              {/* Emoji */}
              {toast.emoji && (
                <span
                  className={`text-2xl shrink-0 ${isCrit ? 'animate-pulse' : ''}`}
                  style={{ lineHeight: 1 }}
                >
                  {toast.emoji}
                </span>
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span
                    className={`font-black tracking-widest ${isCrit ? 'animate-pulse' : ''}`}
                    style={{
                      color: cfg.color,
                      fontFamily: "'Orbitron', 'JetBrains Mono', monospace",
                      fontSize: '0.72rem',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {toast.title}
                  </span>
                  <button
                    onClick={() => onDismiss(toast.id)}
                    className="shrink-0 p-1 rounded transition-all hover:opacity-100 opacity-40 hover:bg-white/10"
                  >
                    <X size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                </div>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.72)',
                    fontFamily: "'Space Mono', 'Courier New', monospace",
                    fontSize: '0.68rem',
                    lineHeight: 1.5,
                  }}
                >
                  {toast.message}
                </p>
              </div>
            </div>

            {/* Bottom accent */}
            <div
              className="h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}40, transparent)` }}
            />
          </div>
        );
      })}
    </div>
  );
}
