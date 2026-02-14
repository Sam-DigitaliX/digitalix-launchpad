/**
 * Evervault-style orbit loader — concentric conic-gradient rings.
 * Reuses the .orbit-ring CSS from index.css with an always-active modifier.
 * Used as Suspense fallback and anywhere a loading state is needed.
 */
const OrbitLoader = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    aria-label="Chargement"
    role="status"
  >
    {/* Ambient glow — subtle violet + cyan */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: 'hsl(262 83% 58% / 0.12)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[30%] w-[300px] h-[300px] rounded-full blur-[100px]"
        style={{ background: 'hsl(188 94% 43% / 0.10)' }}
      />
    </div>

    {/* Orbit rings */}
    <div className="orbit-loader relative w-28 h-28">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="orbit-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${100 - i * 22}%`,
            height: `${100 - i * 22}%`,
          }}
        />
      ))}
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-primary to-secondary" />
    </div>
  </div>
);

export default OrbitLoader;
