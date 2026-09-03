#!/usr/bin/env node
// Inlines a deck into one portable HTML file: no node_modules, no network, no build step.
// Usage: node scripts/build-standalone.mjs <deck-dir> [out.html]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, extname } from "node:path";

const root = resolve(import.meta.dirname, "..");
const deckDir = resolve(process.argv[2] ?? ".");
const src = join(deckDir, "index.html");
if (!existsSync(src)) throw new Error(`no index.html in ${deckDir}`);

let html = readFileSync(src, "utf8");
const from = (p) => resolve(deckDir, p);

const MIME = { ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg",
               ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };
const dataUri = (file) =>
  `data:${MIME[extname(file).toLowerCase()] ?? "application/octet-stream"};base64,${readFileSync(file).toString("base64")}`;

// Fontsource ships a @font-face per unicode-range. Keep only the plain latin one
// per family and embed its woff2 — the decks are English and this is 80% of the weight.
function inlineFontCss(cssPath) {
  const css = readFileSync(cssPath, "utf8");
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  return blocks
    .filter((b) => /-latin-[a-z]*-?normal\.woff2/.test(b) && !/-latin-ext-/.test(b))
    .map((b) =>
      b.replace(/url\(\.\/([^)]+?)\)/g, (_, rel) => `url(${dataUri(join(dirname(cssPath), rel))})`)
       .replace(/src:\s*url\(([^)]+)\)\s*format\('woff2-variations'\)[^;]*;/,
                "src: url($1) format('woff2');"))
    .join("\n");
}

let dropped = [];
const usesHighlight = /<pre|<code/.test(html);

// Must happen before scripts are inlined: afterwards reveal.js's own source
// contains "plugins:[...]" and the replace would hit that instead.
if (!usesHighlight) html = html.replace(/plugins:\s*\[[^\]]*\]/, "plugins:[]");

// stylesheets -> <style>
html = html.replace(/[ \t]*<link rel="stylesheet" href="([^"]+)">\n/g, (m, href) => {
  const file = from(href);
  if (!usesHighlight && /highlight/.test(href)) { dropped.push(href); return ""; }
  const css = /@fontsource/.test(href) ? inlineFontCss(file) : readFileSync(file, "utf8");
  if (/@fontsource/.test(href) && !css.trim()) { dropped.push(href); return ""; }
  return `  <style>/* ${href} */\n${css}\n  </style>\n`;
});

// scripts -> inline
html = html.replace(/[ \t]*<script src="([^"]+)"><\/script>\n/g, (m, s) => {
  if (!usesHighlight && /highlight/.test(s)) { dropped.push(s); return ""; }
  return `  <script>/* ${s} */\n${readFileSync(from(s), "utf8")}\n  </script>\n`;
});

// images -> data URIs
html = html.replace(/(src|href)="((?:\.\.\/)?assets\/[^"]+)"/g, (m, attr, p) => `${attr}="${dataUri(from(p))}"`);
html = html.replace(/url\((["']?)((?:\.\.\/)?assets\/[^)"']+)\1\)/g, (m, q, p) => `url(${dataUri(from(p))})`);

const out = resolve(process.argv[3] ?? join(deckDir, "standalone.html"));
writeFileSync(out, html);

const left = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1])
  .filter((u) => !/^(data:|https?:|#|mailto:)/.test(u))
  .filter((u) => !u.includes("${"));   // template literals inside inlined JS, not real refs
console.log(`${out.replace(root + "/", "")}  ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB`);
if (dropped.length) console.log(`  dropped (unused): ${dropped.join(", ")}`);
console.log(left.length ? `  ⚠ still external: ${left.join(", ")}` : `  ✓ zero external references`);
