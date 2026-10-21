#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// First release per supported line that rejects TLS chains through the
// compromised eMudhra intermediates (nodejs/node#66871). Lines missing here
// have no patched release and must not be allowed.
const patchedFloors = {
  22: "22.23.4", // 4342503fd8
  24: "24.22.1", // 01acf0ee74
};

const failures = [];

function parseVersion(text) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(text);
  return match ? match.slice(1).map(Number) : null;
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

// Returns the patched floor for `version`'s major, or a failure message.
function patchedFloorFor(label, version) {
  const floor = patchedFloors[version[0]];
  if (!floor) return `${label}: Node ${version[0]} has no release with the eMudhra blocklist`;
  if (compareVersions(version, parseVersion(floor)) < 0) {
    return `${label}: ${version.join(".")} predates the patched ${floor}`;
  }
  return null;
}

const nvmrcPath = resolve(root, ".nvmrc");
const pinnedText = existsSync(nvmrcPath) ? readFileSync(nvmrcPath, "utf8").trim() : "";
const pinned = parseVersion(pinnedText);
if (!pinned) {
  failures.push(`.nvmrc must pin an exact Node version (got "${pinnedText}")`);
} else {
  const failure = patchedFloorFor(".nvmrc", pinned);
  if (failure) failures.push(failure);
}

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const enginesText = packageJson.engines?.node ?? "";
const ranges = enginesText ? enginesText.split("||").map((range) => range.trim()) : [];
if (!ranges.length) failures.push("package.json engines.node is required");
for (const range of ranges) {
  const floor = range.startsWith("^") ? parseVersion(range.slice(1)) : null;
  if (!floor) {
    failures.push(`engines.node: "${range}" must be a caret range on an exact version`);
    continue;
  }
  const failure = patchedFloorFor(`engines.node "${range}"`, floor);
  if (failure) failures.push(failure);
}
if (pinned && !ranges.some((range) => {
  const floor = parseVersion(range.slice(1));
  return floor && floor[0] === pinned[0] && compareVersions(pinned, floor) >= 0;
})) {
  failures.push(`.nvmrc ${pinnedText} does not satisfy engines.node "${enginesText}"`);
}

// CI must run the pinned version rather than whatever its own input resolves to.
const workflow = readFileSync(resolve(root, ".github/workflows/check.yml"), "utf8");
if (!/^\s*node-version-file: \.nvmrc$/m.test(workflow) || /^\s*node-version:/m.test(workflow)) {
  failures.push("check.yml: setup-node must use node-version-file: .nvmrc");
}

if (failures.length) {
  console.error("Node version failures:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Checked Node pin ${pinnedText} and engines "${enginesText}" against patched floors.`);
