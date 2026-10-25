import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; attempts: number; }

interface Attack {
  fromX: number; fromY: number;
  toX: number; toY: number;
  progress: number;
  speed: number;
  color: string;
}

/**
 * Stylized global threat map — abstract continent silhouettes
 * with animated attack vectors converging on a central node.
 */
export default function GlobalThreatMap({ stage, attempts }: Props) {
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

    const W = canvas.width;
    const H = canvas.height;

    /* abstract continent blobs — simplified shapes */
    const continents = [
      { pts: [[15,35],[30,25],[45,30],[50,45],[40,55],[25,50],[18,45]], cx: 32, cy: 40, label: 'NA' },
      { pts: [[55,30],[68,22],[72,35],[65,48],[58,40]], cx: 62, cy: 34, label: 'EU' },
      { pts: [[60,45],[75,42],[80,55],[72,68],[65,60]], cx: 70, cy: 52, label: 'AF' },
      { pts: [[75,25],[88,20],[92,35],[85,42],[78,35]], cx: 83, cy: 30, label: 'AS' },
      { pts: [[80,55],[90,52],[88,62],[82,60]], cx: 85, cy: 57, label: 'AU' },
      { pts: [[20,60],[35,58],[30,68],[22,65]], cx: 27, cy: 62, label: 'SA' },
    ];

    const attacks: Attack[] = [];
    const targetX = 50;
    const targetY = 50;

    function spawnAttack() {
      const cont = continents[Math.floor(Math.random() * continents.length)];
      const s = stageRef.current;
      const isHostile = s >= 2;
      const color = s >= 4 ? '239,68,68' : s >= 2 ? '251,191,36' : '0,212,255';
      attacks.push({
        fromX: cont.cx + (Math.random() - 0.5) * 8,
        fromY: cont.cy + (Math.random() - 0.5) * 8,
        toX: targetX,
        toY: targetY,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        color,
      });
    }

    let frameCount = 0;

    function frame() {
      ctx!.clearRect(0, 0, W, H);
      const s = stageRef.current;
      const accent = s >= 4 ? '239,68,68' : s >= 2 ? '251,191,36' : '0,212,255';

      /* grid background */
      ctx!.strokeStyle = `rgba(${accent},0.04)`;
      ctx!.lineWidth = 0.5;
      for (let x = 0; x < W; x += 15) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = 0; y < H; y += 15) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }

      /* draw continents as filled blobs */
      for (const cont of continents) {
        ctx!.beginPath();
        const pts = cont.pts;
        ctx!.moveTo(pts[0][0] * W / 100, pts[0][1] * H / 100);
        for (let i = 1; i < pts.length; i++) {
          ctx!.lineTo(pts[i][0] * W / 100, pts[i][1] * H / 100);
        }
        ctx!.closePath();
        ctx!.fillStyle = `rgba(${accent},0.06)`;
        ctx!.fill();
        ctx!.strokeStyle = `rgba(${accent},0.15)`;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();

        /* continent label */
        ctx!.fillStyle = `rgba(${accent},0.2)`;
        ctx!.font = `5px "Share Tech Mono", monospace`;
        ctx!.textAlign = 'center';
        ctx!.fillText(cont.label, cont.cx * W / 100, cont.cy * H / 100);
      }

      /* center target node */
      const tx = targetX * W / 100;
      const ty = targetY * H / 100;
      const pulse = (Math.sin(frameCount * 0.05) + 1) / 2;

      /* expanding rings at target */
      for (let i = 0; i < 2; i++) {
        const r = ((frameCount * 0.5 + i * 30) % 60);
        ctx!.beginPath();
        ctx!.arc(tx, ty, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${accent},${0.15 * (1 - r / 60)})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      ctx!.beginPath();
      ctx!.arc(tx, ty, 3 + pulse * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${accent},${0.8 + pulse * 0.2})`;
      ctx!.shadowBlur = 8;
      ctx!.shadowColor = `rgba(${accent},0.6)`;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      /* spawn attacks periodically */
      frameCount++;
      const spawnRate = s >= 4 ? 15 : s >= 2 ? 25 : 40;
      if (frameCount % spawnRate === 0 && attacks.length < 6) {
        spawnAttack();
      }

      /* draw and update attacks as bezier trajectory arcs */
      for (let i = attacks.length - 1; i >= 0; i--) {
        const atk = attacks[i];
        atk.progress += atk.speed;
        if (atk.progress >= 1) {
          attacks.splice(i, 1);
          continue;
        }

        const fx = atk.fromX * W / 100;
        const fy = atk.fromY * H / 100;
        /* control point: midpoint lifted perpendicular to the line */
        const midX = (fx + tx) / 2;
        const midY = (fy + ty) / 2;
        const dx = tx - fx;
        const dy = ty - fy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const lift = Math.min(22, len * 0.35);
        const perpX = -dy / (len || 1);
        const perpY = dx / (len || 1);
        const cpX = midX + perpX * lift;
        const cpY = midY + perpY * lift - lift * 0.4;

        /* current head position along the quadratic bezier */
        const t = atk.progress;
        const mt = 1 - t;
        const x = mt * mt * fx + 2 * mt * t * cpX + t * t * tx;
        const y = mt * mt * fy + 2 * mt * t * cpY + t * t * ty;

        /* full arc path — faded */
        ctx!.strokeStyle = `rgba(${atk.color},${0.12 * (1 - atk.progress * 0.4)})`;
        ctx!.lineWidth = 0.6;
        ctx!.beginPath();
        ctx!.moveTo(fx, fy);
        ctx!.quadraticCurveTo(cpX, cpY, tx, ty);
        ctx!.stroke();

        /* bright trail segment from head back along the curve */
        const trailT = Math.max(0, t - 0.18);
        const trailMt = 1 - trailT;
        const trailX = trailMt * trailMt * fx + 2 * trailMt * trailT * cpX + trailT * trailT * tx;
        const trailY = trailMt * trailMt * fy + 2 * trailMt * trailT * cpY + trailT * trailT * ty;
        ctx!.strokeStyle = `rgba(${atk.color},0.6)`;
        ctx!.lineWidth = 1;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = `rgba(${atk.color},0.5)`;
        ctx!.beginPath();
        ctx!.moveTo(trailX, trailY);
        ctx!.quadraticCurveTo(cpX, cpY, x, y);
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        /* attack head — glowing dot */
        ctx!.beginPath();
        ctx!.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${atk.color},0.95)`;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = `rgba(${atk.color},0.8)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;

        /* origin pulse */
        if (atk.progress < 0.3) {
          ctx!.beginPath();
          ctx!.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${atk.color},${0.5 * (1 - atk.progress / 0.3)})`;
          ctx!.fill();
        }
      }

      /* label */
      ctx!.fillStyle = `rgba(${accent},0.3)`;
      ctx!.font = `bold 7px "Share Tech Mono", monospace`;
      ctx!.textAlign = 'center';
      ctx!.fillText(`GLOBAL THREAT VECTORS · ${attemptsRef.current}`, W / 2, H - 3);

      animRef.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={110}
      style={{ display: 'block', width: '100%' }}
    />
  );
}
