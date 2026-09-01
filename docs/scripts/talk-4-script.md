# Presenter script: Talk 4: Tamper-Evident Agents

**Slot:** 30 min (strong Track-1 / ops fit). **Deck:** `slides/talk-4/`.
**Spine:** when agents act autonomously, "what did it do, and can I prove it?" is a compliance + IR requirement. Make the record tamper-evident, not merely trusted. Our hash chain = zero-trust's *Enterprise* "immutable audit trails with integrity verification."
**Time budget:** problem 7 · hash chain 8 · observability 8 · demo 5.

- **Title.** "When an agent acts on your behalf, someone will eventually ask you to account for it."
- **What is an agent.** Loop slide; payoff: "every tool call is an action someone will later ask you to account for."
- **Thesis.** "Make the record tamper-evident, not merely trusted. A log you can edit isn't evidence; a hash chain turns 'trust the log' into 'verify the log.'"
- **The question (attack).** engineer9 stopped an EC2 instance and posted to a customer channel; six months later compliance wants the trail. "If it lives in a mutable table the same operators can edit, it isn't proof."
- **Defense, hash chain.** Each event hashes the one before it (prev + timestamp + type + workspace + agent + request id). Append-only, batched (100 / max 1s), date-partitioned. "Tamper with one row and every subsequent hash stops matching." Note: this is the zero-trust *Enterprise* bar.
- **Observability, cardinality trap.** The obvious mistake: label every metric with `workspace_id` → cardinality explosion. What we do: 12 metrics, high-cardinality IDs go in **exemplars** (`request_id`), not labels. "Drill from metric to trace by exemplar, without paying the cardinality tax." Mention the two signals AI-accelerated ops moves most: dwell time and coverage.
- **Demo + close.** `UPDATE` one `detail` field in Postgres, re-walk the chain, the verifier points straight at the tampered row.

**Pitch angle:** "I'll tamper with our audit log live and show you how we catch it, and why your agent metrics will melt Prometheus if you label them the obvious way."
