interface BlockProgressLoaderProps {
  percentage: number;
  label?: string;
  title?: string;
  totalBlocks?: number;
}

export function BlockProgressLoader({
  percentage,
  label,
  title = "Analyse en cours",
  totalBlocks = 20,
}: BlockProgressLoaderProps) {
  const pct = Math.min(Math.max(Math.round(percentage), 0), 99);
  const filledBlocks = Math.round((pct / 100) * totalBlocks);

  return (
    <div className="text-center">
      {/* Ambient glow */}
      <div className="relative mx-auto mb-6" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] rounded-full blur-[80px]"
          style={{ background: 'hsl(262 83% 58% / 0.12)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] w-[200px] h-[80px] rounded-full blur-[60px]"
          style={{ background: 'hsl(188 94% 43% / 0.10)' }}
        />
      </div>

      {/* Title with animated dots */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 relative">
        {title}
        <span className="inline-flex ml-1">
          <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
          <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
          <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
        </span>
      </h2>

      {/* Current step label */}
      {label && (
        <p className="text-sm text-muted-foreground mb-6">{label}</p>
      )}

      {/* Percentage */}
      <div className="mb-4">
        <span className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {pct}%
        </span>
      </div>

      {/* Block grid in ev-card container */}
      <div className="ev-card p-4">
        <div className="relative z-10 flex gap-1.5 justify-center">
          {Array.from({ length: totalBlocks }).map((_, i) => {
            const isFilled = i < filledBlocks;
            const isNext = i === filledBlocks;
            return (
              <div
                key={i}
                className={`h-8 flex-1 rounded-sm transition-all duration-500 ${
                  isFilled
                    ? ""
                    : isNext
                      ? "animate-[pulse_1.5s_ease-in-out_infinite]"
                      : ""
                }`}
                style={
                  isFilled
                    ? {
                        background: `linear-gradient(135deg, hsl(262 83% ${58 + (i / totalBlocks) * 15}%), hsl(188 94% ${43 + (i / totalBlocks) * 15}%))`,
                        boxShadow: '0 0 8px hsl(262 83% 58% / 0.3)',
                      }
                    : isNext
                      ? { background: 'hsl(262 83% 58% / 0.25)' }
                      : { background: 'hsl(0 0% 100% / 0.04)', border: '1px solid hsl(0 0% 100% / 0.06)' }
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
