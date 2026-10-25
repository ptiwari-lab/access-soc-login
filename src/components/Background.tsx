import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';
import { useParallax } from '@/hooks/useParallax';

interface Props { stage: Stage; }

interface Node { x: number; y: number; vx: number; vy: number; r: number; alpha: number; phase: number; }
interface Signal { fromNode: number; toNode: number; t: number; speed: number; }

export default function Background({ stage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef  = useRef<number>(0);
  const stageRef = useRef<Stage>(stage);
  stageRef.current = stage;
  const parallax = useParallax();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01アBCDEFX#$%@!><={}[]ハヒフヘホ';
    interface Col { x: number; y: number; speed: number; len: number; chars: string[]; age: number; }
    let cols: Col[] = [];
    const COL_W = 16;

    let nodes: Node[] = [];
    const NODE_COUNT = 48;
    let signals: Signal[] = [];

    function init() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;

      cols = [];
      const numCols = Math.floor(W / COL_W);
      for (let i = 0; i < numCols; i++) {
        cols.push(spawnCol(i * COL_W, -Math.random() * H));
      }

      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.2 + 0.4,
          alpha: Math.random() * 0.4 + 0.08,
          phase: Math.random() * Math.PI * 2,
        });
      }

      signals = [];
      for (let i = 0; i < 3; i++) {
        spawnSignal();
      }
    }

    function spawnSignal() {
      const from = Math.floor(Math.random() * NODE_COUNT);
      const to = Math.floor(Math.random() * NODE_COUNT);
      if (from === to) return;
      signals.push({ fromNode: from, toNode: to, t: 0, speed: 0.004 + Math.random() * 0.006 });
    }

    function spawnCol(x: number, startY: number): Col {
      const len = 8 + Math.floor(Math.random() * 22);
      return {
        x, y: startY,
        speed: 0.9 + Math.random() * 1.8,
        len,
        chars: Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
        age: 0,
      };
    }

    function getAccent() {
      const s = stageRef.current;
      if (s >= 4) return { r: 239, g: 68,  b: 68  };
      if (s >= 2) return { r: 251, g: 191, b: 36  };
      return               { r: 0,   g: 212, b: 255 };
    }

    function drawRain() {
      const { r, g, b } = getAccent();
      for (const col of cols) {
        col.y += col.speed;
        col.age++;
        if (col.age % 20 === 0) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        for (let i = 0; i < col.chars.length; i++) {
          const gy = col.y - i * COL_W;
          if (gy < -COL_W || gy > H + COL_W) continue;
          const frac = 1 - i / col.chars.length;
          const isHead = i === 0;
          const alpha = isHead ? 0.92 : frac * 0.45;
          if (isHead) {
            ctx!.fillStyle = `rgba(220,255,255,${alpha})`;
            ctx!.shadowBlur  = 10;
            ctx!.shadowColor = `rgba(${r},${g},${b},0.9)`;
          } else {
            ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx!.shadowBlur = 0;
          }
          ctx!.font = `${COL_W - 1}px "Space Mono","Courier New",monospace`;
          ctx!.fillText(col.chars[i], col.x, gy);
        }
        if (col.y - col.len * COL_W > H) {
          const idx = cols.indexOf(col);
          cols[idx] = spawnCol(col.x, -Math.random() * H * 0.5);
        }
      }
      ctx!.shadowBlur = 0;
    }

    function drawGrid(px: number, py: number) {
      const { r, g, b } = getAccent();
      const sz = 70;
      const ox = px * 8;
      const oy = py * 8;

      /* regular grid */
      ctx!.strokeStyle = `rgba(${r},${g},${b},0.04)`;
      ctx!.lineWidth   = 1;
      for (let x = ox % sz; x <= W; x += sz) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = oy % sz; y <= H; y += sz) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }

      /* perspective floor mesh — bottom third of screen */
      const vanishY = H * 0.55;
      const floorBottom = H;
      const numVPersp = 10;
      ctx!.strokeStyle = `rgba(${r},${g},${b},0.05)`;
      ctx!.lineWidth = 0.6;
      for (let i = 0; i <= numVPersp; i++) {
        const t = i / numVPersp;
        const x = W / 2 + (t - 0.5) * W * 2;
        ctx!.beginPath();
        ctx!.moveTo(W / 2 + (t - 0.5) * W * 0.1, vanishY);
        ctx!.lineTo(x, floorBottom);
        ctx!.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const yf = i / 5;
        const y = vanishY + (floorBottom - vanishY) * (yf * yf);
        const halfW = W * 0.05 + (W - W * 0.05) * yf;
        ctx!.strokeStyle = `rgba(${r},${g},${b},${yf * 0.04})`;
        ctx!.beginPath();
        ctx!.moveTo(W / 2 - halfW, y);
        ctx!.lineTo(W / 2 + halfW, y);
        ctx!.stroke();
      }
    }

    function drawNodes(px: number, py: number) {
      const { r, g, b } = getAccent();
      const ox = px * 15;
      const oy = py * 15;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        n.phase += 0.02;
        const pulse = (Math.sin(n.phase) + 1) / 2;
        ctx!.beginPath();
        ctx!.arc(n.x + ox, n.y + oy, n.r + pulse * 0.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},${n.alpha + pulse * 0.1})`;
        ctx!.fill();
      }
      /* connections with proximity fade */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x + ox) - (nodes[j].x + ox);
          const dy = (nodes[i].y + oy) - (nodes[j].y + oy);
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx!.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 130) * 0.12})`;
            ctx!.lineWidth   = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x + ox, nodes[i].y + oy);
            ctx!.lineTo(nodes[j].x + ox, nodes[j].y + oy);
            ctx!.stroke();
          }
        }
      }

      /* travelling signals along connections */
      for (let i = signals.length - 1; i >= 0; i--) {
        const sig = signals[i];
        sig.t += sig.speed;
        if (sig.t >= 1) {
          signals.splice(i, 1);
          continue;
        }
        const from = nodes[sig.fromNode];
        const to = nodes[sig.toNode];
        if (!from || !to) { signals.splice(i, 1); continue; }
        const sx = (from.x + ox) + ((to.x + ox) - (from.x + ox)) * sig.t;
        const sy = (from.y + oy) + ((to.y + oy) - (from.y + oy)) * sig.t;
        const fade = 1 - Math.abs(sig.t - 0.5) * 1.8;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200,240,255,${0.6 * Math.max(0, fade)})`;
        ctx!.shadowBlur  = 8;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }
      if (signals.length < 3 && Math.random() < 0.02) spawnSignal();
    }

    function drawAtmosphere() {
      const { r, g, b } = getAccent();

      /* deep navy base gradient */
      const baseGrad = ctx!.createLinearGradient(0, 0, 0, H);
      baseGrad.addColorStop(0, 'rgba(3,6,14,0.15)');
      baseGrad.addColorStop(0.5, 'rgba(2,5,12,0.05)');
      baseGrad.addColorStop(1, 'rgba(1,3,8,0.15)');
      ctx!.fillStyle = baseGrad;
      ctx!.fillRect(0, 0, W, H);

      /* vignette */
      const vig = ctx!.createRadialGradient(W / 2, H / 2, H * 0.08, W / 2, H / 2, H * 0.92);
      vig.addColorStop(0, 'rgba(2,8,16,0)');
      vig.addColorStop(1, 'rgba(1,4,10,0.85)');
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, W, H);

      /* center bloom */
      const bloom = ctx!.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.38);
      bloom.addColorStop(0, `rgba(${r},${g},${b},0.06)`);
      bloom.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = bloom;
      ctx!.fillRect(0, 0, W, H);

      /* side ambient lights — electric blue left, accent right */
      const leftBloom = ctx!.createRadialGradient(0, H * 0.3, 0, 0, H * 0.3, W * 0.25);
      leftBloom.addColorStop(0, 'rgba(77,139,255,0.04)');
      leftBloom.addColorStop(1, 'rgba(77,139,255,0)');
      ctx!.fillStyle = leftBloom;
      ctx!.fillRect(0, 0, W, H);

      const rightBloom = ctx!.createRadialGradient(W, H * 0.6, 0, W, H * 0.6, W * 0.25);
      rightBloom.addColorStop(0, `rgba(${r},${g},${b},0.03)`);
      rightBloom.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = rightBloom;
      ctx!.fillRect(0, 0, W, H);

      /* bottom floor light */
      const floor = ctx!.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.55);
      floor.addColorStop(0, `rgba(${r},${g},${b},0.07)`);
      floor.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = floor;
      ctx!.fillRect(0, 0, W, H);
    }

    let scanY = 0;
    function drawScanLine() {
      const { r, g, b } = getAccent();
      scanY = (scanY + 0.6) % H;
      const sg = ctx!.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      sg.addColorStop(0, `rgba(${r},${g},${b},0)`);
      sg.addColorStop(0.5, `rgba(${r},${g},${b},0.14)`);
      sg.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = sg;
      ctx!.fillRect(0, scanY - 4, W, 8);
    }

    function frame() {
      const s = stageRef.current;
      const trailAlpha = s >= 5 ? 0.12 : s >= 3 ? 0.14 : 0.16;
      ctx!.fillStyle = `rgba(2,8,16,${trailAlpha})`;
      ctx!.fillRect(0, 0, W, H);

      const px = parallax.current.x;
      const py = parallax.current.y;

      drawGrid(px, py);
      drawRain();
      drawNodes(px, py);
      drawScanLine();
      drawAtmosphere();

      animRef.current = requestAnimationFrame(frame);
    }

    init();
    frame();

    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', init);
    };
  }, [parallax]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}
