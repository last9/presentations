# Talk 4, Tamper-Evident Agents

**Subtitle:** Audit and Observability for Systems You Can't Fully Trust
**Track:** Governance / SRE · **Format:** 30 min (strong Track-1 ops fit)
**Deck:** [`../talk-4/`](../talk-4/)

## Abstract
When agents act autonomously on behalf of tenants, "what did it do, and can I prove
it?" becomes a compliance and incident-response requirement. We built an append-only
audit log with a **per-workspace SHA-256 hash chain**: each event hashes the prior
hash plus its own fields, so any after-the-fact tampering breaks the chain and is
detectable on review. Events (tool executions, approval decisions, skill installs) are
batched (100 / max 1s) and date-partitioned for archival. Alongside it sits a
12-metric Prometheus surface deliberately designed to *avoid* cardinality explosion ,
`request_id` exemplars instead of high-cardinality workspace labels, plus optional
OTEL traces. This talk is about building accountability into agentic systems without
drowning your metrics backend.

## Who it's for
SREs, platform engineers, anyone facing SOC2/compliance for agent-driven actions.

## Key takeaways
1. Hash-chained append-only logs give tamper-evidence cheaply.
2. Batching design for low-latency, low-loss audit (with a drop metric for backpressure).
3. The cardinality trap in agent observability and how exemplars solve it.
4. Which signals actually matter for agent incident response (dwell time, coverage).
5. Why this is the zero-trust **Enterprise** bar: "immutable audit trails with integrity verification."

## Slide outline (after the 2 mandatory slides, ~11)
1. "Prove what your agent did" (engineer9 stops EC2, posts to customer Slack).
2. Why ordinary logs aren't trustworthy under a malicious actor.
3. Hash-chain primer.
4. Our per-workspace chain construction (fields hashed; `LoadLastHashes` at startup).
5. Detecting tampering on review.
6. Batching: 100/1s, buffered, `AuditEventsDropped` for backpressure.
7. Date partitioning for retention.
8. The 12-metric surface (LLM, tools, approvals, cost, audit health).
9. The cardinality trap → request_id exemplars, not workspace_id.
10. **Demo:** tamper with one audit row → chain breaks.
11. Takeaways.

*Source:* `internal/o11y/audit.go`, `internal/o11y/metrics.go`, migration `001_initial.up.sql`.

## Pitch angle
"I'll tamper with our audit log live and show you how we catch it, and why your agent
metrics will melt your Prometheus if you label them the obvious way."
