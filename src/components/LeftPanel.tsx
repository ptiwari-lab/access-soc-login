import { useEffect, useRef, useState } from 'react';
import { Eye, Activity, Cpu, Globe } from 'lucide-react';
import type { Stage } from '@/hooks/useAccessSystem';
import RadarDisplay from './RadarDisplay';
import GaugeMeter from './GaugeMeter';
import GlobalThreatMap from './GlobalThreatMap';

interface Props { stage: Stage; attempts: number; }

const accentFor = (stage: Stage) => ({
  rgb: stage >= 4 ? '239,68,68' : stage >= 2 ? '251,191,36' : '0,212,255',
  hex: stage >= 4 ? '#ef4444'   : stage >= 2 ? '#f59e0b'   : '#00d4ff',
  panel: stage >= 4 ? 'soc-panel--danger' : stage >= 2 ? 'soc-panel--accent' : '',
});

function Waveform({ color, stage }: { color: string; stage: Stage }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const BARS = 32;
    const heights = new Array(BARS).fill(0).map(() => Math.random() * 0.5 + 0.2);
    let t = 0;

    function frame() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.05;
      const bw = W / BARS;
      for (let i = 0; i < BARS; i++) {
        const target = 0.2 + Math.abs(Math.sin(t + i * 0.3)) * 0.6;
        heights[i] += (target - heights[i]) * 0.15;
        const bh = heights[i] * H;
        const alpha = 0.3 + heights[i] * 0.5;
        ctx!.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx!.fillRect(i * bw + 1, H - bh, bw - 2, bh);
      }
      animRef.current = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, [color, stage]);

  return <canvas ref={canvasRef} width={196} height={36} style={{ display: 'block', width: '100%' }} />;
}

export default function LeftPanel({ stage, attempts }: Props) {
  const a = accentFor(stage);

  /* live fluctuation tick — gauges breathe with real-time noise */
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 900);
    return () => clearInterval(id);
  }, []);
  const jitter = (base: number, amp: number) => {
    const v = base + (Math.sin(tick * 1.7) + Math.random() - 0.5) * amp;
    return Math.max(0, Math.min(100, v));
  };

  const cpuBase = 12 + attempts * 0.8;
  const netBase = Math.min(100, 20 + attempts * 1.5);
  const threatBase = Math.min(100, attempts * 1.5);
  void tick;

  const health = [
    { label: 'Firewall',   pct: Math.max(20, 100 - attempts * 1.5), ok: stage < 4 },
    { label: 'IDS / IPS',  pct: Math.max(15, 100 - attempts * 1.2), ok: stage < 3 },
    { label: 'Encryption', pct: 98, ok: true },
    { label: 'Auth Layer', pct: Math.max(5, 100 - attempts * 2), ok: stage < 5 },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Radar — primary, larger */}
      <div className={`soc-panel ${a.panel} overflow-hidden`}>
        <div className="panel-label">
          <Eye size={11} style={{ color: a.hex }} />
          THREAT RADAR
          <span className="ml-auto px-1.5 py-0.5 rounded" style={{ background: stage >= 2 ? 'rgba(251,191,36,0.1)' : 'rgba(0,255,136,0.1)', color: stage >= 4 ? '#ef4444' : stage >= 2 ? '#f59e0b' : '#00ff88', fontSize: '0.5rem', letterSpacing: '0.1em' }}>
            {stage >= 4 ? 'CRITICAL' : stage >= 2 ? 'ALERT' : 'NOMINAL'}
          </span>
        </div>
        <div className="flex justify-center py-2">
          <RadarDisplay stage={stage} attempts={attempts} />
        </div>
      </div>

      {/* Global Threat Map */}
      <div className={`soc-panel ${a.panel} overflow-hidden`}>
        <div className="panel-label">
          <Globe size={11} style={{ color: a.hex }} />
          THREAT VECTORS
        </div>
        <div className="px-1.5 pb-1.5 pt-1">
          <GlobalThreatMap stage={stage} attempts={attempts} />
        </div>
      </div>

      {/* Circular gauges — 3 side by side */}
      <div className={`soc-panel ${a.panel} overflow-hidden`}>
        <div className="panel-label">
          <Activity size={11} style={{ color: a.hex }} />
          TELEMETRY
          <span style={{ marginLeft: 'auto', color: a.hex, fontSize: '0.5rem', opacity: 0.5 }}>SIM</span>
        </div>
        <div className="flex justify-around items-center p-1.5" style={{ gap: '4px' }}>
          <GaugeMeter label="CPU" value={jitter(cpuBase, 6)} max={100} unit="%" stage={stage} warningThreshold={60} dangerThreshold={85} />
          <GaugeMeter label="NET" value={jitter(netBase, 8)} max={100} unit="Mb/s" stage={stage} warningThreshold={60} dangerThreshold={85} />
          <GaugeMeter label="THREAT" value={jitter(threatBase, 5)} max={100} unit="%" stage={stage} warningThreshold={40} dangerThreshold={70} />
        </div>
        <div className="px-2.5 pb-2.5">
          <Waveform color={a.hex} stage={stage} />
        </div>
      </div>

      {/* System health — bars */}
      <div className={`soc-panel ${a.panel} overflow-hidden`}>
        <div className="panel-label">
          <Cpu size={11} style={{ color: a.hex }} />
          SYS HEALTH
        </div>
        <div className="p-2.5 flex flex-col gap-2">
          {health.map(item => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Mono', monospace", fontSize: '0.56rem' }}>{item.label}</span>
                <span style={{ color: item.ok ? '#00ff88' : '#ef4444', fontFamily: "'Space Mono', monospace", fontSize: '0.56rem', fontWeight: 700 }}>
                  {item.pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.pct}%`, background: item.ok ? '#00ff88' : '#ef4444', boxShadow: `0 0 4px ${item.ok ? '#00ff88' : '#ef4444'}` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
