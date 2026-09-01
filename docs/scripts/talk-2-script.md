# Presenter script: Talk 2: Secrets That Even Your Own Code Can't Steal

**Slot:** 30 min (compresses to a lightning talk on the construction-binding idea). **Deck:** `slides/talk-2/`.
**Spine:** cross-tenant secret leakage is the scariest multi-tenant failure; make it structurally impossible, not a rule you must remember. Zero-trust: least privilege + agent identity; the maturity path is short-lived, hardware-bound tokens.
**Time budget:** problem 6 · structural defense 12 · ergonomics + snapshot 8 · close 4.

- **Title.** "The scariest thing in a multi-tenant agent platform isn't the model going rogue. It's agent A reading agent B's API key."
- **What is an agent.** Standard loop slide; payoff here: "that loop holds *real credentials*, AWS keys, Slack and Linear tokens."
- **Thesis.** "Isolation must be structural, not conventional. For secrets: bind access in the key and the constructor, not in a query you have to remember to write."
- **The nightmare (attack).** Acme and Globex share a process pool and one Postgres. "If reading a neighbor's secret is one forgotten WHERE clause away, it *will* happen."
- **The usual answer (attack).** `SELECT … WHERE tenant_id = $1`. "That's convention: correctness rides on every developer, every query, forever. A rule you must remember is a rule you'll eventually forget."
- **Defense 1, bound at construction.** `NewPGStore(pool, masterKey, workspaceID, agentID)`; no method takes another agent's id. "You can't *ask* for another agent's secret, there's no parameter for it." Verdict: contained by the constructor, not discipline.
- **Defense 2, envelope encryption.** Argon2id (t=1, 64MB, 4 threads) → AES-256-GCM; `salt(32)‖nonce(12)‖ciphertext`; random salt per credential. "Compromising one credential's derivation tells you nothing about the next."
- **Ergonomics.** Masked reads (`GetMasked` → first8…last4) so UIs never touch plaintext; return-secret-once for webhook secrets, no GET endpoint to leak. "Make the safe path the easy path."
- **Snapshot figure.** The newer exposure: a micro-VM's fast restore writes RAM to disk; one token = **65** plaintext copies in a 256MB memfile. SEV-SNP hides RAM from the host but not from the agent's own code.
- **Demo.** Two agents; from Acme's store, reach for Globex's token. No API for it; the bytes on disk are gibberish without Globex's derived key.
- **Limits + close.** Honest: master-key compromise, no rotation yet. **Zero-trust maturity path: short-lived tokens, hardware-bound, reference-not-value** (Anthropic: "rotating a credential you can grep out of a lockfile doesn't raise the cost"). Close: "leaking a neighbor's secret isn't a bug to avoid, it's an operation that doesn't exist."

**Pitch angle (~90s):** "Every multi-tenant tutorial says add `WHERE tenant_id = ?`. I'll show why that's not enough when the code in the tenant is the attacker, and a design where leaking a neighbor's secret is an operation that doesn't exist."
