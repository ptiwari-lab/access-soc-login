import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props {
  label: string;
  value: number;
  max: number;
  unit: string;
  stage: Stage;
  warningThreshold?: number;
  dangerThreshold?: number;
}

/**
 * Circular gauge meter with animated arc fill,
 * value readout, and stage-aware coloring.
 */
export default function GaugeMeter({ label, value, max, unit, stage, warningThreshold = 50, dangerThreshold = 75 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const valueRef = useRef<number>(value);
  const displayRef = useRef<number>(0);
  const stageRef = useRef<Stage>(stage);
  valueRef.current = value;
  stageRef.current = stage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = canvas.width;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const R = SIZE * 0.38;

    function getColor(pct: number): string {
      const s = stageRef.current;
      if (s >= 4) return '239,68,68';
      if (s >= 2) return '251,191,36';
      if (pct >= dangerThreshold) return '239,68,68';
      if (pct >= warningThreshold) return '251,191,36';
      return '0,255,136';
    }

    function frame() {
      /* smooth value interpolation */
      displayRef.current += (valueRef.current - displayRef.current) * 0.08;
      const v = displayRef.current;
      const pct = Math.min(1, v / max);
      const color = getColor(pct * 100);

      ctx!.clearRect(0, 0, SIZE, SIZE);

      /* background ring */
      ctx!.beginPath();
      ctx!.arc(CX, CY, R, Math.PI * 0.75, Math.PI * 2.25);
      ctx!.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx!.lineWidth = 3;
      ctx!.stroke();

      /* filled arc */
      const endAngle = Math.PI * 0.75 + Math.PI * 1.5 * pct;
      ctx!.beginPath();
      ctx!.arc(CX, CY, R, Math.PI * 0.75, endAngle);
      ctx!.strokeStyle = `rgba(${color},0.8)`;
      ctx!.lineWidth = 3;
      ctx!.lineCap = 'round';
      ctx!.shadowBlur = 8;
      ctx!.shadowColor = `rgba(${color},0.5)`;
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      /* tick marks */
      const tickCount = 20;
      for (let i = 0; i <= tickCount; i++) {
        const t = i / tickCount;
        const angle = Math.PI * 0.75 + Math.PI * 1.5 * t;
        const inner = R + 2;
        const outer = R + (i % 5 === 0 ? 6 : 3);
        ctx!.strokeStyle = `rgba(${color},${t <= pct ? 0.4 : 0.12})`;
        ctx!.lineWidth = i % 5 === 0 ? 1 : 0.5;
        ctx!.beginPath();
        ctx!.moveTo(CX + Math.cos(angle) * inner, CY + Math.sin(angle) * inner);
        ctx!.lineTo(CX + Math.cos(angle) * outer, CY + Math.sin(angle) * outer);
        ctx!.stroke();
      }

      /* center value */
      ctx!.fillStyle = `rgba(${color},0.9)`;
      ctx!.font = `bold 14px "Share Tech Mono", monospace`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(Math.round(v).toString(), CX, CY - 2);

      /* unit */
      ctx!.fillStyle = `rgba(${color},0.4)`;
      ctx!.font = `7px "Share Tech Mono", monospace`;
      ctx!.fillText(unit, CX, CY + 10);

      /* label at bottom */
      ctx!.fillStyle = 'rgba(255,255,255,0.25)';
      ctx!.font = `6px "Share Tech Mono", monospace`;
      ctx!.fillText(label, CX, SIZE - 4);

      animRef.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, [label, max, unit, warningThreshold, dangerThreshold]);

  return <canvas ref={canvasRef} width={80} height={80} style={{ display: 'block' }} />;
}
