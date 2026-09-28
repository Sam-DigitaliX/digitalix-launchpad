// Builds the design-sync package inputs: .d.ts tree (tsc) + compiled Tailwind stylesheet.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

rmSync(".design-sync/ds/types", { recursive: true, force: true });
run("npx tsc -p .design-sync/ds/tsconfig.json");

mkdirSync(".design-sync/ds/dist", { recursive: true });
const out = ".design-sync/ds/dist/styles.css";
run(
  `npx tailwindcss -c tailwind.config.ts -i src/index.css -o ${out} --minify ` +
    `--content "./src/**/*.{ts,tsx},./.design-sync/previews/**/*.tsx"`,
);
// index.css references Geist via the Vite dev-server path /node_modules/...; ship the woff2 files next to the stylesheet.
mkdirSync(".design-sync/ds/dist/fonts", { recursive: true });
copyFileSync("node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2", ".design-sync/ds/dist/fonts/Geist-Variable.woff2");
copyFileSync("node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2", ".design-sync/ds/dist/fonts/GeistMono-Variable.woff2");
const css = readFileSync(out, "utf8").replace(/\/node_modules\/geist\/dist\/fonts\/geist-(?:sans|mono)\//g, "./fonts/");
writeFileSync(out, css);
