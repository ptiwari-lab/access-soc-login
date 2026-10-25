import { useEffect, useRef } from 'react';
import type { Stage } from '@/hooks/useAccessSystem';

interface Props { stage: Stage; }

interface P3 { x: number; y: number; z: number; }

/**
 * Holographic wireframe globe — rotating latitude/longitude sphere
 * with orbital scanning rings, glowing lock markers, and a floor pedestal.
 * Rendered on canvas with a simple 3D projection.
 */
export default function HoloGlobe({ stage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stageRef = useRef<Stage>(stage);
  stageRef.current = stage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = canvas.width;
    const CX = SIZE / 2;
    const CY = SIZE / 2 - 10;
    const R = SIZE * 0.32;

    /* build sphere grid points */
    const LAT_LINES = 9;   // latitude rings
    const LON_LINES = 12;  // longitude meridians
    const SEGMENTS = 48;   // points per ring

    function spherePoint(lat: number, lon: number): P3 {
      const latR = (lat * Math.PI) / 180;
      const lonR = (lon * Math.PI) / 180;
      return {
        x: R * Math.cos(latR) * Math.cos(lonR),
        y: R * Math.sin(latR),
        z: R * Math.cos(latR) * Math.sin(lonR),
      };
    }

    /* precompute rings as arrays of points (param lon varies) */
    const latRings: P3[][] = [];
    for (let i = 1; i < LAT_LINES; i++) {
      const lat = -90 + (180 * i) / LAT_LINES;
      const ring: P3[] = [];
      for (let s = 0; s <= SEGMENTS; s++) {
        const lon = (360 * s) / SEGMENTS;
        ring.push(spherePoint(lat, lon));
      }
      latRings.push(ring);
    }

    /* precompute meridians as arrays of points (param lat varies) */
    const lonRings: P3[][] = [];
    for (let i = 0; i < LON_LINES; i++) {
      const lon = (360 * i) / LON_LINES;
      const ring: P3[] = [];
      for (let s = 0; s <= SEGMENTS; s++) {
        const lat = -90 + (180 * s) / SEGMENTS;
        ring.push(spherePoint(lat, lon));
      }
      lonRings.push(ring);
    }

    /* lock icon positions on globe surface — distributed */
    const lockPoints: { p: P3; label: string }[] = [
      { p: spherePoint(30, 40),  label: 'NA' },
      { p: spherePoint(50, 10),  label: 'EU' },
      { p: spherePoint(-10, 20), label: 'AF' },
      { p: spherePoint(35, 110), label: 'AS' },
      { p: spherePoint(-30, 140),label: 'AU' },
      { p: spherePoint(-15, 290),label: 'SA' },
    ];

    /* orbiting threat blips that travel around the globe */
    interface Blip { angle: number; lat: number; speed: number; }
    const blips: Blip[] = [];
    for (let i = 0; i < 4; i++) {
      blips.push({ angle: Math.random() * Math.PI * 2, lat: (Math.random() - 0.5) * 120, speed: 0.006 + Math.random() * 0.01 });
    }

    let rotY = 0;
    let scanT = 0;
    let pulseT = 0;

    function project(p: P3): { x: number; y: number; z: number; scale: number } {
      /* rotate around Y axis */
      const cos = Math.cos(rotY);
      const sin = Math.sin(rotY);
      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;
      /* simple orthographic-ish projection with mild perspective */
      const persp = 600 / (600 + z);
      return { x: CX + x * persp, y: CY + p.y * persp, z, scale: persp };
    }

    function accent() {
      const s = stageRef.current;
      if (s >= 4) return { r: 239, g: 68, b: 68 };
      if (s >= 2) return { r: 251, g: 191, b: 36 };
      return { r: 0, g: 212, b: 255 };
    }

    function drawRing(ring: P3[], alphaScale: number) {
      const { r, g, b } = accent();
      ctx!.beginPath();
      let started = false;
      for (let i = 0; i < ring.length; i++) {
        const p = project(ring[i]);
        /* only draw front-facing points brightly; back faded */
        const facing = p.z >= 0 ? 1 : 0.25;
        if (!started) { ctx!.moveTo(p.x, p.y); started = true; }
        else ctx!.lineTo(p.x, p.y);
        void facing;
      }
      ctx!.strokeStyle = `rgba(${r},${g},${b},${0.1 * alphaScale})`;
      ctx!.lineWidth = 0.6;
      ctx!.stroke();
    }

    function drawRingWithDepth(ring: P3[]) {
      /* draw ring in segments, fading by depth — gives a true 3D feel */
      const { r, g, b } = accent();
      for (let i = 0; i < ring.length - 1; i++) {
        const p1 = project(ring[i]);
        const p2 = project(ring[i + 1]);
        const avgZ = (p1.z + p2.z) / 2;
        const facing = avgZ >= 0 ? 1 : 0.18;
        const depth = (avgZ + R) / (2 * R); // 0..1
        const alpha = 0.08 + facing * 0.22 * (1 - depth * 0.4);
        ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx!.lineWidth = avgZ >= 0 ? 0.8 : 0.4;
        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.y);
        ctx!.lineTo(p2.x, p2.y);
        ctx!.stroke();
      }
    }

    function drawOrbitalRings() {
      const { r, g, b } = accent();
      /* tilted ellipse rings around the globe — sci-fi orbital rings */
      const rings = [
        { ry: R * 1.25, tilt: 0.5, dash: [4, 4] },
        { ry: R * 1.5,  tilt: -0.35, dash: [2, 8] },
      ];
      for (const ring of rings) {
        ctx!.save();
        ctx!.translate(CX, CY);
        ctx!.rotate(ring.tilt);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, R * 1.1, ring.ry, 0, 0, Math.PI * 2);
        ctx!.setLineDash(ring.dash);
        ctx!.strokeStyle = `rgba(${r},${g},${b},0.15)`;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();
        ctx!.setLineDash([]);

        /* a traveling pulse along this orbit */
        const pulseAngle = scanT * 2 + ring.tilt;
        const px = Math.cos(pulseAngle) * R * 1.1;
        const py = Math.sin(pulseAngle) * ring.ry;
        ctx!.beginPath();
        ctx!.arc(px, py, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},0.8)`;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.restore();
      }
    }

    function drawFloorPedestal() {
      const { r, g, b } = accent();
      const baseY = CY + R + 18;
      /* glowing pedestal platform — an ellipse */
      ctx!.save();
      /* glow underlay */
      const glow = ctx!.createRadialGradient(CX, baseY, 0, CX, baseY, R * 1.3);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = glow;
      ctx!.fillRect(CX - R * 1.3, baseY - 10, R * 2.6, 30);

      /* pedestal rings */
      for (let i = 0; i < 3; i++) {
        const w = R * (1.1 - i * 0.15);
        const yy = baseY + i * 4;
        ctx!.beginPath();
        ctx!.ellipse(CX, yy, w, w * 0.18, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.25 - i * 0.06})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
      /* vertical light beam from pedestal up to globe */
      const beam = ctx!.createLinearGradient(CX, CY, CX, baseY);
      beam.addColorStop(0, `rgba(${r},${g},${b},0)`);
      beam.addColorStop(1, `rgba(${r},${g},${b},0.08)`);
      ctx!.fillStyle = beam;
      ctx!.fillRect(CX - 1, CY, 2, baseY - CY);
      ctx!.restore();
    }

    function drawLockMarkers() {
      const { r, g, b } = accent();
      for (const lp of lockPoints) {
        const p = project(lp.p);
        if (p.z < 0) continue; // only draw front-facing
        const scale = p.scale;
        /* pulsing ring */
        const pulse = (Math.sin(pulseT * Math.PI * 2 + lp.p.x) + 1) / 2;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 5 + pulse * 2, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.4 + pulse * 0.3})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();

        /* center dot */
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.8 * scale, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.7)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;

        /* label */
        ctx!.fillStyle = `rgba(${r},${g},${b},0.5)`;
        ctx!.font = `6px "Share Tech Mono", monospace`;
        ctx!.textAlign = 'center';
        ctx!.fillText(lp.label, p.x, p.y - 7);
      }
    }

    function drawScanLine() {
      const { r, g, b } = accent();
      /* vertical scanning plane sweeping across the globe */
      const t = scanT % 1;
      const xOff = -R + t * 2 * R;
      /* draw the meridian ellipse at this x offset */
      ctx!.save();
      ctx!.translate(CX + xOff, CY);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, Math.abs(R * R - xOff * xOff) ** 0.5 || 0.1, R, 0, -Math.PI / 2, Math.PI / 2);
      ctx!.strokeStyle = `rgba(${r},${g},${b},0.35)`;
      ctx!.lineWidth = 1;
      ctx!.shadowBlur = 8;
      ctx!.shadowColor = `rgba(${r},${g},${b},0.5)`;
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      ctx!.restore();
    }

    function drawBlips() {
      const { r, g, b } = accent();
      for (const blip of blips) {
        blip.angle += blip.speed;
        const lon = (blip.angle * 180 / Math.PI) % 360;
        const p = project(spherePoint(blip.lat, lon));
        if (p.z < 0) continue;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r},${g},${b},0.95)`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.8)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }
    }

    function frame() {
      ctx!.clearRect(0, 0, SIZE, SIZE);
      const { r, g, b } = accent();

      /* atmospheric glow behind globe */
      const glow = ctx!.createRadialGradient(CX, CY, R * 0.2, CX, CY, R * 1.8);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
      glow.addColorStop(0.6, `rgba(${r},${g},${b},0.03)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, SIZE, SIZE);

      drawFloorPedestal();

      /* back-facing rings first (faded), then front — but we draw all with depth */
      for (const ring of latRings) drawRingWithDepth(ring);
      for (const ring of lonRings) drawRingWithDepth(ring);

      drawOrbitalRings();
      drawScanLine();
      drawLockMarkers();
      drawBlips();

      /* center core glow */
      const corePulse = (Math.sin(pulseT * Math.PI * 2) + 1) / 2;
      ctx!.beginPath();
      ctx!.arc(CX, CY, 2 + corePulse * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${r},${g},${b},${0.6 + corePulse * 0.4})`;
      ctx!.shadowBlur = 14;
      ctx!.shadowColor = `rgba(${r},${g},${b},0.8)`;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      /* advance */
      rotY += 0.004;
      scanT = (scanT + 0.005) % 1;
      pulseT = (pulseT + 0.01) % 1;

      animRef.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      style={{ display: 'block', width: '100%', maxWidth: '360px', margin: '0 auto' }}
    />
  );
}
