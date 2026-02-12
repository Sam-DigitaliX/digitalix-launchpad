import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── Card data ─── */

interface ExpertiseCard {
  title: string;
  subtitle: string;
  iconPath: string;
  viewBox: string;
}

const CARDS: ExpertiseCard[] = [
  {
    title: 'GTM Server-Side',
    subtitle: 'Infrastructure sGTM sur Google Cloud',
    viewBox: '0 0 24 24',
    iconPath: 'M5 12h14M12 5l7 7-7 7',
  },
  {
    title: 'Meta CAPI',
    subtitle: 'Conversion API Facebook & Instagram',
    viewBox: '0 0 24 24',
    iconPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2',
  },
  {
    title: 'Enhanced Conversions',
    subtitle: 'Google Ads Server-Side',
    viewBox: '0 0 24 24',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
  {
    title: 'Consent Mode v2',
    subtitle: 'Conformité RGPD native',
    viewBox: '0 0 24 24',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    title: 'Audit Data Layer',
    subtitle: 'Diagnostic & optimisation tracking',
    viewBox: '0 0 24 24',
    iconPath: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  },
  {
    title: 'Analytics GA4',
    subtitle: 'Configuration & dashboards',
    viewBox: '0 0 24 24',
    iconPath: 'M18 20V10M12 20V4M6 20v-6',
  },
];

/* ─── Dimensions ─── */

const CARD_W = 400;
const CARD_H = 250;
const CARD_GAP = 60;
const CARD_TOTAL = CARD_W + CARD_GAP;
const SPEED = 70;

/* ─── Code generator ─── */

function generateCodeBlock(cols: number, rows: number): string {
  const snippets = [
    'const sGTM = new ServerContainer();',
    'function sendCAPI(event) {',
    '  return fetch(endpoint, { method: "POST" });',
    '}',
    'if (consent.granted) { track(event); }',
    'dataLayer.push({ event: "purchase" });',
    'const hash = sha256(email.trim().toLowerCase());',
    'gtag("config", "AW-CONVERSION_ID");',
    'fbq("track", "Purchase", { value: 42.00 });',
    'export const CONSENT_MODE = "v2";',
    'const pixel = await initPixel(config);',
    'server.tag("GA4", { measurement_id });',
  ];
  let flow = snippets.join(' ');
  const total = cols * rows;
  while (flow.length < total + cols) {
    flow += ' ' + snippets[Math.floor(Math.random() * snippets.length)];
  }
  let out = '';
  for (let r = 0; r < rows; r++) {
    out += flow.slice(r * cols, (r + 1) * cols) + (r < rows - 1 ? '\n' : '');
  }
  return out;
}

/* ─── Card variant themes ─── */

interface CardTheme {
  base: string;
  brushedOpacity: string;
  shine: string;
  shineOpacity: number;
  extraLayer: string | null;
  extraLayerOpacity: number;
  edgeShadow: string;
  outerShadow: string;
  iconGrad: [string, string, string];
  titleColor: string;
  titleShadow: string;
  subtitleColor: string;
  subtitleShadow: string;
  brandColor: string;
  brandShadow: string;
  lineGrad: string;
  asciiColor: string;
}

const THEMES: Record<string, CardTheme> = {
  /* Matte — deep dark stealth, minimal reflection */
  matte: {
    base: `linear-gradient(145deg,
      #1a1a2e 0%, #16213e 20%, #1a1a2e 40%, #0f0f23 60%, #1a1a2e 80%, #16213e 100%)`,
    brushedOpacity: '0.02',
    shine: `linear-gradient(115deg,
      transparent 0%, transparent 40%,
      rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%,
      rgba(255,255,255,0.03) 55%, transparent 60%, transparent 100%)`,
    shineOpacity: 0.5,
    extraLayer: null,
    extraLayerOpacity: 0,
    edgeShadow: `
      inset 0 1px 0 rgba(255,255,255,0.08),
      inset 0 -1px 0 rgba(0,0,0,0.5),
      inset 1px 0 0 rgba(255,255,255,0.04),
      inset -1px 0 0 rgba(255,255,255,0.04)`,
    outerShadow: '0 20px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
    iconGrad: ['rgba(120,120,150,0.6)', 'rgba(180,180,210,0.8)', 'rgba(120,120,150,0.5)'],
    titleColor: 'rgba(255,255,255,0.95)',
    titleShadow: '0 -1px 0 rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.08)',
    subtitleColor: 'rgba(180,180,210,0.6)',
    subtitleShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
    brandColor: 'rgba(140,140,170,0.4)',
    brandShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
    lineGrad: 'linear-gradient(90deg, rgba(140,140,170,0.3), rgba(100,100,130,0.15), transparent)',
    asciiColor: 'rgba(140, 140, 170, 0.5)',
  },

  /* Platinum — rich violet-metal, warm luxury highlights */
  platinum: {
    base: `linear-gradient(135deg,
      #2a2035 0%, #3d3352 15%, #4a3f60 25%, #2e2440 40%,
      #1f1830 55%, #3d3352 70%, #4a3f60 85%, #2a2035 100%)`,
    brushedOpacity: '0.03',
    shine: `linear-gradient(115deg,
      transparent 0%, transparent 28%,
      rgba(196,181,253,0.1) 35%, rgba(255,255,255,0.18) 42%,
      rgba(196,181,253,0.28) 48%, rgba(255,255,255,0.22) 52%,
      rgba(139,92,246,0.15) 58%, transparent 68%, transparent 100%)`,
    shineOpacity: 0.6,
    extraLayer: null,
    extraLayerOpacity: 0,
    edgeShadow: `
      inset 0 1px 0 rgba(255,255,255,0.14),
      inset 0 -1px 0 rgba(0,0,0,0.4),
      inset 1px 0 0 rgba(255,255,255,0.08),
      inset -1px 0 0 rgba(255,255,255,0.08)`,
    outerShadow: '0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3), 0 0 40px rgba(139,92,246,0.06)',
    iconGrad: ['rgba(196,181,253,0.6)', 'rgba(139,92,246,0.85)', 'rgba(196,181,253,0.5)'],
    titleColor: 'rgba(255,255,255,0.93)',
    titleShadow: '0 -1px 0 rgba(0,0,0,0.7), 0 1px 0 rgba(196,181,253,0.15)',
    subtitleColor: 'rgba(196,181,253,0.6)',
    subtitleShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)',
    brandColor: 'rgba(196,181,253,0.45)',
    brandShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)',
    lineGrad: 'linear-gradient(90deg, rgba(139,92,246,0.45), rgba(196,181,253,0.2), transparent)',
    asciiColor: 'rgba(196, 181, 253, 0.6)',
  },

  /* Silver — cool brushed steel, crisp modern */
  silver: {
    base: `linear-gradient(140deg,
      #2a2d3e 0%, #3a3f58 15%, #454b68 30%, #3a3f58 45%,
      #2e3248 60%, #3a3f58 75%, #454b68 90%, #2a2d3e 100%)`,
    brushedOpacity: '0.06',
    shine: `linear-gradient(115deg,
      transparent 0%, transparent 22%,
      rgba(200,210,235,0.08) 30%, rgba(255,255,255,0.2) 38%,
      rgba(200,210,235,0.14) 44%, rgba(255,255,255,0.12) 50%,
      rgba(200,210,235,0.08) 56%, transparent 64%, transparent 100%)`,
    shineOpacity: 0.55,
    extraLayer: null,
    extraLayerOpacity: 0,
    edgeShadow: `
      inset 0 1px 0 rgba(255,255,255,0.2),
      inset 0 -1px 0 rgba(0,0,0,0.35),
      inset 1px 0 0 rgba(255,255,255,0.1),
      inset -1px 0 0 rgba(255,255,255,0.1)`,
    outerShadow: '0 20px 60px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.25), 0 0 30px rgba(148,163,184,0.05)',
    iconGrad: ['rgba(180,195,225,0.6)', 'rgba(220,230,250,0.85)', 'rgba(180,195,225,0.5)'],
    titleColor: 'rgba(255,255,255,0.95)',
    titleShadow: '0 -1px 0 rgba(0,0,0,0.6), 0 1px 0 rgba(200,210,235,0.14)',
    subtitleColor: 'rgba(180,195,225,0.6)',
    subtitleShadow: '0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07)',
    brandColor: 'rgba(180,195,225,0.45)',
    brandShadow: '0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.07)',
    lineGrad: 'linear-gradient(90deg, rgba(180,195,225,0.4), rgba(148,163,184,0.2), transparent)',
    asciiColor: 'rgba(180, 195, 225, 0.5)',
  },

  /* Iridescent — holographic rainbow, DigitaliX gradient shimmer */
  iridescent: {
    base: `linear-gradient(135deg,
      #1a1030 0%, #251845 15%, #1e1540 30%, #15102a 50%,
      #1a1030 65%, #251845 80%, #1e1540 100%)`,
    brushedOpacity: '0.02',
    shine: `linear-gradient(115deg,
      transparent 0%, transparent 18%,
      rgba(14,165,233,0.12) 26%, rgba(139,92,246,0.16) 32%,
      rgba(196,181,253,0.22) 38%, rgba(255,255,255,0.16) 44%,
      rgba(14,165,233,0.2) 50%, rgba(6,182,212,0.16) 56%,
      rgba(139,92,246,0.14) 62%, rgba(255,255,255,0.1) 68%,
      transparent 78%, transparent 100%)`,
    shineOpacity: 0.7,
    extraLayer: `linear-gradient(160deg,
      transparent 12%,
      rgba(139,92,246,0.5) 22%, rgba(14,165,233,0.45) 32%,
      rgba(6,182,212,0.5) 42%, rgba(236,72,153,0.3) 52%,
      rgba(139,92,246,0.4) 62%, rgba(14,165,233,0.25) 72%,
      transparent 82%)`,
    extraLayerOpacity: 0.14,
    edgeShadow: `
      inset 0 1px 0 rgba(255,255,255,0.16),
      inset 0 -1px 0 rgba(0,0,0,0.35),
      inset 1px 0 0 rgba(139,92,246,0.14),
      inset -1px 0 0 rgba(14,165,233,0.14)`,
    outerShadow: '0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3), 0 0 50px rgba(139,92,246,0.08), 0 0 30px rgba(14,165,233,0.05)',
    iconGrad: ['rgba(14,165,233,0.6)', 'rgba(139,92,246,0.8)', 'rgba(6,182,212,0.6)'],
    titleColor: 'rgba(255,255,255,0.95)',
    titleShadow: '0 -1px 0 rgba(0,0,0,0.7), 0 1px 0 rgba(139,92,246,0.18)',
    subtitleColor: 'rgba(196,181,253,0.65)',
    subtitleShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.07)',
    brandColor: 'rgba(14,165,233,0.5)',
    brandShadow: '0 -1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.07)',
    lineGrad: 'linear-gradient(90deg, rgba(14,165,233,0.45), rgba(139,92,246,0.3), rgba(6,182,212,0.15), transparent)',
    asciiColor: 'rgba(14, 165, 233, 0.55)',
  },
};

