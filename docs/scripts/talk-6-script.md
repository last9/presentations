# Presenter script: Talk 6: Approvals as a First-Class Control

**Slot:** 30 min (compresses to lightning). **Deck:** `slides/talk-6/`.
**Spine:** "add a human step" is easy advice and hard engineering. Make approval a declared, per-tool policy the engine enforces. This is OWASP's **least agency** (zero trust for agents): bound what each tool can do, how often, and where.
**Time budget:** why-a-gate 8 · the controls 14 · identity + demo 8.

- **Title.** "Human-in-the-loop that scales past 200 prompts a day."
- **What is an agent.** Loop slide; payoff (lime): "that `approve?` step is today's talk, how to make it precise and durable."
- **Thesis.** "Approval is a declared policy, not ad-hoc code. Each tool declares how much human it needs; the engine enforces it; the agent can't talk its way past it." Name it: OWASP **least agency**, bound what each tool can do, how often, and where.
- **Why a gate (attack), "it obeys, even attackers."** Meta's account-recovery bot changed emails/passwords on request; attackers asked and took over accounts (a White House one, Sephora, a Space Force official). That's the **confused deputy**: a trusted agent wielding power it shouldn't have alone. And via prompt injection, one poisoned GitHub issue is enough to do the asking. (Willison's lethal trifecta: private data + untrusted content + an exfil path, agents have all three by design.)
- **The naive fix backfires (attack).** "Approve everything" trains people to click yes; 200 prompts/day → rubber-stamping. "A gate everyone ignores is not a gate."
- **Defense, declarative levels.** `none / approve / confirm / dynamic` declared per tool. Irreversible ops use *static* `confirm`, never `dynamic`, so a resolver bug can't downgrade a delete. Note: approvals gate the *action*; input **spotlighting** hardens the *prompt*, a complementary control we don't do yet (honest gap).
- **Defense, scale without fatigue.** Memoize decisions by input-hash; auto-promote after 3 clean approvals (`approval_auto_promote: 3`); review/revoke any pattern. Two locks: engineer9 can stop an EC2 instance (approval) but the IAM role *omits* `TerminateInstances` and is tag-scoped. "If the gate fails, IAM denies; if IAM is loose, the gate asks."
- **Identity is a boundary (the "I'm mithai" incident).** The prompt never named the agent, so it introduced itself by the framework's name. Not a break-out, the model followed the prompt exactly. Fix: explicit identity + an `llm_judge` eval that fails on the wrong name.
- **Demo + close.** A `confirm`-level delete blocks for type-to-confirm; a read repeated 3× auto-promotes and stops asking.

**Pitch angle:** "Human-in-the-loop sounds safe until your team rubber-stamps 200 prompts a day. I'll show how to make approvals precise, dynamic, and memoized, and pair them with IAM so when one control fails the other holds."
