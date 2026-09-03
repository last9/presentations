#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ignored = new Set([".git", "node_modules"]);
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (extname(entry.name) === ".html") htmlFiles.push(path);
  }
}

walk(root);

const failures = [];
const attributePattern = /(?:href|src)=["']([^"']+)["']/g;

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  for (const match of html.matchAll(attributePattern)) {
    const target = match[1];
    if (/^(?:[a-z]+:|#|\/\/)/i.test(target)) continue;
    // standalone builds inline reveal.js, whose source contains ${...} template literals
    if (target.includes("${")) continue;

    const cleanTarget = target.split(/[?#]/, 1)[0];
    if (!cleanTarget) continue;

    const resolved = resolve(dirname(htmlFile), cleanTarget);
    const candidates = cleanTarget.endsWith("/")
      ? [resolved, join(resolved, "index.html")]
      : [resolved, join(resolved, "index.html")];

    if (!candidates.some(existsSync)) {
      failures.push(`${relative(root, htmlFile)} -> ${target}`);
    }
  }
}

if (failures.length) {
  console.error("Broken local links:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files: all local links resolve.`);
