# DigitaliX design system — conventions

Dark-only glassmorphism (Evervault-inspired): black canvas, violet `primary` (hsl 262 83% 58%), cyan `secondary` (hsl 188 94% 43%), translucent glass surfaces, violet→cyan gradients for primary actions. French copy.

## Setup
- No provider is required. `styles.css` sets `body` to `bg-background text-foreground font-sans` (black, near-white text). Every screen must sit on that black canvas; if you render inside your own root, give it `bg-background text-foreground`. Never put these components on a white surface: text and borders are tuned for dark and become invisible.
- Overlays (`Dialog`, `Sheet`, `Select`, `Tooltip`) portal to `body`. `Tooltip` needs a `TooltipProvider` ancestor. Toasts render inside `ToastViewport`, which must sit in a `ToastProvider`.
- Fonts: `font-sans` = Inter (body), `font-display` = Geist (h1–h3 get it automatically), `font-mono` = Geist Mono.

## Styling idiom: Tailwind utilities + `ev-*` classes
`styles.css` is a **precompiled** Tailwind build: only utilities the site already uses exist. Prefer the families below. For anything missing, use an inline `style` with the CSS variables (`hsl(var(--primary))`, `var(--glass-border)`).

| Purpose | Classes |
|---|---|
| Surfaces | `bg-background`, `bg-card`, `bg-muted`, `bg-glass`, `glass-card` |
| Text | `text-foreground`, `text-muted-foreground`, `text-primary`, `text-secondary`, `text-gradient-primary` |
| Borders | `border-glass-border`, `border-white/[0.08]` |
| Gradient | `bg-gradient-to-r from-primary to-secondary` |
| Brand blocks | `ev-card` (animated gradient border), `ev-card-static` (hover glow), `ev-input` (glass field + violet focus glow), `ev-btn-primary`, `ev-mesh-bg`, `ev-dot-grid`, `ev-noise`, `ev-shimmer`, `ev-table-row` |
| Motion | `ev-fade-in`, `ev-fade-in-delay-1`…`-4` |

Tokens (CSS variables, HSL triplets unless noted): `--background --foreground --card --muted --muted-foreground --primary --primary-glow --secondary --secondary-glow --border --input --ring --destructive --radius`, plus full values `--glass-bg --glass-border --glass-highlight --gradient-primary --gradient-hero --gradient-cta --gradient-card --shadow-glow-primary --shadow-glow-secondary --shadow-card`.

## Components
- `Button`: the primary CTA is `variant="heroGradient"` (violet→cyan) with `size="lg"` or `"xl"`. Secondary action: `heroGradientOutline` or `outline`. Also `default secondary glass ghost link destructive hero heroOutline cta`. Sizes: `sm default lg xl icon`.
- Forms: `Label` + `Input` in a `space-y-2` stack. Site fields use `className="bg-muted/50 border-glass-border focus:border-primary"`, or `ev-input h-12` for hero inputs. `Checkbox` + `Label htmlFor` for RGPD consent.
- `Select`: trigger `h-12 bg-white/[0.04] border-white/[0.08]`, content `bg-background border-white/[0.08]`.
- `Accordion` FAQ items: `rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg px-6`.
- Loaders: `BlockProgressLoader percentage={n}` for progress, and `OrbitLoader` as the full-screen fallback (it is `position: fixed`).

Where to look: `styles.css` → `_ds_bundle.css` for every available class, and each `components/general/<Name>/<Name>.prompt.md` for usage.

## Example
```tsx
<section className="bg-background px-6 py-20">
  <div className="ev-card mx-auto max-w-xl p-8 space-y-6">
    <h2 className="text-3xl font-bold">Auditez votre tracking</h2>
    <p className="text-muted-foreground">28 vérifications server-side et RGPD en 3 minutes.</p>
    <div className="space-y-2">
      <Label htmlFor="url">URL du site</Label>
      <Input id="url" placeholder="https://www.votre-site.fr" className="ev-input h-12 px-4" />
    </div>
    <Button variant="heroGradient" size="lg" className="w-full">Lancer l'audit</Button>
  </div>
</section>
```
