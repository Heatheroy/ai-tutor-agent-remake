import { useEffect, useRef, useState } from 'react';

interface BookIntroProps {
  onDone: () => void;
}

const IMAGE = { w: 1024, h: 572 };
const BOOK_UV = { x: 0.6, y: 0.808 };
const ENTER_MS = 2600;
const GLYPHS = ['√', 'Σ', 'π', '∞', '∫', 'Δ', 'α', '≈', 'λ', '×', 'φ'];

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
};

type Glyph = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  ch: string;
  life: number;
  size: number;
};

export const BookIntro = ({ onDone }: BookIntroProps) => {
  const [phase, setPhase] = useState<'idle' | 'enter'>('idle');
  const rootRef = useRef<HTMLButtonElement>(null);
  const sceneRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase !== 'enter') {
      return;
    }
    const doneTimer = window.setTimeout(onDone, ENTER_MS);
    return () => window.clearTimeout(doneTimer);
  }, [phase, onDone]);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) {
      return;
    }

    const place = () => {
      const vw = root.clientWidth;
      const vh = root.clientHeight;
      const cover = Math.max(vw / IMAGE.w, vh / IMAGE.h);
      const originX = (vw - IMAGE.w * cover) / 2;
      const originY = (vh - IMAGE.h * cover) / 2;
      const x = originX + BOOK_UV.x * IMAGE.w * cover;
      const y = originY + BOOK_UV.y * IMAGE.h * cover;
      scene.style.transformOrigin = `${x}px ${y}px`;
    };

    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    let frame = 0;
    let width = 0;
    let height = 0;
    const nodes: Node[] = [];
    const glyphs: Glyph[] = [];

    const spawnGlyph = (fromBook = false): Glyph => ({
      x: fromBook ? width * (0.46 + Math.random() * 0.22) : Math.random() * width,
      y: fromBook ? height * (0.62 + Math.random() * 0.12) : height * (0.15 + Math.random() * 0.7),
      vy: -(0.18 + Math.random() * 0.38),
      vx: (Math.random() - 0.5) * 0.22,
      ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      life: Math.random(),
      size: 11 + Math.random() * 13,
    });

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(110, Math.max(64, (width * height) / 18000)));
      nodes.length = 0;
      for (let index = 0; index < count; index += 1) {
        const leftCluster = Math.random() < 0.42;
        nodes.push({
          x: leftCluster ? Math.random() * width * 0.48 : Math.random() * width,
          y: Math.random() * height * 0.82,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() < 0.15 ? 2.2 + Math.random() * 1.4 : 0.7 + Math.random() * 1.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
      glyphs.length = 0;
      for (let index = 0; index < 18; index += 1) {
        glyphs.push(spawnGlyph(index < 8));
      }
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const linkDistance = Math.max(110, Math.min(width, height) * 0.16);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height * 0.84;
        if (node.y > height * 0.86) node.y = -20;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > linkDistance) {
            continue;
          }
          const alpha = (1 - dist / linkDistance) * 0.42;
          context.strokeStyle = `rgba(186, 224, 255, ${alpha})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      for (const node of nodes) {
        const twinkle = 0.45 + Math.sin(time * 0.002 + node.phase) * 0.4;
        context.beginPath();
        context.fillStyle = `rgba(214, 240, 255, ${0.18 * twinkle})`;
        context.arc(node.x, node.y, node.r * 4.2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.fillStyle = `rgba(244, 251, 255, ${0.55 + twinkle * 0.45})`;
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fill();
      }

      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const glyph of glyphs) {
        glyph.x += glyph.vx;
        glyph.y += glyph.vy;
        glyph.life += 0.004;
        const alpha = Math.sin(glyph.life * Math.PI) * 0.85;
        context.font = `600 ${glyph.size}px "Segoe UI", Georgia, serif`;
        context.fillStyle = `rgba(226, 242, 255, ${Math.max(0, alpha)})`;
        context.fillText(glyph.ch, glyph.x, glyph.y);
        if (glyph.life >= 1 || glyph.y < -30) {
          Object.assign(glyph, spawnGlyph(Math.random() < 0.65));
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const begin = () => {
    if (phase !== 'idle') {
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onDone();
      return;
    }
    setPhase('enter');
  };

  return (
    <button
      ref={rootRef}
      type="button"
      className={`book-intro ${phase}`}
      onClick={begin}
      aria-label="Enter"
    >
      <span ref={sceneRef} className="intro-scene" />
      <canvas ref={canvasRef} className="intro-particles" aria-hidden="true" />
      {phase === 'idle' && <span className="book-intro-hint">Click to enter</span>}
    </button>
  );
};
