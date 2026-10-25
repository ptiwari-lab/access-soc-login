import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props {
  stage: Stage;
  attempts: number;
}

export default function RadarDisplay({ stage, attempts }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stageRef = useRef<Stage>(stage);
  stageRef.current = stage;
  const attemptsRef = useRef<number>(attempts);
  attemptsRef.current = attempts;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = canvas.width;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const R = SIZE * 0.42;

    function accent() {
      const s = stageRef.current;
      if (s >= 4) return '239,68,68';
      if (s >= 2) return '251,191,36';
      return '0,212,255';
    }

    const greenColor = '0,255,136';

    interface Blip {
      angle: number; dist: number;
      label: string; severity: 'safe' | 'warn' | 'threat';
    }

    function getBlips(): Blip[] {
      const s = stageRef.current;
      const blips: Blip[] = [
        { angle: 0.4, dist: 0.3, label: 'NODE-A', severity: 'safe' },
        { angle: 1.8, dist: 0.55, label: 'NODE-B', severity: 'safe' },
        { angle: 3.2, dist: 0.2, label: 'SRV-01', severity: 'safe' },
        { angle: 4.5, dist: 0.7, label: 'EXT-03', severity: s >= 2 ? 'warn' : 'safe' },
        { angle: 2.1, dist: 0.8, label: 'UNKNWN', severity: s >= 1 ? 'threat' : 'safe' },
        { angle: 5.2, dist: 0.5, label: 'SVC-12', severity: 'safe' },
      ];
      if (s >= 3) blips.push({ angle: 0.9, dist: 0.65, label: 'THREAT', severity: 'threat' });
      if (s >= 4) blips.push({ angle: 3.7, dist: 0.45, label: 'INTRU', severity: 'threat' });
      return blips;
    }

    let sweepAngle = 0;
    const SWEEP_SPEED = 0.018;
    const TRAIL_LENGTH = Math.PI * 1.2;
    let pulseT = 0;

    function drawRings() {
      const ac = accent();
      for (let i = 1; i <= 4; i++) {
        const r = (R * i) / 4;
        ctx!.beginPath();
        ctx!.arc(CX, CY, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${ac},${i === 2 ? 0.18 : 0.12})`;
        ctx!.lineWidth = i === 2 ? 1.2 : 0.8;
        ctx!.stroke();
      }
    }

    function drawCrosshairs() {
      const ac = accent();
      ctx!.strokeStyle = `rgba(${ac},0.1)`;
      ctx!.lineWidth = 0.8;
      ctx!.setLineDash([3, 6]);
      ctx!.beginPath(); ctx!.moveTo(CX, CY - R); ctx!.lineTo(CX, CY + R); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(CX - R, CY); ctx!.lineTo(CX + R, CY); ctx!.stroke();
      ctx!.setLineDash([]);

      /* radial grid axes — 8 spokes from center for a tactical radar look */
      ctx!.strokeStyle = `rgba(${ac},0.06)`;
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx!.beginPath();
        ctx!.moveTo(CX, CY);
        ctx!.lineTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R);
        ctx!.stroke();
      }

      /* compass bearing labels */
      ctx!.fillStyle = `rgba(${ac},0.25)`;
      ctx!.font = `5px "Share Tech Mono", monospace`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      const labels = ['N','NE','E','SE','S','SW','W','NW'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        ctx!.fillText(labels[i], CX + Math.cos(a) * (R + 6), CY + Math.sin(a) * (R + 6));
      }
    }

    function drawSweep() {
      const ac = accent();
      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(CX, CY);
      ctx!.arc(CX, CY, R, sweepAngle - TRAIL_LENGTH, sweepAngle);
      ctx!.closePath();
      const grad = ctx!.createRadialGradient(CX, CY, 0, CX, CY, R);
      grad.addColorStop(0, `rgba(${ac},0)`);
      grad.addColorStop(0.5, `rgba(${ac},0.03)`);
      grad.addColorStop(1, `rgba(${ac},0.08)`);
      ctx!.fillStyle = grad;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.moveTo(CX, CY);
      ctx!.lineTo(CX + Math.cos(sweepAngle) * R, CY + Math.sin(sweepAngle) * R);
      ctx!.strokeStyle = `rgba(${ac},0.7)`;
      ctx!.lineWidth = 1.5;
      ctx!.shadowBlur = 8;
      ctx!.shadowColor = `rgba(${ac},0.6)`;
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      ctx!.restore();
    }

    function drawBlips() {
      const blips = getBlips();
      const ac = accent();

      /* network connections between nearby blips */
      for (let i = 0; i < blips.length; i++) {
        for (let j = i + 1; j < blips.length; j++) {
          const x1 = CX + Math.cos(blips[i].angle) * blips[i].dist * R;
          const y1 = CY + Math.sin(blips[i].angle) * blips[i].dist * R;
          const x2 = CX + Math.cos(blips[j].angle) * blips[j].dist * R;
          const y2 = CY + Math.sin(blips[j].angle) * blips[j].dist * R;
          const d = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
          if (d < R * 0.5) {
            ctx!.strokeStyle = `rgba(${ac},${0.08 * (1 - d / (R * 0.5))})`;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(x1, y1); ctx!.lineTo(x2, y2); ctx!.stroke();
          }
        }
      }

      for (const blip of blips) {
        const bx = CX + Math.cos(blip.angle) * blip.dist * R;
        const by = CY + Math.sin(blip.angle) * blip.dist * R;

        const blipAngle = blip.angle % (Math.PI * 2);
        const diff = ((sweepAngle - blipAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const flash = diff < TRAIL_LENGTH ? (1 - diff / TRAIL_LENGTH) : 0;

        const color = blip.severity === 'threat'
          ? '239,68,68'
          : blip.severity === 'warn'
          ? '251,191,36'
          : greenColor;

        const alpha = 0.35 + flash * 0.65;

        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(bx, by, 2.5 + flash * 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},${alpha})`;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = `rgba(${color},0.7)`;
        ctx!.fill();

        if (flash > 0.3) {
          ctx!.beginPath();
          ctx!.arc(bx, by, 6 + flash * 4, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(${color},${flash * 0.35})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
        ctx!.restore();

        /* target marker brackets for threat blips */
        if (blip.severity === 'threat' && flash > 0.5) {
          ctx!.strokeStyle = `rgba(${color},${flash * 0.5})`;
          ctx!.lineWidth = 0.8;
          const bs = 5;
          ctx!.beginPath();
          ctx!.moveTo(bx - bs, by - bs + 2); ctx!.lineTo(bx - bs, by - bs); ctx!.lineTo(bx - bs + 2, by - bs);
          ctx!.moveTo(bx + bs, by - bs + 2); ctx!.lineTo(bx + bs, by - bs); ctx!.lineTo(bx + bs - 2, by - bs);
          ctx!.moveTo(bx - bs, by + bs - 2); ctx!.lineTo(bx - bs, by + bs); ctx!.lineTo(bx - bs + 2, by + bs);
          ctx!.moveTo(bx + bs, by + bs - 2); ctx!.lineTo(bx + bs, by + bs); ctx!.lineTo(bx + bs - 2, by + bs);
          ctx!.stroke();
        }
      }
    }

    function drawCenter() {
      const ac = accent();
      const pulse = (Math.sin(pulseT * Math.PI * 2) + 1) / 2;
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(CX, CY, 3 + pulse * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${ac},${0.7 + pulse * 0.3})`;
      ctx!.shadowBlur = 12;
      ctx!.shadowColor = `rgba(${ac},0.8)`;
      ctx!.fill();

      /* expanding pulse */
      const pulseR = (pulseT % 1) * R * 0.4;
      ctx!.beginPath();
      ctx!.arc(CX, CY, pulseR, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${ac},${0.12 * (1 - (pulseT % 1))})`;
      ctx!.lineWidth = 0.6;
      ctx!.stroke();
      ctx!.restore();
    }

    function drawLabel() {
      const ac = accent();
      ctx!.fillStyle = `rgba(${ac},0.35)`;
      ctx!.font = `bold 7px "Share Tech Mono", monospace`;
      ctx!.textAlign = 'center';
      ctx!.fillText(`${attemptsRef.current} EVENTS`, CX, SIZE - 4);
    }

    function frame() {
      ctx!.clearRect(0, 0, SIZE, SIZE);

      const ac = accent();
      const bgGrad = ctx!.createRadialGradient(CX, CY, 0, CX, CY, R);
      bgGrad.addColorStop(0, `rgba(${ac},0.04)`);
      bgGrad.addColorStop(1, 'rgba(2,10,18,0)');
      ctx!.fillStyle = bgGrad;
      ctx!.beginPath();
      ctx!.arc(CX, CY, R, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(CX, CY, R, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${ac},0.3)`;
      ctx!.lineWidth = 1.2;
      ctx!.stroke();

      drawRings();
      drawCrosshairs();
      drawSweep();
      drawBlips();
      drawCenter();
      drawLabel();

      sweepAngle = (sweepAngle + SWEEP_SPEED) % (Math.PI * 2);
      pulseT = (pulseT + 0.01) % 1;
      animRef.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
