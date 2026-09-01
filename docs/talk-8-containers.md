# Talk 8, Why Containers Aren't Enough for Untrusted Agents

**Subtitle:** Choosing an Isolation Boundary for Untrusted Agent Code
**Track:** Security / infra · **Format:** 30 min (companion to Talk 1)
**Deck:** [`../talk-8/`](../talk-8/)

## Abstract
"Just run it in a container" is the reflexive answer to isolating agent code, and
it's not wrong, it's *insufficient*. A container is a Linux process with namespaces and
cgroups: great for packaging and resource limits, but it **shares the host kernel**.
For code you trust, that's fine. For an agent running LLM-generated or third-party code
with an attacker's intent, a single kernel exploit crosses every container boundary on
the box. This talk lays out the isolation spectrum honestly, plain processes →
namespaces/containers → kernel LSMs like **Landlock** (what we use today) → **KVM
micro-VMs** with a separate guest kernel per tenant → bare metal, and where each sits
on the trust/overhead curve. We share why we started with process + Landlock (density,
cold-start, ops weight), what that buys and what it doesn't, and why the honest endgame
for hostile multi-tenant workloads is a hardware-virtualized boundary (Firecracker,
Kata), the same choice Lambda and Fly.io made. We also cover **Confidential Containers
(CoCo)**, Kata plus hardware confidential computing (AMD SEV-SNP, Intel TDX), which
adds encrypted memory and remote attestation so even the host or cloud operator can't
read the agent's data in use: the strongest form of "keep the data with you," with real
trade-offs we name.

## Who it's for
Platform/infra/security engineers deciding how to sandbox untrusted or semi-trusted
workloads; anyone about to put "we'll just containerize it" in a design doc.

## Key takeaways
1. Containers are a resource/packaging boundary, not a security boundary against hostile code.
2. The full isolation spectrum and the trust-vs-overhead trade-off at each step.
3. Where Landlock and seccomp help, and where they stop.
4. When the right answer is a KVM micro-VM, and how cold-start/density objections are now solved.
5. Where Confidential Containers (CoCo) fit, with honest pros/cons.
6. A decision framework keyed to your threat model and data-residency needs.
7. How the spectrum maps to the zero-trust isolation tiers: sandboxed-exec (gVisor) = **Enterprise**, hardware isolation (microVM / SEV-TDX) = **Advanced**; "impossible, not tedious."

## CoCo, pros / cons (the dedicated slide)
- **Pros:** VM-grade isolation **plus** memory encryption → data-in-use protected even
  from a compromised/curious host; remote **attestation** lets a tenant verify what's
  running before releasing secrets; container/Kubernetes-native UX; strongest answer to
  "keep my data confidential even from the platform."
- **Cons:** needs specific hardware (SEV-SNP / TDX) with limited cloud/region
  availability; performance/memory overhead; attestation infrastructure is complex
  (key brokers, verifiers); larger TCB and less mature tooling/debugging than plain
  micro-VMs; pointless if you already control the host.
- **Choose it when:** you must run untrusted code **and** the host itself is outside
  your trust boundary (regulated data on third-party infra). Otherwise a plain
  micro-VM is usually enough.

## Slide outline (after the 2 mandatory slides, ~13)
1. "Just containerize it", the default answer.
2. What a container actually is (namespaces + cgroups + shared kernel).
3. The threat: one kernel CVE crosses every container.
4. The isolation spectrum on a trust/overhead axis, key question: *who is in your trust boundary?*
5. seccomp + Landlock: meaningful hardening, still one kernel.
6. What we ship today (process + Landlock) and why we started there.
7. Where that leaves us exposed (shared-kernel gap, cgroups gap).
8. KVM micro-VMs: separate guest kernel, hardware-enforced, clean quotas, data-residency unit.
9. The old objections (cold start, density) and how Firecracker/Kata answer them.
10. Who runs this in prod (Lambda, Fly.io, modern CI sandboxes).
11. Confidential Containers (CoCo): encrypted memory + attestation; the pros/cons slide.
12. **Demo/diagram:** "exec a planted binary" against a container (host kernel) vs a micro-VM (separate kernel).
13. Decision framework (own the host? trust the host? data residency? → boundary) + takeaways.

*Source:* `internal/sandbox/`, `docs/multi-tenancy.md`, gaps doc; KVM/microVM/CoCo content is industry-standard, framed as the recommended base (not our current stack).

## Pitch angle
"When someone says 'just run the agent in a container,' they've picked a packaging tool
and called it a security boundary. I'll show you exactly where that boundary leaks for
untrusted code, and how to choose an isolation level that matches what you're actually
defending against."
