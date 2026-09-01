# Talk 3, Stopping the $50k Agent

**Subtitle:** Cost Governance (FinOps) for Agentic Systems
**Track:** Cost optimization / ops · **Format:** 30 min
**Deck:** [`../talk-3/`](../talk-3/)

## Abstract
An agent stuck in a retry loop can spend more in an hour than a team spends in a
month. Token spend is the new blast radius. This talk shows the cost-governance layer
we built into a multi-tenant agent platform: atomic per-`(workspace, agent, model)`
usage counters stored in *micro-USD integers* (no float drift), flushed to Postgres
every 30s with re-add-on-failure so a transient DB blip never loses spend; and monthly
**soft/hard budget caps checked *before* every LLM call**, soft cap downgrades the
model (Opus → Haiku), hard cap blocks the request with `ErrHardCapExceeded`. We cover
the concurrency-safe accounting, the pre-call-gate pattern, the data model that slices
cost by tenant/agent/model/month, and how it feeds Prometheus for real-time cost
dashboards.

## Who it's for
Platform/infra and FinOps engineers running LLM workloads; anyone who's been surprised
by an AI bill.

## Key takeaways
1. Treat cost as a containment problem with pre-call enforcement, not a billing afterthought.
2. Integer micro-USD accounting to avoid float drift.
3. Lossless atomic counters with deferred flush.
4. Soft-cap-downgrade vs hard-cap-block as graceful degradation.
5. A queryable cost data model.
6. The zero-trust framing: this is the **resource-exhaustion / loop-amplification** threat; a hard cap *removes* the ability to overspend, a rate limit only *throttles* it (impossible beats tedious).

## Slide outline (after the 2 mandatory slides, ~11)
1. A real runaway-spend story (engineer9's hourly heartbeat × a tool-error loop).
2. Why post-hoc billing alerts are too late.
3. Thesis: gate spend *before* the call.
4. The atomic `Usage` counter (tokens in/out/cache, micro-USD).
5. Why micro-USD integers, not float.
6. Deferred flush + re-add-on-failure for losslessness under concurrency.
7. The `cost_usage` schema (slice by workspace/agent/model/period).
8. `BudgetCheck` flow: soft → downgrade, hard → block.
9. **Demo:** low hard cap → call blocked with `ErrHardCapExceeded` at $0-over.
10. Prometheus `mithai_cost_usd_total` dashboards.
11. Takeaways.

*Source:* `internal/cost/tracker.go`, `internal/cost/budget.go`, `internal/o11y/metrics.go`.

## Pitch angle
"Your agent can spend your annual budget in a weekend. I'll show you a pre-call budget
gate that stops it mid-loop, and the integer-cents accounting that keeps the numbers
honest under concurrency."
