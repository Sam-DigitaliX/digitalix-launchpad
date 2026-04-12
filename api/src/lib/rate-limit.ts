const store = new Map<string, number[]>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 3;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (store.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (hits.length >= MAX_PER_WINDOW) return false;

  hits.push(now);
  store.set(ip, hits);
  return true;
}

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of store) {
    const valid = hits.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      store.delete(ip);
    } else {
      store.set(ip, valid);
    }
  }
}, CLEANUP_INTERVAL_MS);
