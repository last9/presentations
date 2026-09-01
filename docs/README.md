# Conference talk portfolio, secure agent deployment

A reusable set of **8 standalone talks** drawn from one body of work: building
a multi-tenant platform that runs other people's AI-agent code
(LLM-generated, third-party skills, customer-authored) on shared infrastructure.

Each talk is independently pitchable to a different venue/track. All eight have a
Reveal.js deck in [`../talk-1/`](../talk-1/) through [`../talk-8/`](../talk-8/),
plus submission-ready abstracts, slide outlines, and presenter scripts here.

---

## The narrative arc (true, and it sells the thesis)

1. **`mithai`** (original, Python), a pragmatic ChatOps agent framework. A *skill*
   is two files (`prompt.md` + `tools.py`) imported straight into the engine
   process. **Zero isolation:** a skill runs with full host access, filesystem, env
   vars, network, the engine's memory. Perfect for one trusted team.
2. **Going multi-tenant broke every assumption.** A buggy or hostile skill could
   crash the engine, read another tenant's secrets, or burn unbounded spend.
3. **`multi-mithai`** (Go rewrite), the platform. Isolation as a *structural*
   property: enforced by the kernel, the crypto, and the database key, never by
   trusting agent code. This is the source of every control in these talks.
4. **`engineer9`**, a real agent on the platform: a "senior staff engineer" in
   Slack that queries AWS, files Linear issues, posts messages, runs scheduled
   tasks. It supplies the concrete "what if the agent did X" stakes, including a
   real production incident (it once introduced itself as **"I'm mithai"** because
   its system prompt never named it).

**The spine:** *Tenant isolation is structural, not conventional, every guarantee
is enforced by the layer below the agent, never by trusting its code to behave.*

---

## The portfolio at a glance

