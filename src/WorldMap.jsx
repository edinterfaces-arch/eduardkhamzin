import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const colors = ['#1fa89b', '#e26678', '#6f81d9'];
const easeOut = t => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

export default function WorldMap({ replay }) {
  const canvasRef = useRef(null);
  const surfaceRef = useRef(null);
  const dataRef = useRef(null);
  const pointerRef = useRef(null);
  const clickRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    let frame = 0, visible = true, width = 492, start = performance.now();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const fontFamily = getComputedStyle(canvas).fontFamily;
    const draw = now => {
      const data = dataRef.current;
      if (!data || !visible) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const height = width * data.height / data.width;
      const scale = width / data.width;
      const elapsed = (now - start) / 1000;
      ctx.setTransform(ratio * scale, 0, 0, ratio * scale, 0, 0);
      ctx.clearRect(0, 0, data.width, data.height);
      const reveal = reduced ? 1 : easeOut((elapsed - 0.15) / 1.2);
      const active = pointerRef.current?.country;
      for (const [x, y, country] of data.dots) {
        const seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233));
        const opacity = country === active ? 0.92 : 0.2 + seed * 0.62;
        ctx.fillStyle = `rgba(39,39,42,${opacity * reveal})`;
        ctx.beginPath();
        ctx.arc(x, y + (1 - reveal) * (8 + seed * 12), 0.85 * reveal, 0, Math.PI * 2);
        ctx.fill();
      }
      const [hx, hy] = data.home;
      const progress = reduced ? 1 : easeOut((elapsed - 0.5) / 1.7);
      ctx.lineWidth = 0.6;
      data.destinations.forEach(([x, y], index) => {
        const cx = (x + hx) / 2;
        const cy = Math.min(hy, y) - Math.min(65, Math.abs(x - hx) * 0.18);
        ctx.strokeStyle = `rgba(80,80,88,${0.24 * progress})`;
        ctx.beginPath(); ctx.moveTo(hx, hy);
        const steps = Math.max(1, Math.round(36 * progress));
        for (let i = 1; i <= steps; i++) {
          const t = i / 36, u = 1 - t;
          ctx.lineTo(u * u * hx + 2 * u * t * cx + t * t * x, u * u * hy + 2 * u * t * cy + t * t * y);
        }
        ctx.stroke();
        if (index < 3 && progress > 0.9) {
          const pulse = reduced ? 0 : ((elapsed * 0.45 + index * 0.31) % 1);
          ctx.fillStyle = colors[index];
          ctx.globalAlpha = 1 - pulse;
          ctx.beginPath(); ctx.arc(x, y, 2.7 + pulse * 5, 0, Math.PI * 2); ctx.strokeStyle = colors[index]; ctx.stroke();
          ctx.globalAlpha = 0.9;
          ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
      });
      ctx.fillStyle = '#2ca479';
      ctx.beginPath(); ctx.arc(hx, hy, 2.8 * reveal, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#71717a'; ctx.font = `9px ${fontFamily}`;
      ctx.fillText('HOME', hx + 8, hy + 13);
      if (clickRef.current) {
        const click = clickRef.current, age = (now - click.at) / 650;
        if (age < 1) {
          ctx.strokeStyle = `rgba(31,168,155,${1 - age})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(click.x, click.y, 3 + age * 14, 0, Math.PI * 2); ctx.stroke();
        } else clickRef.current = null;
      }
      if (!reduced || elapsed < 3 || clickRef.current) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(width * 280 / 540 * ratio);
      requestDraw();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestDraw(); });
    resize.observe(surfaceRef.current); observer.observe(surfaceRef.current);
    const onPointer = () => requestDraw();
    surfaceRef.current.addEventListener('pointermove', onPointer);
    surfaceRef.current.addEventListener('pointerdown', onPointer);
    fetch('/map-data.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Map unavailable'); return response.json(); })
      .then(data => { dataRef.current = data; start = performance.now(); requestDraw(); })
      .catch(error => { if (error.name !== 'AbortError') setTooltip({ name: 'Map unavailable', x: 50, y: 50 }); });
    const element = surfaceRef.current;
    return () => {
      controller.abort(); cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      element.removeEventListener('pointermove', onPointer); element.removeEventListener('pointerdown', onPointer);
    };
  }, [replay, reduced]);

  function inspect(event) {
    const data = dataRef.current;
    if (!data) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width * data.width;
    const y = (event.clientY - box.top) / box.height * data.height;
    let nearest = null, distance = 28;
    for (const point of data.dots) {
      const d = (point[0] - x) ** 2 + (point[1] - y) ** 2;
      if (d < distance) { distance = d; nearest = point; }
    }
    pointerRef.current = nearest ? { country: nearest[2] } : null;
    setTooltip(nearest ? { name: data.names[nearest[2]], x: x / data.width * 100, y: y / data.height * 100 } : null);
  }

  return <div className="world-map" ref={surfaceRef} onPointerMove={inspect}
    onPointerLeave={() => { pointerRef.current = null; setTooltip(null); }}
    onPointerDown={event => {
      inspect(event);
      const box = event.currentTarget.getBoundingClientRect();
      clickRef.current = { x: (event.clientX - box.left) / box.width * 540, y: (event.clientY - box.top) / box.height * 280, at: performance.now() };
    }}>
    <canvas ref={canvasRef} role="img" aria-label="Illustrative dotted world map with sample connections. All visitor data is a demo." />
    <AnimatePresence>{tooltip && <motion.div className="map-tooltip" role="status"
      style={{ left: `${Math.min(82, Math.max(18, tooltip.x))}%`, top: `${tooltip.y}%` }}
      initial={{ opacity: 0, y: 5, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
      {tooltip.name}<span>Sample connection</span>
    </motion.div>}</AnimatePresence>
  </div>;
}
