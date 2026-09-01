#!/usr/bin/env node
/* Convert every assets/svg/*.svg → assets/png/*.png at 2x for crisp slides/social.
   Rule: in HTML we embed SVG; this produces a PNG twin for portability + non-HTML reuse.
   Usage: npm run assets */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const svgDir = join(here, "..", "assets", "svg");
const pngDir = join(here, "..", "assets", "png");
const SCALE = 2; // 2x raster

if (!existsSync(svgDir)) { console.error(`no svg dir: ${svgDir}`); process.exit(1); }
if (!existsSync(pngDir)) mkdirSync(pngDir, { recursive: true });

const files = readdirSync(svgDir).filter((f) => f.endsWith(".svg"));
if (files.length === 0) { console.log("no .svg files to convert"); process.exit(0); }

let n = 0;
for (const f of files) {
  const svg = readFileSync(join(svgDir, f), "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: SCALE },
    background: "rgba(0,0,0,0)",
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  const out = join(pngDir, basename(f, ".svg") + ".png");
  writeFileSync(out, png);
  console.log(`✓ ${f} → png/${basename(out)}`);
  n++;
}
console.log(`\nconverted ${n} file(s) at ${SCALE}x`);