| # | Talk | Track fit | Format |
|---|------|-----------|--------|
| 1 | [Running Untrusted Agent Code at Scale](talk-1-untrusted-code.md) | Security & safety in agentic systems (flagship) | 30–40 min + demo |
| 2 | [Secrets That Even Your Own Code Can't Steal](talk-2-secrets.md) | Security / cryptography | 30 min / lightning |
| 3 | [Stopping the $50k Agent](talk-3-finops.md) | Cost optimization / ops | 30 min |
| 4 | [Tamper-Evident Agents](talk-4-audit.md) | Governance / SRE | 30 min |
| 5 | [Deploying Code You Didn't Write](talk-5-deploy.md) | Supply-chain / platform eng | 30 min |
| 6 | [Approvals as a First-Class Control](talk-6-approvals.md) | Human-in-the-loop / agent safety | 30 min / lightning |
| 7 | [Building a Multi-Tenant Agent Platform in Go](talk-7-go-platform.md) | Architecture / Go | 30–40 min |
| 8 | [Why Containers Aren't Enough](talk-8-containers.md) | Security / infra | 30 min |

Every deck opens with two **mandatory shared slides**: *"What is an agent?"* (an LLM
in a loop that can take actions, keep state, act semi-autonomously → it's a
code-execution system) and the *structural-not-conventional* thesis.

---

## Shared factual backbone (every claim traces here; all verified in `multi-mithai`)

| Layer | Mechanism | File |
|---|---|---|
| Process isolation | One OS process/agent; process group via `Setpgid`; SIGTERM→SIGKILL tree kill; auto-restart | `internal/procmgr/manager.go` |
| Filesystem sandbox | Landlock LSM (ABI v5); agent dir writable but **not executable**; `/proc/self` only; strict/warn | `internal/sandbox/` |
| Credential compartmentalization | AES-256-GCM + Argon2id, per-credential salt; `Store` bound to `(workspace, agent)` at construction | `internal/credential/store.go` |
| Deploy supply-chain | HMAC-SHA256 verify; path-traversal + symlink rejection; setuid strip `&0755`; atomic symlink swap | `internal/gitdeploy/`, `internal/api/deploy.go` |
| Cost / blast radius | Atomic per-(ws,agent,model) micro-USD counters; pre-call soft/hard budget caps | `internal/cost/{tracker,budget}.go` |
| Capability constraint | Skill manifest declares tools + creds; per-tool approval `none/approve/confirm/dynamic`; memoized patterns | `internal/skill/types.go`, `internal/api/approval_handler.go` |
| Accountability | Append-only audit, per-workspace SHA-256 hash chain; batched, partitioned | `internal/o11y/audit.go` |
| Noisy-neighbor | Per-agent rate limit (10rps/burst20); global semaphore (100); 5-min replay dedup | `internal/agenthook/handler.go` |
| AuthN/Z | OIDC JWT (workspace_id) + `mk_` API keys (SHA-256); constant-time admin compare | `internal/auth/`, `internal/api/workspace.go` |
| Observability | 12 Prometheus metrics; request_id exemplars (not workspace_id) | `internal/o11y/metrics.go` |

**Honest gaps (the "what's still hard" slide):** no per-agent cgroups v2 quotas;
prod overlayfs exec stubbed; no master-key rotation; no per-workspace disk quota;
Landlock is Linux-only. → These motivate the KVM/micro-VM "buy the base layer" close.

---

## Zero-Trust framing (the unifying meta-frame)

We independently built **zero trust for agents**. The portfolio adopts that framing for
external validation. The sharpest borrow is the design test: **"does this make the attack
impossible, or just tedious?"**, the operational form of *structural, not conventional*.
*Structural = removes a capability = impossible; conventional = adds friction = tedious;
prefer removing a capability over throttling it.* Vocabulary adopted: **blast radius**,
**least agency** (OWASP), **assume breach**, and the **Foundation → Enterprise → Advanced**
maturity tiers.

| What we built | Zero-trust principle | Honest tier | Appears in |
|---|---|---|---|
| structural, not conventional | "impossible, not tedious" · assume breach | philosophy | all |
| separate kernel / micro-VM (destination) | hardware isolation (SEV/TDX, microVM, attestation) | **Advanced** (target) | T1, T8 |
| Landlock + process-group isolation | sandboxed execution | **Enterprise** | T1, T8 |
| per-agent crypto, construction-bound | least privilege · agent identity | **Foundation** (→ short-lived/hardware) | T1, T2 |
| skill manifest + approval levels | least agency (OWASP) + RBAC deny-by-default | Foundation→Enterprise | T1, T6 |
| pre-call budget gate | resource-exhaustion / loop-amplification defense | named threat | T1, T3 |
| hash-chained audit | immutable audit trails w/ integrity verification | **Enterprise** | T1, T4 |
| verified atomic deploy + rollback | config integrity + recovery | Foundation→Enterprise | T1, T5 |
| *(not yet)* short-lived tokens · signed configs · spotlighting · anomaly detection | identity/integrity/input/monitoring | **roadmap** | T1 tier slide, T2, T6 |

**References (cite as external validation, not compliance):** Anthropic, *Zero Trust for AI
Agents* (2026); NIST SP 800-207; OWASP *least agency* / Top 10 for agentic AI; CISA Zero
Trust Maturity Model; US federal Zero Trust mandate by 2027.

**Presenter scripts:** detailed slide-by-slide speaking scripts live in
[`scripts/`](scripts/) (one `talk-N-script.md` per talk, with time budgets); the same
notes are embedded as reveal `<aside class="notes">` (press **S** in any deck for speaker view).

**Accuracy rule:** present implemented controls as built; present **KVM micro-VMs /
Confidential Containers as the recommended ready-made base, not our current prod stack.**

---

## Source repos referenced

- `multi-mithai`, the Go platform (all implemented controls)
- `mithai`, original Python framework (the no-isolation origin story)
- `engineer9`, production agent (real stakes, the "I'm mithai" incident, least-privilege IAM)
