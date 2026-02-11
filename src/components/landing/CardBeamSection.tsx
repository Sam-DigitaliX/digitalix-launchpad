import { useEffect, useRef, useCallback, useState } from 'react';

interface ExpertiseCard {
  title: string;
  subtitle: string;
  icon: string;
  gradient: [string, string];
}

const CARDS: ExpertiseCard[] = [
  {
    title: 'GTM Server-Side',
    subtitle: 'Infrastructure sGTM sur Google Cloud',
    icon: '⚡',
    gradient: ['#7c3aed', '#4f46e5'],
  },
  {
    title: 'Meta CAPI',
    subtitle: 'Conversion API Facebook & Instagram',
    icon: '📡',
    gradient: ['#6366f1', '#0ea5e9'],
  },
  {
    title: 'Enhanced Conversions',
    subtitle: 'Google Ads Server-Side',
    icon: '🎯',
    gradient: ['#0ea5e9', '#06b6d4'],
  },
  {
    title: 'Consent Mode v2',
    subtitle: 'Conformité RGPD native',
    icon: '🛡️',
    gradient: ['#7c3aed', '#a855f7'],
  },
  {
    title: 'Audit Data Layer',
    subtitle: 'Diagnostic & optimisation tracking',
    icon: '🔍',
    gradient: ['#6366f1', '#7c3aed'],
  },
  {
    title: 'Analytics GA4',
    subtitle: 'Configuration & dashboards',
    icon: '📊',
    gradient: ['#0ea5e9', '#6366f1'],
  },
];

const CARD_W = 320;
const CARD_H = 180;
const CARD_GAP = 48;
const CARD_TOTAL = CARD_W + CARD_GAP;
const SPEED = 80; // px/s

const CODE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789(){}[]<>;:._-+=!@#$%^&*';

