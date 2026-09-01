# Talk 7, Building a Multi-Tenant Agent Platform in Go

**Subtitle:** Patterns for Structural Isolation
**Track:** Architecture / Go engineering · **Format:** 30–40 min (demo optional, code walk)
**Deck:** [`../talk-7/`](../talk-7/)

## Abstract
A field guide to the Go engineering behind a multi-tenant agent platform. We cover the
architecture rules that made isolation tractable: interfaces-first with constructor
injection, **no global state** (no package-level vars beyond sentinel errors and metric
descriptors), one-concept-per-package, and the process-spawn model where each agent is
its own OS process. We dig into the concurrency design, an engine pool in a `sync.Map`
with idle eviction (30m TTL, 5m reaper), `golang.org/x/sync/semaphore` plus plain
goroutines instead of pool libraries, per-channel mutexes, and how these conventions,
not heroics, keep tenants from leaking into each other. Less about AI, more about the
disciplined Go that makes "structural isolation" a property of the codebase rather than
a hope. We contrast it with the original Python `mithai`, where a skill was a module
imported into the engine with full host access, the design that *forced* the rewrite.

## Who it's for
Go engineers; backend/platform engineers building multi-tenant services.

## Key takeaways
1. No-global-state as an isolation enabler.
2. Construction-time binding of tenant context.
3. A concurrency toolkit (sync.Map pool, semaphores, per-key mutexes, idle reaper) without heavy frameworks.
4. How architectural rules encode security properties.
5. Zero trust at the code layer: "architected for breach from day one", isolation as a property you can't *express* your way around.

## Slide outline (after the 2 mandatory slides, ~12)
1. The problem: one binary, many tenants, no leaks.
2. The Python origin: a skill imported into the engine → why it couldn't scale safely.
3. The four architecture rules (interfaces-first, no globals, one-concept-per-package, constructor injection).
4. Why no-global-state is a *security* property.
5. The process-spawn model and what it buys.
6. The engine pool in `sync.Map`.
7. Idle eviction (TTL + reaper) and why.
8. Concurrency: `x/sync/semaphore` + goroutines, no pool libs.
9. Per-channel mutex for ordering.
10. Construction-time tenant binding (the credential `Store` as the canonical example).
11. Error handling + sentinel errors per package; table-driven tests + testcontainers, no mocks where real impls work.
12. Takeaways.

*Source:* `CLAUDE.md`, `docs/multi-tenancy.md`, `internal/procmgr/`, `internal/credential/store.go`.

## Pitch angle
"I'll show you how a handful of boring Go rules, no global state, constructor
injection, one concept per package, quietly become the thing that keeps one tenant's
agent from touching another's. Architecture as security."
