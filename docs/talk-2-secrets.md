# Talk 2, Secrets That Even Your Own Code Can't Steal

**Subtitle:** Compartmentalizing Secrets in Multi-Tenant Agent Systems
**Track:** Security / cryptography · **Format:** 30 min (compresses to lightning)
**Deck:** [`../talk-2/`](../talk-2/)

## Abstract
When you run many tenants' agents on one platform, the scariest failure is
cross-tenant secret leakage, agent A reading agent B's Slack or AWS token. Most
systems prevent this with careful `WHERE tenant_id = ?` clauses and code review ,
i.e., by *convention*. We made it *structural*: an agent's credential store is bound
to a single `(workspace, agent)` pair at construction, and each secret is encrypted
with a key derived per-credential via Argon2id from a master key plus a random
per-credential salt, sealed with AES-256-GCM. The result: an agent literally cannot
*name*, let alone decrypt, another agent's secret, even if its own code is malicious.
This is a deep, copyable walk through the scheme: key-derivation parameters and why,
the `salt(32)‖nonce(12)‖ciphertext` layout, masked reads for UIs, return-secret-once
webhook semantics, and the honest limits (no key rotation yet).

## Who it's for
Engineers building multi-tenant systems (agents or not) who handle per-tenant secrets;
security-minded backend engineers.

## Key takeaways
1. "Structural vs conventional" applied to secrets.
2. A concrete per-tenant envelope-encryption recipe (Argon2id + AES-256-GCM, per-credential salt).
3. API design that makes misuse hard (construction-time binding, masked reads, return-once).
4. What it protects against, and what it doesn't (master-key compromise, rotation).
5. Where this sits in zero trust: least privilege + agent identity; the maturity path is short-lived, hardware-bound tokens and reference-not-value (Anthropic: "rotating a credential you can grep out of a lockfile doesn't raise the cost"). The credentials-in-the-snapshot exposure makes it concrete.

## Slide outline (after the 2 mandatory slides, ~12)
1. The cross-tenant leak nightmare (engineer9 holds AWS + Slack + Linear creds).
2. The conventional approach and why it fails under malicious code.
3. Thesis: bind access at construction, not at query.
4. The `Store` interface + `NewPGStore(pool, masterKey, workspaceID, agentID)`.
5. Why this makes cross-agent access *syntactically* impossible.
6. Envelope-encryption overview.
7. Argon2id params (time=1, 64MB, 4 threads, 32-byte key) and rationale.
8. On-disk layout `salt(32)‖nonce(12)‖AES-256-GCM`.
9. Per-credential salt → why not one key.
10. UX: `GetMasked` (first-8…last-4), return-secret-once for webhook secrets.
11. **Demo:** two agents; one tries and fails to read the other's secret.
12. Limits + roadmap (rotation) + takeaways.

*Source:* `internal/credential/store.go`, `internal/agenthook/handler.go`.

## Pitch angle (~90s)
"Every multi-tenant tutorial tells you to add `WHERE tenant_id = ?`. I'll show you why
that's not enough when the code in the tenant is the attacker, and a crypto design
where leaking a neighbor's secret isn't a bug you have to avoid, it's an operation
that doesn't exist."