function generateCodeBlock(cols: number, rows: number): string {
  const snippets = [
    'const sGTM = new ServerContainer();',
    'function sendCAPI(event) {',
    '  return fetch(endpoint, { method: "POST" });',
    '}',
    'if (consent.granted) { track(event); }',
    'dataLayer.push({ event: "purchase" });',
    'const hash = sha256(email.trim());',
    'gtag("config", "AW-XXXXX");',
    'fbq("track", "Purchase", { value: 42 });',
    'export const CONSENT_MODE = "v2";',
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

  // Duplicate cards for seamless loop
  const allCards = [...CARDS, ...CARDS, ...CARDS];
  const totalWidth = allCards.length * CARD_TOTAL;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Scanner beam canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; life: number; decay: number;
    }> = [];

    const maxParticles = isMobile ? 60 : 150;

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
        x: cx + (Math.random() - 0.5) * 4,
        y: Math.random() * h,
        vx: (Math.random() * 0.8 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.4,
        life: 1,
        decay: Math.random() * 0.015 + 0.005,
      };
    }

    // Pre-populate
    for (let i = 0; i < maxParticles; i++) {
      const p = spawnParticle();
      p.x += (Math.random() - 0.5) * 200;
      p.life = Math.random();
      particles.push(p);
    }

    let animId = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const fadeZone = 40;

      // Draw beam line
      ctx.globalCompositeOperation = 'source-over';
      const beamGrad = ctx.createLinearGradient(0, 0, 0, h);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(fadeZone / h, 'rgba(139, 92, 246, 0.9)');
      beamGrad.addColorStop(1 - fadeZone / h, 'rgba(139, 92, 246, 0.9)');
      beamGrad.addColorStop(1, 'transparent');

      // Core line
      ctx.globalAlpha = 1;
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 1.5, 0, 3, h, 10);
      ctx.fill();

      // Glow 1
      const glow1 = ctx.createLinearGradient(cx - 12, 0, cx + 12, 0);
      glow1.addColorStop(0, 'transparent');
      glow1.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)');
      glow1.addColorStop(1, 'transparent');
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = glow1;
      ctx.fillRect(cx - 12, 0, 24, h);

      // Glow 2
      const glow2 = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
      glow2.addColorStop(0, 'transparent');
      glow2.addColorStop(0.5, 'rgba(139, 92, 246, 0.15)');
      glow2.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = glow2;
      ctx.fillRect(cx - 30, 0, 60, h);

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

  // Card animation loop
  useEffect(() => {
    lastTimeRef.current = performance.now();

    function tick(now: number) {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!isDraggingRef.current) {
        posRef.current -= SPEED * dt;

        // Seamless loop: wrap when first set is fully off-screen
        const singleSetWidth = CARDS.length * CARD_TOTAL;
        if (posRef.current < -singleSetWidth) {
          posRef.current += singleSetWidth;
        }
        if (posRef.current > 0) {
          posRef.current -= singleSetWidth;
        }
      }

      if (containerRef.current) {
        const cards = containerRef.current.children;
        for (let i = 0; i < cards.length; i++) {
          const el = cards[i] as HTMLElement;
          const x = posRef.current + i * CARD_TOTAL;
          el.style.transform = `translateX(${x}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragPosRef.current = posRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    posRef.current = dragPosRef.current + dx;
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Notre <span className="text-gradient-primary">expertise</span> à votre service
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Chaque domaine que nous maîtrisons pour récupérer vos données perdues et maximiser votre ROI.
        </p>
      </div>

      <div
        className="relative w-full select-none touch-pan-y"
        style={{ height: CARD_H + 40 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Scanner canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full pointer-events-none z-10"
          style={{ height: CARD_H + 40 }}
        />

        {/* Card track */}
        <div
          ref={containerRef}
          className="absolute top-5 left-0 w-full"
          style={{ height: CARD_H, cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        >
          {allCards.map((card, i) => (
            <CardWrapper key={i} card={card} index={i} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CardWrapper({ card, index, isMobile }: { card: ExpertiseCard; index: number; isMobile: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const normalRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  // Generate code text
  useEffect(() => {
    if (!codeRef.current) return;
    const cols = Math.floor(CARD_W / 6.5);
    const rows = Math.floor(CARD_H / 13);
    codeRef.current.textContent = generateCodeBlock(cols, rows);
  }, []);

  // Clipping based on scanner position
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
      const scannerW = 6;
      const sL = scannerX - scannerW / 2;
      const sR = scannerX + scannerW / 2;

      if (rect.left < sR && rect.right > sL) {
        const clipRight = Math.max(0, ((sL - rect.left) / rect.width) * 100);
        const clipLeft = Math.min(100, ((sR - rect.left) / rect.width) * 100);
        normal.style.clipPath = `inset(0 0 0 ${clipRight}%)`;
        ascii.style.clipPath = `inset(0 ${100 - clipLeft}% 0 0)`;
      } else if (rect.right < sL) {
        normal.style.clipPath = 'inset(0 0 0 100%)';
        ascii.style.clipPath = 'inset(0 0 0 0)';
      } else {
        normal.style.clipPath = 'inset(0 0 0 0)';
        ascii.style.clipPath = 'inset(0 100% 0 0)';
      }

      animId = requestAnimationFrame(update);
    }

    update();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Periodically glitch the ASCII
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
      {/* ASCII layer (behind) */}
      <div
        ref={asciiRef}
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{ clipPath: 'inset(0 100% 0 0)' }}
      >
        <pre
          ref={codeRef}
          className="absolute inset-0 m-0 p-0 overflow-hidden whitespace-pre text-[11px] leading-[13px]"
          style={{
            color: 'rgba(196, 181, 253, 0.6)',
            fontFamily: '"Courier New", monospace',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </div>

      {/* Normal card (front) */}
      <div
        ref={normalRef}
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
          clipPath: 'inset(0 0 0 0)',
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <span className="text-3xl">{card.icon}</span>
            <span className="text-xs font-mono text-white/50 uppercase tracking-widest">DigitaliX</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
            <p className="text-sm text-white/70">{card.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardBeamSection;
