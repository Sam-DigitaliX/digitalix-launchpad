# design-sync notes — DigitaliX Launchpad

## How this repo is shaped for the sync
- Not a published package: `.design-sync/ds/` is a synthetic package (`@digitalix/ui`) whose `index.ts` re-exports the subset of `src/components/ui` actually used by the site + `OrbitLoader`. Scope decided with Samuel on 2026-09-28: used components only (14), no Storybook.
- `cfg.buildCmd` (`node .design-sync/ds/build.mjs`) must run before the converter: it emits `.d.ts` via `tsc -p .design-sync/ds/tsconfig.json` and compiles Tailwind (`src/index.css` + `tailwind.config.ts`, content = `src/**` + `.design-sync/previews/**`) into `.design-sync/ds/dist/styles.css`. Both outputs are gitignored.
- Geist woff2 files are copied from `node_modules/geist` into `ds/dist/fonts/` (cssEntry is bounded to the package dir; `/node_modules/...` URLs from index.css are dropped otherwise). Inter loads via the Google Fonts `@import` ([FONT_REMOTE], expected).
- Compound subparts (DialogContent, SelectItem...) are excluded from cards via `componentSrcMap: null` but remain on `window.DigitalixUI` — composition is documented in the root previews.
- Converter command: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry .design-sync/ds/index.ts --out ./ds-bundle [--remote .design-sync/.cache/remote-sync.json]`.

## Preview gotchas
- Card harness page is white; the DS is dark-only. Every preview wraps in `.design-sync/preview-kit/Surface.tsx` (`bg-background` surface). Helpers must live outside `previews/` (a file there is treated as a component preview -> "stale preview" warning).
- `OrbitLoader` is `position: fixed`: its preview wraps it in a `transform: translateZ(0)` box to give it a containing block.
- Radix Toast renders into `ToastViewport`; preview makes the viewport `static` and sets `duration={Infinity}`.
- Dialog/Sheet use `defaultOpen modal={false}` + `cardMode: single`.
- Prettier (repo config) rewrites previews to single quotes — run it before grading, or grades clear on the next build.

## Known render warns
- [TOKENS_MISSING] `--radix-*`, `--skeleton-width`, `--sidebar-width*`, `--color-border`, `--color-bg`: runtime-set by Radix / out-of-scope components (chart, sidebar, navigation-menu). Expected.
- [FONT_REMOTE] Inter: expected.

## Re-sync risks
- Scope is hand-maintained in `ds/index.ts`: a new shadcn component used by the site won't sync until added there (and, if it has subparts, to `componentSrcMap` nulls).
- Tailwind CSS is precompiled from current site + preview usage: utilities the design agent uses that the site never uses do not exist. The conventions header says so; re-check if the site's class vocabulary shrinks.
- `ev-*` classes and tokens are listed in `.design-sync/conventions.md` — rename one in `src/index.css` and the header goes stale (the re-sync validation pass catches it).
- Chromium: playwright 1.60.0 in `.ds-sync/` + `chromium_headless_shell-1223` in `~/Library/Caches/ms-playwright`.