type CardVariant = keyof typeof THEMES;
const VARIANT_CYCLE: CardVariant[] = ['matte', 'platinum', 'silver', 'iridescent'];

/* ─── Main section ─── */

function CardBeamSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragPosRef = useRef(0);
  const beamIntensityRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  const allCards = [...CARDS, ...CARDS, ...CARDS];

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* ── Reactive scanner beam canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; life: number; decay: number;
    }> = [];

    const poolSize = isMobile ? 100 : 300;
    let w = 0;
    let h = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width;
      h = rect.height;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnParticle(): typeof particles[0] {
      const cx = w / 2;
      const intensity = beamIntensityRef.current;
      const goRight = Math.random() < (0.5 + intensity * 0.3);
      const baseSpeed = Math.random() * 1.0 + 0.3;
      const activeBoost = intensity * 1.8;
      return {
        x: cx + (Math.random() - 0.5) * (6 + intensity * 6),
        y: Math.random() * h,
        vx: goRight
          ? (baseSpeed + activeBoost) * (0.8 + intensity * 0.5)
          : -(baseSpeed + activeBoost * 0.3),
        vy: (Math.random() - 0.5) * (0.4 + intensity * 0.6),
        r: Math.random() * (2 + intensity * 2) + 0.5,
        alpha: Math.random() * (0.5 + intensity * 0.4) + (0.2 + intensity * 0.1),
        life: 1,
        decay: Math.random() * 0.012 + 0.004,
      };
    }

    for (let i = 0; i < poolSize; i++) {
      const p = spawnParticle();
      p.x += (Math.random() - 0.5) * 300;
      p.life = Math.random();
      particles.push(p);
    }

    let animId = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const fadeZone = 50;
      const t = beamIntensityRef.current;

      /* ── Beam core ── */
      ctx.globalCompositeOperation = 'source-over';
      const coreW = 2 + t * 3;
      const coreAlpha = 0.5 + t * 0.5;
      const beamGrad = ctx.createLinearGradient(0, 0, 0, h);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(fadeZone / h, `rgba(139, 92, 246, ${coreAlpha})`);
      beamGrad.addColorStop(0.5, `rgba(${180 + t * 75}, ${160 + t * 95}, 253, ${coreAlpha})`);
      beamGrad.addColorStop(1 - fadeZone / h, `rgba(139, 92, 246, ${coreAlpha})`);
      beamGrad.addColorStop(1, 'transparent');
      ctx.globalAlpha = 1;
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.roundRect(cx - coreW / 2, 0, coreW, h, 10);
      ctx.fill();

      /* ── White-hot center flash when active ── */
      if (t > 0.3) {
        const flashAlpha = (t - 0.3) * 1.0;
        const flashGrad = ctx.createLinearGradient(0, 0, 0, h);
        flashGrad.addColorStop(0, 'transparent');
        flashGrad.addColorStop(fadeZone / h, `rgba(255, 255, 255, ${flashAlpha * 0.4})`);
        flashGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flashAlpha * 0.6})`);
        flashGrad.addColorStop(1 - fadeZone / h, `rgba(255, 255, 255, ${flashAlpha * 0.4})`);
        flashGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flashGrad;
        ctx.fillRect(cx - 1, 0, 2, h);
      }

      /* ── Glow — asymmetric when active ── */
      ctx.globalCompositeOperation = 'lighter';

      // Left glow (intense/concentrated when disintegrating)
      const leftW = 20 + t * 35;
      const leftGlow = ctx.createLinearGradient(cx - leftW, 0, cx, 0);
      leftGlow.addColorStop(0, 'transparent');
      leftGlow.addColorStop(0.4, `rgba(196, 181, 253, ${(0.05 + t * 0.25)})`);
      leftGlow.addColorStop(1, `rgba(196, 181, 253, ${(0.3 + t * 0.45)})`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = leftGlow;
      const leftGlowGrad = ctx.createLinearGradient(0, 0, 0, h);
      leftGlowGrad.addColorStop(0, 'transparent');
      leftGlowGrad.addColorStop(fadeZone / h, `rgba(196, 181, 253, ${(0.3 + t * 0.45)})`);
      leftGlowGrad.addColorStop(1 - fadeZone / h, `rgba(196, 181, 253, ${(0.3 + t * 0.45)})`);
      leftGlowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = leftGlow;
      ctx.fillRect(cx - leftW, 0, leftW, h);

      // Right glow (wide trailing when disintegrating)
      const rightW = 20 + t * 80;
      const rightGlow = ctx.createLinearGradient(cx, 0, cx + rightW, 0);
      rightGlow.addColorStop(0, `rgba(139, 92, 246, ${(0.25 + t * 0.35)})`);
      rightGlow.addColorStop(0.2, `rgba(139, 92, 246, ${(0.12 + t * 0.2)})`);
      rightGlow.addColorStop(0.5, `rgba(139, 92, 246, ${(0.04 + t * 0.1)})`);
      rightGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(cx, 0, rightW, h);

      // Center tight glow (always present but brighter when active)
      const g1 = ctx.createLinearGradient(cx - 12, 0, cx + 12, 0);
      g1.addColorStop(0, 'transparent');
      g1.addColorStop(0.5, `rgba(196, 181, 253, ${0.35 + t * 0.35})`);
      g1.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.8 + t * 0.2;
      ctx.fillStyle = g1;
      ctx.fillRect(cx - 12, 0, 24, h);

      // Outer ambient glow
      const g3 = ctx.createLinearGradient(cx - 100, 0, cx + 100, 0);
      g3.addColorStop(0, 'transparent');
      g3.addColorStop(0.5, `rgba(139, 92, 246, ${0.04 + t * 0.06})`);
      g3.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = g3;
      ctx.fillRect(cx - 100, 0, 200, h);

      /* ── Particles ── */
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0 || p.x < 0 || p.x > w) {
          particles[i] = spawnParticle();
          continue;
        }

        let fadeAlpha = 1;
        if (p.y < fadeZone) fadeAlpha = p.y / fadeZone;
        else if (p.y > h - fadeZone) fadeAlpha = (h - p.y) / fadeZone;
        fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

        ctx.globalAlpha = p.alpha * p.life * fadeAlpha;
        // Brighter particles when active
        const bright = Math.floor(180 + t * 75);
        ctx.fillStyle = `rgb(${bright}, ${Math.floor(150 + t * 50)}, 253)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── Vertical fade mask ── */
      ctx.globalCompositeOperation = 'destination-in';
      ctx.globalAlpha = 1;
      const mask = ctx.createLinearGradient(0, 0, 0, h);
      mask.addColorStop(0, 'transparent');
      mask.addColorStop(fadeZone / h, 'rgba(0,0,0,1)');
      mask.addColorStop(1 - fadeZone / h, 'rgba(0,0,0,1)');
      mask.addColorStop(1, 'transparent');
      ctx.fillStyle = mask;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  /* ── Card scroll loop with beam detection ── */
  useEffect(() => {
    lastTimeRef.current = performance.now();
    const scannerW = 8;

    function tick(now: number) {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isDraggingRef.current) {
        posRef.current += SPEED * dt;
        const singleSetWidth = CARDS.length * CARD_TOTAL;
        if (posRef.current > 0) posRef.current -= singleSetWidth;
        if (posRef.current < -singleSetWidth) posRef.current += singleSetWidth;
      }

      const scannerX = window.innerWidth / 2;
      const sL = scannerX - scannerW / 2;
      const sR = scannerX + scannerW / 2;
      let cardInBeam = false;

      if (containerRef.current) {
        const cards = containerRef.current.children;
        for (let i = 0; i < cards.length; i++) {
          const el = cards[i] as HTMLElement;
          const x = posRef.current + i * CARD_TOTAL;
          el.style.transform = `translateX(${x}px)`;
          if (x < sR && x + CARD_W > sL) {
            cardInBeam = true;
          }
        }
      }

      // Smooth intensity with different attack/release
      const target = cardInBeam ? 1 : 0;
      const speed = target > beamIntensityRef.current ? 0.12 : 0.06;
      beamIntensityRef.current += (target - beamIntensityRef.current) * speed;

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Drag ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragPosRef.current = posRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    posRef.current = dragPosRef.current + (e.clientX - dragStartXRef.current);
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const trackHeight = CARD_H + 80;

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
          Notre <span className="text-gradient-primary">expertise</span> à votre service
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Chaque domaine que nous maîtrisons pour récupérer vos données perdues et maximiser votre ROI.
        </p>
      </div>

      <div
        className="relative w-full select-none touch-pan-y"
        style={{ height: trackHeight }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full pointer-events-none z-10"
          style={{ height: trackHeight }}
        />

        <div
          ref={containerRef}
          className="absolute left-0 w-full"
          style={{ height: CARD_H, top: (trackHeight - CARD_H) / 2, cursor: 'grab' }}
        >
          {allCards.map((card, i) => (
            <MetalCard
              key={i}
              card={card}
              variant={VARIANT_CYCLE[i % VARIANT_CYCLE.length]}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Metal card with engraved typography ─── */

function MetalCard({ card, variant, isMobile }: { card: ExpertiseCard; variant: CardVariant; isMobile: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const normalRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const theme = THEMES[variant];
  const gradId = `engrave-${variant}-${Math.random().toString(36).slice(2, 6)}`;

  useEffect(() => {
    if (!codeRef.current) return;
    const cols = Math.floor(CARD_W / 6.5);
    const rows = Math.floor(CARD_H / 13);
    codeRef.current.textContent = generateCodeBlock(cols, rows);
  }, []);

  // Clip-path scanner
  useEffect(() => {
    let animId = 0;

    function update() {
      const wrapper = wrapperRef.current;
      const normal = normalRef.current;
      const ascii = asciiRef.current;
      if (!wrapper || !normal || !ascii) {
        animId = requestAnimationFrame(update);
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const scannerX = window.innerWidth / 2;
      const scannerW = 8;
      const sL = scannerX - scannerW / 2;
      const sR = scannerX + scannerW / 2;

      if (rect.left < sR && rect.right > sL) {
        const normalClipRight = Math.max(0, Math.min(100, ((rect.right - sL) / rect.width) * 100));
        const asciiClipLeft = Math.max(0, Math.min(100, ((sR - rect.left) / rect.width) * 100));
        normal.style.clipPath = `inset(0 ${normalClipRight}% 0 0)`;
        ascii.style.clipPath = `inset(0 0 0 ${asciiClipLeft}%)`;
      } else if (rect.right < sL) {
        normal.style.clipPath = 'inset(0 0 0 0)';
        ascii.style.clipPath = 'inset(0 0 0 100%)';
      } else {
        normal.style.clipPath = 'inset(0 100% 0 0)';
        ascii.style.clipPath = 'inset(0 0 0 0)';
      }

      animId = requestAnimationFrame(update);
    }

    update();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Glitch ASCII
  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => {
      if (!codeRef.current || Math.random() > 0.2) return;
      const cols = Math.floor(CARD_W / 6.5);
      const rows = Math.floor(CARD_H / 13);
      codeRef.current.textContent = generateCodeBlock(cols, rows);
    }, 300);
    return () => clearInterval(interval);
  }, [isMobile]);

  return (
    <div
      ref={wrapperRef}
      className="absolute top-0 left-0 will-change-transform"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* ASCII layer */}
      <div
        ref={asciiRef}
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ clipPath: 'inset(0 0 0 100%)' }}
      >
        <pre
          ref={codeRef}
          className="absolute inset-0 m-0 p-0 overflow-hidden whitespace-pre text-[11px] leading-[13px]"
          style={{
            color: theme.asciiColor,
            fontFamily: '"Courier New", monospace',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />
      </div>

      {/* Metal card face */}
      <div
        ref={normalRef}
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ clipPath: 'inset(0 0 0 0)' }}
      >
        {/* Metallic base */}
        <div className="absolute inset-0" style={{ background: theme.base }} />

        {/* Brushed metal texture */}
        <div
          className="absolute inset-0"
          style={{
            opacity: theme.brushedOpacity,
            backgroundImage: `repeating-linear-gradient(90deg,
              transparent, transparent 1px,
              rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)`,
            backgroundSize: '3px 100%',
          }}
        />

        {/* Main shine sweep */}
        <div
          className="absolute inset-0"
          style={{ opacity: theme.shineOpacity, background: theme.shine }}
        />

        {/* Extra layer (iridescent rainbow) */}
        {theme.extraLayer && (
          <div
            className="absolute inset-0"
            style={{
              opacity: theme.extraLayerOpacity,
              background: theme.extraLayer,
            }}
          />
        )}

        {/* Edge highlight bevel */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ boxShadow: theme.edgeShadow }}
        />

        {/* Card drop shadow */}
        <div
          className="absolute -inset-1 rounded-2xl -z-10"
          style={{ boxShadow: theme.outerShadow }}
        />

        {/* Content with engraved typography */}
        <div className="relative h-full flex flex-col justify-between p-7">
          {/* Top row */}
          <div className="flex items-start justify-between">
            {/* Engraved SVG icon */}
            <svg
              viewBox={card.viewBox}
              className="w-10 h-10"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12)) drop-shadow(0 -1px 0 rgba(0,0,0,0.5))',
              }}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={theme.iconGrad[0]} />
                  <stop offset="50%" stopColor={theme.iconGrad[1]} />
                  <stop offset="100%" stopColor={theme.iconGrad[2]} />
                </linearGradient>
              </defs>
              <path d={card.iconPath} />
            </svg>

            {/* Brand — engraved */}
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{
                color: theme.brandColor,
                textShadow: theme.brandShadow,
              }}
            >
              DigitaliX
            </span>
          </div>

          {/* Bottom */}
          <div>
            <div className="w-16 h-px mb-4" style={{ background: theme.lineGrad }} />
            {/* Title — deep engraved */}
            <h3
              className="text-xl font-bold mb-1.5 tracking-wide"
              style={{
                color: theme.titleColor,
                textShadow: theme.titleShadow,
              }}
            >
              {card.title}
            </h3>
            {/* Subtitle — subtle engraved */}
            <p
              className="text-sm tracking-wide"
              style={{
                color: theme.subtitleColor,
                textShadow: theme.subtitleShadow,
              }}
            >
              {card.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardBeamSection;
