import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';
import { useParallax } from '@/hooks/useParallax';

interface Props { stage: Stage; }

/**
 * Full-screen canvas: the atmospheric ring SOC backdrop.
 * Refined for depth — softer rings, slower rotation, travelling signal pulses.
 */
export default function HeroRings({ stage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const stageRef  = useRef<Stage>(stage);
  stageRef.current = stage;
  const parallax = useParallax();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, CX = 0, CY = 0;

    function resize() {
      W  = canvas!.width  = window.innerWidth;
      H  = canvas!.height = window.innerHeight;
      CX = W / 2;
      CY = H / 2;
    }

    function accent() {
      const s = stageRef.current;
      if (s >= 4) return { r: 239, g: 68,  b: 68  };
      if (s >= 2) return { r: 251, g: 191, b: 36  };
      return               { r: 0,   g: 212, b: 255 };
    }

    let rot1 = 0, rot2 = 0, rot3 = 0, sweep = 0, pulseT = 0;

    const ring1Nodes = [0, 72, 144, 216, 288].map(d => (d * Math.PI) / 180);
    const ring2Nodes = [30, 90, 150, 210, 270, 330].map(d => (d * Math.PI) / 180);

    /* travelling signals along connections */
    interface Signal { angle: number; radius: number; t: number; speed: number; from: number; to: number; }
    const signals: Signal[] = [];
    for (let i = 0; i < 4; i++) {
      signals.push({ angle: Math.random() * Math.PI * 2, radius: 0.6 + Math.random() * 0.2, t: Math.random(), speed: 0.003 + Math.random() * 0.004, from: Math.random() * Math.PI * 2, to: Math.random() * Math.PI * 2 });
    }

    function drawRing(radius: number, alpha: number, dashOn: number, dashOff: number, lineW: number, rotOff: number, cx: number, cy: number) {
      const { r, g, b } = accent();
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(rotOff);
      ctx!.beginPath();
      ctx!.arc(0, 0, radius, 0, Math.PI * 2);
      if (dashOn > 0) ctx!.setLineDash([dashOn, dashOff]);
      ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx!.lineWidth   = lineW;
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();
    }

    function drawNode(angle: number, radius: number, rotOff: number, size: number, glow: boolean, pulse: number, cx: number, cy: number) {
      const { r, g, b } = accent();
      const x = cx + Math.cos(angle + rotOff) * radius;
      const y = cy + Math.sin(angle + rotOff) * radius;

      ctx!.save();
      if (glow) {
        ctx!.shadowBlur  = 16;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.7)`;
      }
      ctx!.beginPath();
      ctx!.arc(x, y, size + pulse * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = glow ? `rgba(200,240,255,${0.8 + pulse * 0.2})` : `rgba(${r},${g},${b},${0.5 + pulse * 0.3})`;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      /* subtle outer ring */
      ctx!.beginPath();
      ctx!.arc(x, y, size + 5 + pulse * 3, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${r},${g},${b},${0.15 + pulse * 0.15})`;
      ctx!.lineWidth   = 0.8;
      ctx!.stroke();
      ctx!.restore();
    }

    function drawSweepLine(radius: number, cx: number, cy: number) {
      const { r, g, b } = accent();
      ctx!.save();
      ctx!.translate(cx, cy);

      /* soft trail */
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.arc(0, 0, radius, sweep - 1.3, sweep);
      ctx!.closePath();
      const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},0.04)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.09)`);
      ctx!.fillStyle = grad;
      ctx!.fill();

      /* sweep arm */
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.lineTo(Math.cos(sweep) * radius, Math.sin(sweep) * radius);
      ctx!.strokeStyle = `rgba(${r},${g},${b},0.6)`;
      ctx!.lineWidth   = 1.2;
      ctx!.shadowBlur  = 8;
      ctx!.shadowColor = `rgba(${r},${g},${b},0.5)`;
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      ctx!.restore();
    }

    function drawCentre(cx: number, cy: number) {
      const { r, g, b } = accent();
      const blob = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 120);
      blob.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
      blob.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = blob;
      ctx!.fillRect(cx - 120, cy - 120, 240, 240);

      /* centre dot */
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${r},${g},${b},0.7)`;
      ctx!.shadowBlur  = 14;
      ctx!.shadowColor = `rgba(${r},${g},${b},0.8)`;
      ctx!.fill();
      ctx!.shadowBlur = 0;
      ctx!.restore();

      /* expanding pulse rings */
      const pulseR = (pulseT % 1) * 60;
      ctx!.beginPath();
      ctx!.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${r},${g},${b},${0.15 * (1 - (pulseT % 1))})`;
      ctx!.lineWidth   = 0.8;
      ctx!.stroke();
    }

    function drawTicks(radius: number, cx: number, cy: number) {
      const { r, g, b } = accent();
      const tickCount = 60;
      ctx!.save();
      ctx!.translate(cx, cy);
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2;
        const isMajor = i % 10 === 0;
        const inner   = radius + 3;
        const outer   = radius + (isMajor ? 10 : 5);
        ctx!.strokeStyle = `rgba(${r},${g},${b},${isMajor ? 0.35 : 0.12})`;
        ctx!.lineWidth   = isMajor ? 1 : 0.6;
        ctx!.beginPath();
        ctx!.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx!.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawFloor(cx: number) {
      const { r, g, b } = accent();
      const LINES = 8;
      const bottom = H;
      const vanishY = CY + 30;

      ctx!.save();
      for (let i = 0; i <= LINES; i++) {
        const t = i / LINES;
        const xEnd = cx + (t - 0.5) * W * 1.4;
        const xStart = cx + (t - 0.5) * W * 0.1;
        const alpha  = (1 - Math.abs(t - 0.5) * 1.6) * 0.07;
        if (alpha <= 0) continue;
        ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx!.lineWidth   = 0.6;
        ctx!.beginPath();
        ctx!.moveTo(xStart, vanishY);
        ctx!.lineTo(xEnd, bottom);
        ctx!.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const yf = i / 4;
        const y  = vanishY + (bottom - vanishY) * (yf * yf);
        const halfW = cx * 0.1 + (cx * 1.4 - cx * 0.1) * yf;
        ctx!.strokeStyle = `rgba(${r},${g},${b},${yf * 0.06})`;
        ctx!.lineWidth   = 0.6;
        ctx!.beginPath();
        ctx!.moveTo(cx - halfW, y);
        ctx!.lineTo(cx + halfW, y);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawSignals(cx: number, cy: number) {
      const { r, g, b } = accent();
      for (const sig of signals) {
        sig.t += sig.speed;
        if (sig.t >= 1) { sig.t = 0; sig.from = sig.to; sig.to = Math.random() * Math.PI * 2; }
        const angle = sig.from + (sig.to - sig.from) * sig.t;
        const radius = Math.min(W, H) * 0.38 * sig.radius;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        ctx!.beginPath();
        ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200,240,255,${0.6 * (1 - Math.abs(sig.t - 0.5) * 1.5)})`;
        ctx!.shadowBlur  = 10;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }
    }

    /* draw network connection lines between ring1 and ring2 nodes */
    function drawConnections(cx: number, cy: number) {
      const { r, g, b } = accent();
      const R = Math.min(W, H) * 0.36;
      for (let i = 0; i < ring1Nodes.length; i++) {
        const a1 = ring1Nodes[i] + rot2;
        const x1 = cx + Math.cos(a1) * R * 0.78;
        const y1 = cy + Math.sin(a1) * R * 0.78;
        for (let j = 0; j < ring2Nodes.length; j++) {
          if (Math.abs(i - j) > 2 && i !== j) continue;
          const a2 = ring2Nodes[j] + rot3;
          const x2 = cx + Math.cos(a2) * R * 0.58;
          const y2 = cy + Math.sin(a2) * R * 0.58;
          const d = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
          if (d > R * 0.35) continue;
          ctx!.strokeStyle = `rgba(${r},${g},${b},${0.06 * (1 - d / (R * 0.35))})`;
          ctx!.lineWidth = 0.5;
          ctx!.beginPath();
          ctx!.moveTo(x1, y1); ctx!.lineTo(x2, y2); ctx!.stroke();
        }
      }
    }

    function frame() {
      ctx!.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.36;
      const px = parallax.current.x;
      const py = parallax.current.y;
      const cx = CX + px * 12;
      const cy = CY + py * 12;

      drawFloor(cx);

      /* subtle crosshair */
      const { r, g, b } = accent();
      ctx!.save();
      ctx!.setLineDash([4, 16]);
      ctx!.strokeStyle = `rgba(${r},${g},${b},0.06)`;
      ctx!.lineWidth = 0.8;
      const sz = R * 1.1;
      ctx!.beginPath(); ctx!.moveTo(cx, cy - sz); ctx!.lineTo(cx, cy + sz); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(cx - sz, cy); ctx!.lineTo(cx + sz, cy); ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();

      /* rings */
      drawRing(R,         0.14, 4, 10, 1,   rot1, cx, cy);
      drawTicks(R, cx, cy);
      drawRing(R * 0.78,  0.18, 8, 8,  1.2, rot2, cx, cy);
      drawRing(R * 0.58,  0.22, 0, 0,  1,   rot3, cx, cy);
      drawRing(R * 0.38,  0.26, 3, 10, 0.8, rot1 * -1, cx, cy);
      drawRing(R * 0.20,  0.30, 0, 0,  1.2, 0, cx, cy);
      drawRing(R * 0.08,  0.35, 0, 0,  0.8, 0, cx, cy);

      drawSweepLine(R * 0.78, cx, cy);
      drawConnections(cx, cy);
      drawSignals(cx, cy);

      /* nodes with pulse */
      const pulse = (Math.sin(pulseT * Math.PI * 2) + 1) / 2;
      ring1Nodes.forEach(angle => drawNode(angle, R * 0.78, rot2, 2.8, true, pulse, cx, cy));
      ring2Nodes.forEach((angle, i) => drawNode(angle, R * 0.58, rot3, 2, i % 3 === 0, pulse * 0.7, cx, cy));

      drawCentre(cx, cy);

      /* advance — slower, calmer */
      rot1  += 0.0008;
      rot2  -= 0.0014;
      rot3  += 0.0022;
      sweep  = (sweep + 0.018) % (Math.PI * 2);
      pulseT = (pulseT + 0.008) % 1;

      animRef.current = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [parallax]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />;
}
