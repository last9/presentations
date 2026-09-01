# Talk 5, Deploying Code You Didn't Write

**Subtitle:** Secure Continuous Delivery for Agent Code
**Track:** Supply-chain / platform eng · **Format:** 30 min
**Deck:** [`../talk-5/`](../talk-5/)

## Abstract
Agents get updated constantly, new skills, new versions, often pushed via Git
webhooks from sources you don't fully control. That's a supply-chain attack surface
hiding inside your deploy pipeline. We walk our hardened deploy path: **HMAC-SHA256
verification** of GitHub/GitLab/generic webhooks (with a 5-minute replay-dedup window
and optional IP allowlist), archive extraction that **rejects path traversal and
symlinks/hardlinks**, **strips setuid/setgid bits** (`mode & 0755`) so no planted
binary can escalate, enforces size/file-count limits against zip-bombs, and performs
an **atomic versioned symlink swap** so a deploy either fully lands or doesn't, with
instant rollback. The theme: treat every incoming deploy as hostile until proven
otherwise.

## Who it's for
Platform/release engineers; anyone building plugin/skill marketplaces or webhook-driven deploys.

## Key takeaways
1. Webhook auth done right (HMAC + replay protection).
2. Safe archive extraction (traversal, symlink, setuid, zip-bomb defenses).
3. Atomic symlink deploys for all-or-nothing + instant rollback.
4. A checklist for any "deploy code from outside" path.
5. Where it sits in zero trust: config integrity + recovery (signed configs / attestation are the Advanced next rung).

## Slide outline (after the 2 mandatory slides, ~11)
1. Your deploy pipeline is an attack surface (engineer9 skills ship via git).
2. The threat: spoofed webhook, traversal, symlink escape, setuid binary, zip-bomb.
3. HMAC-SHA256 verification per provider.
4. Replay-dedup window + optional IP allowlist.
5. Extraction: strip-root + per-path containment check.
6. Reject symlinks/hardlinks.
7. `& 0755` setuid/setgid strip.
8. Size / file-count limits.
9. Atomic versioned symlink swap + instant rollback.
10. **Demo:** bad HMAC → 401; `../` tar → rejected; setuid bit gone after deploy.
11. Takeaways.

*Source:* `internal/gitdeploy/`, `internal/api/deploy.go`.

## Pitch angle
"Every webhook-driven deploy is a door. I'll try five different ways to sneak
malicious code through ours, bad signature, path traversal, symlink, setuid bit,
zip-bomb, and show you the check that stops each."
