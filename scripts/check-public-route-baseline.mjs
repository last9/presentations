#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const fixturePath = resolve(root, "baselines/public-routes.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const failures = [];
const seenPaths = new Set();

if (fixture.version !== 1) failures.push("fixture version must be 1");
if (!/^\d{4}-\d{2}-\d{2}$/.test(fixture.capturedAt)) {
  failures.push("capturedAt must use YYYY-MM-DD");
}
if (!/^[0-9a-f]{40}$/.test(fixture.sourceCommit)) {
  failures.push("sourceCommit must be a full Git commit SHA");
}
if (!Array.isArray(fixture.routes) || fixture.routes.length === 0) {
  failures.push("routes must be a non-empty array");
}

for (const endpoint of fixture.discoveryEndpoints ?? []) {
  if (endpoint.status !== 404) {
    failures.push(`${endpoint.path}: discovery baseline status must be 404`);
  }
  const expectedUrl = new URL(endpoint.path, "https://last9.github.io").href;
  if (endpoint.finalUrl !== expectedUrl) {
    failures.push(`${endpoint.path}: finalUrl must be ${expectedUrl}`);
  }
}

for (const route of fixture.routes ?? []) {
  if (seenPaths.has(route.path)) failures.push(`duplicate route: ${route.path}`);
  seenPaths.add(route.path);

  if (!route.path.startsWith("/presentations/")) {
    failures.push(`${route.path}: route must remain under /presentations/`);
  }
  if (route.status !== 200) failures.push(`${route.path}: expected status must be 200`);
  if (!route.contentType) failures.push(`${route.path}: contentType is required`);
  if (!Number.isInteger(route.contentLength) || route.contentLength <= 0) {
    failures.push(`${route.path}: contentLength must be a positive integer`);
  }

  const expectedUrl = new URL(route.path, "https://last9.github.io").href;
  if (route.finalUrl !== expectedUrl) {
    failures.push(`${route.path}: finalUrl must be ${expectedUrl}`);
  }

  const sourcePath = resolve(root, route.sourcePath);
  if (!existsSync(sourcePath)) {
    failures.push(`${route.path}: missing source ${route.sourcePath}`);
    continue;
  }

  if (route.sha256) {
    const actualHash = createHash("sha256").update(readFileSync(sourcePath)).digest("hex");
    if (actualHash !== route.sha256) {
      failures.push(
        `${route.path}: ${route.sourcePath} changed (expected ${route.sha256}, got ${actualHash})`,
      );
    }
  }
}

if (failures.length) {
  console.error("Public route baseline failures:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

const hashedRoutes = fixture.routes.filter((route) => route.sha256).length;
console.log(
  `Checked ${fixture.routes.length} public routes, ${hashedRoutes} content hashes, and ${fixture.discoveryEndpoints?.length ?? 0} discovery endpoints against the ${fixture.capturedAt} baseline.`,
);
