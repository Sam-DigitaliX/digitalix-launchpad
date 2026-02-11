import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── Card data ─── */

interface ExpertiseCard {
  title: string;
  subtitle: string;
  iconPath: string; // SVG path(s)
  viewBox: string;
}

const CARDS: ExpertiseCard[] = [
  {
    title: 'GTM Server-Side',
    subtitle: 'Infrastructure sGTM sur Google Cloud',
    viewBox: '0 0 24 24',
    iconPath: 'M5 12h14M12 5l7 7-7 7', // arrow-right-style bolt
  },
  {
    title: 'Meta CAPI',
    subtitle: 'Conversion API Facebook & Instagram',
    viewBox: '0 0 24 24',
    iconPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2', // signal/clock
  },
  {
    title: 'Enhanced Conversions',
    subtitle: 'Google Ads Server-Side',
    viewBox: '0 0 24 24',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', // layers/stack
  },
  {
    title: 'Consent Mode v2',
    subtitle: 'Conformité RGPD native',
    viewBox: '0 0 24 24',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', // shield
  },
  {
    title: 'Audit Data Layer',
    subtitle: 'Diagnostic & optimisation tracking',
    viewBox: '0 0 24 24',
    iconPath: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', // book-open
  },
  {
    title: 'Analytics GA4',
    subtitle: 'Configuration & dashboards',
    viewBox: '0 0 24 24',
    iconPath: 'M18 20V10M12 20V4M6 20v-6', // bar-chart
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
  const [isMobile, setIsMobile] = useState(false);

  const allCards = [...CARDS, ...CARDS, ...CARDS];

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* Scanner beam canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; life: number; decay: number;
    }> = [];

    const maxParticles = isMobile ? 80 : 200;
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

    function spawnParticle() {
      const cx = w / 2;
      return {
        x: cx + (Math.random() - 0.5) * 6,
        y: Math.random() * h,
        vx: (Math.random() * 1.0 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        life: 1,
        decay: Math.random() * 0.012 + 0.004,
      };
    }

    for (let i = 0; i < maxParticles; i++) {
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

      // Beam core
      ctx.globalCompositeOperation = 'source-over';
      const beamGrad = ctx.createLinearGradient(0, 0, 0, h);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(fadeZone / h, 'rgba(139, 92, 246, 1)');
      beamGrad.addColorStop(1 - fadeZone / h, 'rgba(139, 92, 246, 1)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.globalAlpha = 1;
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 2, 0, 4, h, 10);
      ctx.fill();

      // Glow layers
      ctx.globalCompositeOperation = 'lighter';

      const glow1 = ctx.createLinearGradient(cx - 16, 0, cx + 16, 0);
      glow1.addColorStop(0, 'transparent');
      glow1.addColorStop(0.5, 'rgba(196, 181, 253, 0.5)');
      glow1.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = glow1;
      ctx.fillRect(cx - 16, 0, 32, h);

      const glow2 = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
      glow2.addColorStop(0, 'transparent');
      glow2.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
      glow2.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = glow2;
      ctx.fillRect(cx - 40, 0, 80, h);

      const glow3 = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0);
      glow3.addColorStop(0, 'transparent');
      glow3.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)');
      glow3.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = glow3;
      ctx.fillRect(cx - 80, 0, 160, h);

      // Particles
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
        ctx.fillStyle = '#c4b5fd';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vertical fade mask
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

  /* Card scroll loop */
  useEffect(() => {
    lastTimeRef.current = performance.now();

    function tick(now: number) {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isDraggingRef.current) {
        posRef.current += SPEED * dt;
        const singleSetWidth = CARDS.length * CARD_TOTAL;
        if (posRef.current > 0) posRef.current -= singleSetWidth;
        if (posRef.current < -singleSetWidth) posRef.current += singleSetWidth;
      }

      if (containerRef.current) {
        const cards = containerRef.current.children;
        for (let i = 0; i < cards.length; i++) {
          const el = cards[i] as HTMLElement;
          el.style.transform = `translateX(${posRef.current + i * CARD_TOTAL}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Drag */
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
      {/* Ambient background glow */}
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
        {/* Scanner canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full pointer-events-none z-10"
          style={{ height: trackHeight }}
        />

        {/* Card track */}
        <div
          ref={containerRef}
          className="absolute left-0 w-full"
          style={{ height: CARD_H, top: (trackHeight - CARD_H) / 2, cursor: 'grab' }}
        >
          {allCards.map((card, i) => (
            <MetalCard key={i} card={card} variant={i % 2 === 0 ? 'platinum' : 'silver'} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Card variant themes ─── */

const THEMES = {
  platinum: {
    base: `linear-gradient(135deg,
      #2a2035 0%, #3d3352 15%, #4a3f60 25%, #2e2440 40%,
      #1f1830 55%, #3d3352 70%, #4a3f60 85%, #2a2035 100%)`,
    shine: `linear-gradient(115deg,
      transparent 0%, transparent 30%,
      rgba(139,92,246,0.15) 40%, rgba(196,181,253,0.25) 45%,
      rgba(255,255,255,0.12) 50%, rgba(196,181,253,0.15) 55%,
      rgba(139,92,246,0.08) 60%, transparent 70%, transparent 100%)`,
    accentGlow: 'rgba(139, 92, 246, 0.08)',
    iconGrad: ['rgba(196,181,253,0.5)', 'rgba(139,92,246,0.7)', 'rgba(196,181,253,0.4)'],
    textColor: 'rgba(255,255,255,0.85)',
    subtextColor: 'rgba(196,181,253,0.45)',
    brandColor: 'rgba(196,181,253,0.35)',
    lineGrad: 'linear-gradient(90deg, rgba(139,92,246,0.4), rgba(196,181,253,0.2), transparent)',
    asciiColor: 'rgba(196, 181, 253, 0.6)',
  },
  silver: {
    base: `linear-gradient(135deg,
      #1a1d2e 0%, #2a2f45 12%, #353b55 24%, #2e3348 36%,
      #252a3e 48%, #303650 60%, #3a4060 72%, #2a2f45 84%, #1a1d2e 100%)`,
    shine: `linear-gradient(115deg,
      transparent 0%, transparent 25%,
      rgba(14,165,233,0.1) 32%, rgba(139,92,246,0.12) 38%,
      rgba(196,181,253,0.18) 42%, rgba(255,255,255,0.14) 46%,
      rgba(14,165,233,0.16) 50%, rgba(139,92,246,0.12) 54%,
      rgba(6,182,212,0.1) 58%, rgba(255,255,255,0.08) 62%,
      transparent 72%, transparent 100%)`,
    accentGlow: 'rgba(14, 165, 233, 0.08)',
    iconGrad: ['rgba(14,165,233,0.5)', 'rgba(139,92,246,0.6)', 'rgba(6,182,212,0.5)'],
    textColor: 'rgba(255,255,255,0.9)',
    subtextColor: 'rgba(148,163,184,0.55)',
    brandColor: 'rgba(148,163,184,0.35)',
    lineGrad: 'linear-gradient(90deg, rgba(14,165,233,0.4), rgba(139,92,246,0.25), transparent)',
    asciiColor: 'rgba(14, 165, 233, 0.5)',
  },
} as const;

type CardVariant = keyof typeof THEMES;

/* ─── Metal card ─── */

function MetalCard({ card, variant, isMobile }: { card: ExpertiseCard; variant: CardVariant; isMobile: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const normalRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const theme = THEMES[variant];
  const gradId = `engrave-${variant}`;

  // Generate code text
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
        // Card visible on left, code revealed on right
        const scanPct = Math.max(0, ((sR - rect.left) / rect.width) * 100);
        normal.style.clipPath = `inset(0 ${scanPct}% 0 0)`;
        ascii.style.clipPath = `inset(0 0 0 ${Math.max(0, ((sL - rect.left) / rect.width) * 100)}%)`;
      } else if (rect.right < sL) {
        // Card is fully LEFT of scanner — not yet scanned — fully visible
        normal.style.clipPath = 'inset(0 0 0 0)';
        ascii.style.clipPath = 'inset(0 0 0 100%)';
      } else {
        // Card is fully RIGHT of scanner — already scanned — fully code
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
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg,
              transparent, transparent 1px,
              rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)`,
            backgroundSize: '3px 100%',
          }}
        />

        {/* Iridescent shine */}
        <div className="absolute inset-0 opacity-40" style={{ background: theme.shine }} />

        {/* Silver variant: extra rainbow shimmer */}
        {variant === 'silver' && (
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background: `linear-gradient(160deg,
                transparent 20%,
                rgba(139,92,246,0.6) 30%, rgba(14,165,233,0.5) 40%,
                rgba(6,182,212,0.5) 50%, rgba(139,92,246,0.4) 60%,
                transparent 70%)`,
            }}
          />
        )}

        {/* Edge highlight */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,${variant === 'silver' ? '0.15' : '0.12'}),
              inset 0 -1px 0 rgba(0,0,0,0.3),
              inset 1px 0 0 rgba(255,255,255,0.06),
              inset -1px 0 0 rgba(255,255,255,0.06)`,
          }}
        />

        {/* Card shadow */}
        <div
          className="absolute -inset-1 rounded-2xl -z-10"
          style={{
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.5),
              0 8px 20px rgba(0,0,0,0.3),
              0 0 40px ${theme.accentGlow}`,
          }}
        />

        {/* Content */}
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
                filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.1)) drop-shadow(0 -1px 0 rgba(0,0,0,0.4))',
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

            {/* Brand */}
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{
                color: theme.brandColor,
                textShadow: '0 1px 0 rgba(255,255,255,0.05), 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            >
              DigitaliX
            </span>
          </div>

          {/* Bottom */}
          <div>
            <div className="w-16 h-px mb-4" style={{ background: theme.lineGrad }} />
            <h3
              className="text-xl font-bold mb-1.5 tracking-wide"
              style={{
                color: theme.textColor,
                textShadow: '0 1px 2px rgba(0,0,0,0.5), 0 0 20px ' + theme.accentGlow,
              }}
            >
              {card.title}
            </h3>
            <p
              className="text-sm tracking-wide"
              style={{
                color: theme.subtextColor,
                textShadow: '0 1px 0 rgba(0,0,0,0.3)',
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
