Audit a component or page for design system compliance:

1. Check for hardcoded HSL/hex/RGB color values — should use design tokens (text-foreground, text-muted-foreground, border-glass-border, bg-glass, etc.)
2. Verify glassmorphism effect is used correctly (glass-bg + backdrop-blur + glass-border, NOT opaque backgrounds)
3. Check font usage: Inter for body, Sora (font-display) for headings, JetBrains Mono (font-mono) for data/code
4. Verify ev-card / ev-card-static classes are used appropriately
5. Check responsive behavior (mobile-first approach)

Target: $ARGUMENTS (file path or component name)

Report violations with specific line numbers and suggested fixes.
