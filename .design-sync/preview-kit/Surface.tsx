import type { ReactNode } from 'react';

// Preview cards render on a white page; DigitaliX is dark-only (body = bg-background in the site).
export const Surface = ({ children }: { children: ReactNode }) => (
  <div className="dark bg-background text-foreground font-sans antialiased rounded-xl p-6">{children}</div>
);
