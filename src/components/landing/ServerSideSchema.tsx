import { Globe, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const platforms = [
  { name: 'Google Ads', sub: 'Conversion API' },
  { name: 'Meta Ads', sub: 'CAPI' },
  { name: 'GA4', sub: 'Measurement Protocol' },
  { name: 'TikTok Ads', sub: 'Events API' },
];

/* ─── Animated particles flowing along a connection line ─── */

function FlowLine({ vertical = false, className }: { vertical?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden shrink-0',
        vertical ? 'w-[2px] h-10' : 'h-[2px] flex-1 min-w-[32px]',
        className,
      )}
    >
      {/* Base gradient line */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          vertical
            ? 'bg-gradient-to-b from-primary/25 via-secondary/35 to-primary/25'
            : 'bg-gradient-to-r from-primary/25 via-secondary/35 to-primary/25',
        )}
      />
      {/* Flowing particles */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'absolute rounded-full w-1.5 h-1.5 bg-primary',
            'shadow-[0_0_6px_hsl(262_83%_58%/0.8),0_0_12px_hsl(262_83%_58%/0.3)]',
            vertical
              ? 'left-1/2 -translate-x-1/2 animate-[schema-flow-v_2.5s_linear_infinite]'
              : 'top-1/2 -translate-y-1/2 animate-[schema-flow-h_2.5s_linear_infinite]',
          )}
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}
      {/* Arrow tip */}
      {!vertical && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-secondary/50" />
      )}
      {vertical && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-secondary/50" />
      )}
    </div>
  );
}

/* ─── Source node ─── */

function SourceNode({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'shrink-0 text-center p-5 rounded-xl',
        'bg-white/[0.06] border border-white/[0.08]',
        'backdrop-blur-sm',
        className,
      )}
    >
      <Globe className="w-8 h-8 icon-gradient mx-auto mb-2.5" />
      <div className="text-sm font-semibold text-foreground">Votre Site</div>
      <div className="text-[11px] text-muted-foreground mt-1">Données first-party</div>
    </div>
  );
}

/* ─── Server node with rotating gradient border ─── */

function ServerNode({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'shrink-0 schema-server-border p-[1.5px] rounded-2xl',
        'animate-[schema-glow_3s_ease-in-out_infinite]',
        className,
      )}
    >
      <div className="bg-background rounded-[calc(1rem-1.5px)] p-6 text-center">
        <Shield className="w-10 h-10 icon-gradient mx-auto mb-2.5" />
        <div className="text-base font-bold text-gradient-primary leading-tight">
          Serveur Server-Side
        </div>
        <div className="text-[11px] text-muted-foreground mt-1.5">
          Traitement sécurisé
        </div>
      </div>
    </div>
  );
}

/* ─── Platform destination pills ─── */

function PlatformList({ className }: { className?: string }) {
  return (
    <div className={cn('shrink-0 flex flex-col gap-2', className)}>
      {platforms.map((p, i) => (
        <div
          key={p.name}
          className={cn(
            'flex items-center gap-2.5 py-2.5 px-4 rounded-lg',
            'bg-white/[0.04] border border-white/[0.06]',
            'animate-[fade-in-up_0.5s_ease-out_both]',
          )}
          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-secondary shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground leading-tight">{p.name}</div>
            <div className="text-[10px] text-muted-foreground">{p.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Mobile: 2x2 grid of platforms ─── */

function PlatformGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
      {platforms.map((p, i) => (
        <div
          key={p.name}
          className={cn(
            'flex flex-col items-center gap-1 py-3 px-3 rounded-lg text-center',
            'bg-white/[0.04] border border-white/[0.06]',
            'animate-[fade-in-up_0.5s_ease-out_both]',
          )}
          style={{ animationDelay: `${0.3 + i * 0.1}s` }}
        >
          <span className="text-sm font-medium text-foreground">{p.name}</span>
          <span className="text-[10px] text-muted-foreground">{p.sub}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main schema component ─── */

export function ServerSideSchema() {
  return (
    <div className="w-full select-none">
      {/* Desktop — horizontal flow */}
      <div className="hidden md:flex items-center py-8 px-2 lg:px-6 gap-0">
        <SourceNode />
        <FlowLine className="mx-3 lg:mx-5" />
        <ServerNode />
        <FlowLine className="mx-3 lg:mx-5" />
        <PlatformList />
      </div>

      {/* Mobile — vertical flow */}
      <div className="md:hidden flex flex-col items-center py-6 gap-0">
        <SourceNode className="w-full max-w-[200px]" />
        <FlowLine vertical className="my-1" />
        <ServerNode className="w-full max-w-[220px]" />
        <FlowLine vertical className="my-1" />
        <PlatformGrid />
      </div>
    </div>
  );
}

export default ServerSideSchema;
