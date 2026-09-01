# Presenter script: Talk 1: Running Untrusted Agent Code at Scale

**Slot:** 30–40 min + recorded demo. **Deck:** `slides/talk-1/`. Press **S** for speaker view (these notes are also embedded per slide).
**Spine:** structural, not conventional → the operational test is *impossible, not tedious* → the most structural boundary is a kernel the agent doesn't share. This is zero trust for agents.

**Time budget:** Act I (problem) 7 min · Act II (mechanisms) 18 min · Act III (demo + zero-trust + close) 12 min.

---

## Act I: the problem (~7 min)

**1 · Title.** "Everyone's shipping agents. I want to talk about the part nobody demos: how you run code you didn't write, at scale, without getting owned." One breath, then go.

**2 · Cold open A, the incident.** "June 2026. Meta's account-recovery bot changed a user's email and password. *It just needed to be asked.*" (Source: Malwarebytes.) Let the absurdity land before the next slide.

**3 · Cold open B, the lesson.** "Attackers ran a normal reset flow, told the bot to swap the email, drained the one-time codes, and took over accounts, a White House one, Sephora, a Space Force official. The bot wasn't hacked. It did exactly what it was told, with power it should never have had on its own." Sets the tone: we don't trust the agent's judgment on sensitive actions; enforce below it.

**4 · What is an agent.** Walk the loop: user/event → LLM → (proposes) → approve? → execute → tool → result → repeat, with memory underneath. Key line: "the moment it can call tools, it stops being an AI feature and becomes a code-execution system." Note the approval gate is on the act path on purpose.

**5 · Whose code is it.** Three sources: LLM-generated at runtime, third-party skills, customer-authored. The reframe: **the code's origin changed**, it's written at runtime and prompt-injected from a webhook. "One sentence now does what used to take a supply-chain compromise."

**6 · Prompts can't save you.** "A prompt is an instruction; it runs before the model misbehaves. A tool call is a syscall; once code runs, your prompt is a suggestion." Concrete proof: Chipotle's support bot got jailbroken into writing code; the analyst takeaway is literally our thesis, *"enforce scope at the product level, not just in the prompt."* (Anthropic's framework: LLMs can't reliably tell informational context from actionable instructions.)

**7 · The naive origin.** Original mithai (Python): a skill is a module imported into the engine, full host access, no sandbox. Fine for one trusted team; going multi-tenant broke every assumption. This is why we rewrote it in Go.

**8 · THESIS.** Slow down. "Isolation must be structural, not conventional, enforced by the layer below the agent: the crypto, the database key, the kernel." Then give them the take-home test (Anthropic's zero-trust framework): **"does this control make the attack impossible, or just tedious? Prefer removing a capability over throttling it."** Tell them to judge every defense in the next 18 min by that test.

---

## Act II: the mechanisms (~18 min, ~3 min each)

**9 · Threat model.** The table: five "what if the agent…" attacks, each grounded in engineer9's real tools, each with the structural control that stops it. "We assume the code is hostile and run it anyway, because nothing about the guarantee depends on the code being honest."

**10–11 · Attack 1 → secret theft.** Set up: Acme's agent holds Acme's AWS key; Globex shares the pool and one Postgres. Defense: the credential store is bound to `(workspace, agent)` at construction; per-credential Argon2id→AES-GCM. "You can't *name* another agent's secret. Leaking it isn't a bug to avoid, it's an operation that doesn't exist." Verdict: contained by the database key, not careful code.

**12–13 · Attack 2 → sandbox escape.** Agent writes a binary and execs it. Defense: Landlock makes the agent's dir writable but not executable; `/proc/self` only; a launcher applies it then execs the agent. "The kernel refuses the exec regardless of what the code does." **Honest beat:** "but it's still a shared kernel. Hold that thought, we'll hit its ceiling."

**14 · Attack 3 → runaway + honest gap.** Process-group isolation (`Setpgid`) + tree-kill confines a crash. Be honest: no per-agent cgroups quota yet, a tight loop can hog a core. "A talk that only lists wins is a sales pitch."

**15–16 · Attack 4 → token burn.** Pre-call budget gate: hard cap blocks, soft cap downgrades Opus→Haiku, checked before the call. "Blocked before a single token is spent." (Apply the test: a hard cap removes overspend; a rate limit only throttles it.)

**17–18 · Attack 5 → supply chain.** Skills ship via git webhook. Defenses: HMAC verify, reject `../` + symlinks, strip setuid (`& 0755`), size caps, atomic versioned symlink swap with instant rollback. "Verified, sandboxed, reversible."

**19 · Accountability.** The cross-cutting layer: a per-workspace SHA-256 hash chain, append-only, batched, partitioned. "Tamper with one row and the chain breaks. What did it do, can I prove it? Yes."

---

## Act III: demo, zero-trust, close (~12 min)

**20 · Demo (recorded).** Let a hostile agent try all five: read a neighbor's secret (fails), exec a planted binary (kernel denies), loop the budget (blocked), spoof a deploy (401 / rejected), and show every attempt in the audit trail. Narrate calmly; the failures are the point.

**21 · Rings recap.** The picture to remember: agent at the center, rings outward = kernel, crypto, database, framework, each enforced *below* the agent. Walk the legend by color.

**22 · Why not a container.** Namespaces change what a process sees, not what the kernel does. 457 syscalls reachable vs ~25 hypercalls to a separate-kernel micro-VM. "runc escapes land yearly. AWS doesn't consider containers a security boundary."

**23 · The boundary that holds.** Landlock hit the shared-kernel ceiling; the layer that holds doesn't share a kernel. Firecracker: ~125ms boot, 4ms restore, zero host escapes since 2018. The industry converged: e2b, Modal, Fly, Lambda, now Apple & Microsoft. "You can buy it."

**24 · We built zero trust for agents.** The payoff for a security room: walk the mapping table, each control we demoed *is* a zero-trust principle. "We didn't set out to build zero trust; we landed where NIST, OWASP, and Anthropic did." Drop the citation chips for credibility.

**25 · Tier self-assessment.** Be honest with the maturity model: Enterprise on isolation/audit/deploy; Foundation on secrets (the fix is short-lived, hardware-bound tokens); a real gap on input spotlighting. "Gaps, but rungs on a ladder, not a list of failures."

**26 · Close.** "The most structural boundary is a kernel the agent doesn't share. The goal was never to make the agent trustworthy. It's to make trust unnecessary." Beat of silence on the last line. Thanks + contact.

---

## 2-minute elevator pitch (word-for-word)
Use the version in `../talk-1-untrusted-code.md` (single take, no slides; land "make trust unnecessary" after a beat).
