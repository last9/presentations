# Presenter script: Talk 7: Building a Multi-Tenant Agent Platform in Go

**Slot:** 30–40 min (Track-1 / Go-community fit; demo optional, code walk). **Deck:** `slides/talk-7/`.
**Spine:** isolation as a *property of the codebase*, not a runtime hope. A handful of boring Go rules make cross-tenant access something you can't *express*. Zero-trust: this is "architected for breach from day one" at the code layer.
**Time budget:** problem 6 · rules + patterns 16 · testing + close 8.

- **Title.** "How a handful of boring Go rules quietly keep one tenant's agent from touching another's."
- **What is an agent.** Loop slide; payoff (neutral): "the platform's job, run hundreds of these for different tenants on one binary, with no leaks."
- **Thesis.** "Isolation is a codebase property, not a runtime hope. The rules make cross-tenant access something you can't *express*, not something you remember to prevent."
- **The Python original (attack).** A skill was a module imported into the engine: full filesystem, env, network, shared memory. "Great for one trusted team, fatal for many tenants." Going multi-tenant forced the Go rewrite.
- **Four boring rules.** ① interfaces-first + constructor injection; ② **no global state** (only sentinel errors + metric descriptors); ③ one-concept-per-package; ④ process-spawn model, each agent its own OS process. "No global state is a *security* property, there's no shared singleton for one tenant's data to leak through."
- **Construction-time binding.** The credential `Store` is the canonical example: workspace + agent baked in, so no method reaches another tenant's data. Engine pool in `sync.Map` with idle eviction (30m TTL, 5m reaper). Concurrency: `x/sync/semaphore` + plain goroutines + per-channel mutex, no pool libraries.
- **Testing.** Table-driven + testcontainers against a real Postgres; no mocks where a real implementation works. "The isolation we test is the isolation we ship." Sentinel errors per package, `fmt.Errorf("...: %w", err)`.
- **Close.** "The rules look like style. They're load-bearing: they make a whole class of cross-tenant bug unwriteable. Architecture as security."

**Pitch angle:** "No global state, constructor injection, one concept per package, I'll show how these become the thing that keeps tenants apart. Architecture as security."
