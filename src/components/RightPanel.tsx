import { Terminal, Activity, AlertOctagon, Radio } from 'lucide-react';
import type { LogEntry, Stage } from '@/hooks/useAccessSystem';
import DataStream from './DataStream';

interface Props { log: LogEntry[]; stage: Stage; attempts: number; }

const sev = {
  info:     { color: '#00d4ff', label: 'INFO' },
  warn:     { color: '#f59e0b', label: 'WARN' },
  danger:   { color: '#ef4444', label: 'ALRT' },
  critical: { color: '#ef4444', label: 'CRIT' },
};

const accentFor = (stage: Stage) => ({
  hex: stage >= 4 ? '#ef4444' : stage >= 2 ? '#f59e0b' : '#00d4ff',
  panel: stage >= 4 ? 'soc-panel--danger' : stage >= 2 ? 'soc-panel--accent' : '',
});

const DIAG_BASE = [
  ['KERNEL',    '6.9.12-ACCESS'],
  ['PROTO',     'TLSv1.3/AES-256'],
  ['CERT',      '2027-01-01'],
  ['IP',        '██.███.██.███'],
  ['SESSION',   'ACC-' + Math.random().toString(36).substring(2, 10).toUpperCase()],
  ['AUTH',      'CREDENTIAL'],
  ['MFA',       'NOT_CONFIG'],
];

export default function RightPanel({ log, stage, attempts }: Props) {
  const a = accentFor(stage);

  const riskScore = attempts === 0 ? 'LOW' : attempts < 10 ? 'MED' : attempts < 25 ? 'HIGH' : 'CRIT';

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Audit log — primary, flex-grow */}
      <div className={`soc-panel ${a.panel} overflow-hidden flex flex-col`} style={{ flex: '1 1 0', minHeight: 0 }}>
        <div className="panel-label shrink-0">
          <Terminal size={11} style={{ color: a.hex }} />
          AUDIT LOG
          <span className="ml-auto px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', fontSize: '0.5rem' }}>
            {log.length}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: '200px' }}>
          {log.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <span style={{ color: 'rgba(255,255,255,0.15)', fontFamily: "'Space Mono', monospace", fontSize: '0.58rem' }}>No events recorded</span>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              {log.map((entry, i) => {
                const s = sev[entry.severity];
                return (
                  <div key={entry.id} className={`rounded p-1.5 fade-up ${i === 0 ? 'log-entry-new' : ''}`} style={{ background: `${s.color}08`, border: `1px solid ${s.color}12` }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1 py-px rounded" style={{ background: `${s.color}18`, color: s.color, fontFamily: "'Space Mono', monospace", fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        {s.label}
                      </span>
                      <span style={{ color: s.color, fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', fontWeight: 700 }}>
                        {entry.event}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem', lineHeight: 1.5 }}>
                      {entry.detail}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.15)', fontFamily: "'Space Mono', monospace", fontSize: '0.5rem' }}>
                      {entry.timestamp}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Data Stream — live packet feed */}
      <div className={`soc-panel ${a.panel} overflow-hidden`}>
        <div className="panel-label">
          <Radio size={11} style={{ color: a.hex }} />
          PACKET STREAM
          <span style={{ marginLeft: 'auto', color: a.hex, fontSize: '0.5rem', opacity: 0.5 }}>LIVE</span>
        </div>
        <div className="px-1 pb-1 pt-1">
          <DataStream stage={stage} attempts={attempts} />
        </div>
      </div>

      {/* Active incident — only at stage 4+ */}
      {stage >= 4 && (
        <div className="soc-panel soc-panel--danger overflow-hidden" style={{ background: 'rgba(239,68,68,0.05)' }}>
          <div className="panel-label" style={{ color: '#ef4444', borderBottomColor: 'rgba(239,68,68,0.15)' }}>
            <AlertOctagon size={11} style={{ color: '#ef4444' }} />
            ACTIVE INCIDENT
          </div>
          <div className="p-2.5 flex flex-col gap-1">
            {[
              ['REF',     `ACC-2026-${String(attempts).padStart(4, '0')}`],
              ['SEV',     stage >= 5 ? 'P0-CRITICAL' : 'P1-HIGH'],
              ['ANALYST', 'SOC-ALPHA'],
              ['STATUS',  stage >= 5 ? 'ESCALATED' : 'INVESTIGATING'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span style={{ color: 'rgba(239,68,68,0.5)', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem' }}>{k}</span>
                <span style={{ color: '#ef4444', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics — compact key-value list */}
      <div className={`soc-panel ${a.panel} overflow-hidden`}>
        <div className="panel-label">
          <Activity size={11} style={{ color: a.hex }} />
          DIAGNOSTICS
        </div>
        <div className="p-2.5 flex flex-col gap-1">
          {DIAG_BASE.map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem' }}>{k}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem' }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem' }}>RISK</span>
            <span style={{ color: attempts >= 10 ? '#ef4444' : attempts >= 3 ? '#f59e0b' : '#00ff88', fontFamily: "'Space Mono', monospace", fontSize: '0.54rem', fontWeight: 700 }}>
              {riskScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
