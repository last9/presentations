# Talk 6, Approvals as a First-Class Control

**Subtitle:** Human-in-the-Loop That Scales
**Track:** Human-in-the-loop / agent safety · **Format:** 30 min (compresses to lightning)
**Deck:** [`../talk-6/`](../talk-6/)

## Abstract
"Just add a human approval step" is easy advice and hard engineering, naively it
means every action blocks on a person, and approval fatigue sets in fast. We made
approval a declarative, per-tool property of the skill manifest: each tool declares
`none` / `approve` / `confirm` / `dynamic`, and `dynamic` lets the skill decide at
runtime from the actual arguments (small change = auto, production = ask). Decisions
are memoized as **approval patterns** keyed by a hash of the tool input, so "approve
all similar calls" works and operators can review or revoke delegated permissions
later. Capabilities are pinned in version-controlled config, agents can't escalate at
runtime. We ground it in `engineer9`: it can `change_instance_state` on EC2 (approval
+ tag-scoped IAM that deliberately omits `TerminateInstances`), and it auto-promotes
routine actions after 3 clean approvals. We also tell the "I'm mithai" incident, a
reminder that **agent identity is itself a boundary**, and the failure was the prompt
being followed correctly, not broken.

## Who it's for
Builders designing agent safety/oversight; product engineers fighting approval fatigue.

## Key takeaways
1. Approval as declarative per-tool policy, not ad-hoc code.
2. Dynamic / context-aware approval (`resolve_human` / `ResolveHuman`).
3. Memoized approval patterns for scale + revocability (and auto-promote thresholds).
4. Capabilities pinned in a manifest → no runtime escalation.
5. Defense-in-depth: approval gate **and** least-privilege IAM, each catching the other's failure.
6. This is OWASP **least agency** (zero trust for agents): bound what each tool can do, how often, and where, motivated by the Meta confused-deputy incident (a bot that changed emails/passwords just by being asked).

## Slide outline (after the 2 mandatory slides, ~11)
1. Why "add a human step" backfires (200 prompts/day).
2. The manifest: tools + required creds + approval level.
3. The four levels and when to use each (irreversible ops → static `confirm`, never `dynamic`).
4. `dynamic` approval: `ResolveHuman(tool, input, ctx)` (prod vs staging).
5. Approval-pattern memoization (input-signature hash, approved/denied counts).
6. Auto-promote after N clean approvals (engineer9: `approval_auto_promote: 3`).
7. Review & revoke via API.
8. Defense in depth: engineer9's tag-scoped IAM that omits `TerminateInstances`.
9. The "I'm mithai" incident → agent identity as a boundary; eval regression test.
10. **Demo:** a `confirm` destructive tool blocks; a memoized pattern auto-approves.
11. Takeaways.

*Source:* `internal/skill/types.go`, `internal/manifest/manifest.go`,
`internal/api/approval_handler.go`; `engineer9` config + `docs/security/approvals.mdx`.

## Pitch angle
"Human-in-the-loop sounds safe until your team is rubber-stamping 200 prompts a day.
I'll show you how to make approvals precise, dynamic, and memoized, and pair them with
IAM so that even when one control fails, the other still holds."
