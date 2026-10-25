import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; attempts: number; }

/**
 * Live scrolling hex/binary data feed — reads like a packet capture.
 * Values are simulated. Clearly labeled as simulation.
 */
export default function DataStream({ stage, attempts }: Props) {
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
    const LINE_H = 11;
    const MAX_LINES = Math.ceil(H / LINE_H) + 2;

    interface Line { text: string; y: number; alpha: number; color: string; }
    let lines: Line[] = [];

    function hex(n: number) { return n.toString(16).toUpperCase().padStart(2, '0'); }
    function genLine(): string {
      const s = stageRef.current;
      const prefix = s >= 4 ? 'ALERT' : s >= 2 ? 'WARN' : 'INFO';
      const src = `${hex(Math.floor(Math.random()*256))}.${hex(Math.floor(Math.random()*256))}.${hex(Math.floor(Math.random()*256))}`;
      const dst = `${hex(Math.floor(Math.random()*256))}.${hex(Math.floor(Math.random()*256))}.${hex(Math.floor(Math.random()*256))}`;
      const proto = ['TCP', 'UDP', 'TLS', 'ICMP'][Math.floor(Math.random()*4)];
      const len = Math.floor(Math.random() * 1500);
      const flags = ['SYN', 'ACK', 'PSH', 'FIN', 'RST'][Math.floor(Math.random()*5)];
      return `${prefix} ${src} > ${dst} ${proto}/${flags} ${len}B`;
    }

    function spawnLine() {
      const s = stageRef.current;
      const color = s >= 4 ? '239,68,68' : s >= 2 ? '251,191,36' : '0,212,255';
      lines.unshift({ text: genLine(), y: 0, alpha: 1, color });
      if (lines.length > MAX_LINES) lines.pop();
      /* offset all lines down */
      lines.forEach(l => l.y += LINE_H);
    }

    let frameCount = 0;
    function frame() {
      frameCount++;
      ctx!.clearRect(0, 0, W, H);

      /* spawn new lines at interval */
      const s = stageRef.current;
      const interval = s >= 4 ? 20 : s >= 2 ? 28 : 35;
      if (frameCount % interval === 0) spawnLine();

      ctx!.font = `8px "Share Tech Mono", monospace`;
      ctx!.textAlign = 'left';
      ctx!.textBaseline = 'top';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        /* newest line fades in from top */
        const ageOpacity = i === 0 ? 0.9 : Math.max(0.1, 0.7 - i * 0.04);
        ctx!.fillStyle = `rgba(${line.color},${ageOpacity})`;
        ctx!.fillText(line.text, 4, i * LINE_H);
      }

      /* fade mask at bottom */
      const grad = ctx!.createLinearGradient(0, H - 20, 0, H);
      grad.addColorStop(0, 'rgba(4,8,18,0)');
      grad.addColorStop(1, 'rgba(4,8,18,0.9)');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, H - 20, W, 20);

      animRef.current = requestAnimationFrame(frame);
    }

    /* pre-fill */
    for (let i = 0; i < MAX_LINES; i++) spawnLine();
    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return <canvas ref={canvasRef} width={220} height={140} style={{ display: 'block', width: '100%' }} />;
}
