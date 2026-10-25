import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; attempts: number; }

const STAGES = [
  { label: 'NORMAL',   color: '#00ff88', threshold: 0  },
  { label: 'WARNING',  color: '#00d4ff', threshold: 3  },
  { label: 'ELEVATED', color: '#f59e0b', threshold: 6  },
  { label: 'DANGER',   color: '#f59e0b', threshold: 10 },
  { label: 'CRISIS',   color: '#ef4444', threshold: 25 },
  { label: 'MELTDOWN', color: '#ef4444', threshold: 50 },
  { label: 'CRITICAL', color: '#ef4444', threshold: 67 },
];

export default function EscalationTimeline({ stage, attempts }: Props) {
  const activeIndex = STAGES.findIndex((s, i) => {
    if (i === STAGES.length - 1) return attempts >= s.threshold;
    return attempts >= s.threshold && attempts < STAGES[i + 1].threshold;
  });

  return (
    <div className="soc-panel overflow-hidden">
      <div className="panel-label">
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>ESCALATION LEVEL</span>
        <span className="ml-auto px-1.5 py-0.5 rounded" style={{
          background: `${STAGES[Math.max(0, activeIndex)].color}12`,
          color: STAGES[Math.max(0, activeIndex)].color,
          fontSize: '0.5rem', letterSpacing: '0.1em', fontWeight: 700,
        }}>
          {STAGES[Math.max(0, activeIndex)].label}
        </span>
      </div>
      <div className="p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-0.5">
          {STAGES.map((s, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            return (
              <div key={s.label} className="flex-1 h-1.5 rounded-full overflow-hidden transition-all duration-500" style={{
                background: isActive || isPast ? s.color : 'rgba(255,255,255,0.05)',
                boxShadow: isActive ? `0 0 6px ${s.color}` : 'none',
                opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
              }} />
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>
            {attempts} / 67 ATTEMPTS
          </span>
          <span style={{
            color: STAGES[Math.max(0, activeIndex)].color,
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.5rem',
            fontWeight: 700,
          }}>
            STAGE {stage}
          </span>
        </div>
      </div>
    </div>
  );
}
