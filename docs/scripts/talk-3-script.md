# Presenter script: Talk 3: Stopping the $50k Agent

**Slot:** 30 min. **Deck:** `slides/talk-3/`.
**Spine:** token spend is the new blast radius; gate it *before* the call, not on the invoice. Zero-trust names this threat "resource exhaustion / loop amplification"; a hard cap *removes* the capability to overspend, a rate limit only *throttles* it.
**Time budget:** problem 8 · defenses 12 · substrate + demo 10.

- **Title.** "An agent in a retry loop can spend more in an hour than your team spends in a month."
- **What is an agent.** Loop slide; payoff: "every turn of that loop is a metered LLM call. Token spend is the new blast radius."
- **Thesis.** "Gate spend before the call, not on the invoice. A budget you discover at month-end is an autopsy; a budget checked before the call is a control." Add: a hard cap *removes* overspend, a rate limit *throttles* it (the impossible-not-tedious test, applied to cost).
- **The runaway (attack).** Name it the framework's way: **resource exhaustion via loop amplification.** A tool-error loop, a recursive plan, a cron that never settles. "It does it silently, one reasonable-looking call at a time."
- **Billing too late (attack).** Pre-empt "we have alerts": provider usage lags minutes to hours; the loop runs ten thousand times in that window. "You can't alert your way out of a tight loop." Detection throttles; it doesn't remove.
- **Defense, pre-call gate.** `BudgetCheck`: hard cap → `ErrHardCapExceeded` (block), soft cap → downgrade Opus→Haiku, checked before the call. "Blocked at $0 over, before a single token is spent."
- **Defense, accounting.** Atomic per-(workspace, agent, model) counters; **micro-USD integers** (no float drift); flush every 30s, re-add on DB failure (never lose spend). Queryable by tenant/agent/model/month; feeds `mithai_cost_usd_total`, the early warning, not the only defense.
- **The substrate matters.** Where you run changes the bill: Fly Sprites scale-to-zero at 30s idle → ~$0.46 for a 4h session; e2b 150ms spawn; Modal ~3x CPU premium. "Ephemeral + scale-to-zero turns idle agents into $0; a pool of always-on containers doesn't."
- **Demo + close.** $1 monthly hard cap; the agent loops; the next call is blocked at $1.00, not $1,000.

**Pitch angle:** "Your agent can spend your annual budget in a weekend. I'll show a pre-call budget gate that stops it mid-loop, and integer-cents accounting that stays honest under concurrency."
