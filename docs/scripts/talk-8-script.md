# Presenter script: Talk 8: Why Containers Aren't Enough for Untrusted Agents

**Slot:** 30 min (companion to Talk 1). **Deck:** `slides/talk-8/`.
**Spine:** a container is a packaging tool, not a security boundary for hostile code; the boundary that holds doesn't share a kernel. Zero-trust design test: does it make escape *impossible* or just *tedious*? Maps to the isolation maturity tiers (sandboxed-exec = Enterprise, hardware isolation = Advanced).
**Time budget:** problem 8 · the record + spectrum 12 · architectures + convergence 8 · decision 2.

- **Title.** "Choosing an isolation boundary that matches the threat."
- **What is an agent.** Loop slide; standard payoff.
- **Thesis.** "The boundary that holds doesn't share a kernel. A container is a packaging tool; for code that wants out, it's not a security boundary." The test: impossible, or just tedious?
- **The reflex (attack).** "'Just run it in a container.' Right answer for code you wrote; wrong boundary for LLM-generated, prompt-injected code. Namespaces change what a process *sees*, not what the kernel *does*."
- **One kernel, 457 doors (attack).** 457 syscalls reachable from a container (Docker blocks ~49) vs ~25 KVM hypercalls to a separate-kernel micro-VM. "seccomp throttles the shared kernel; a separate kernel removes it." (Speaker note: a web server uses ~40; an agent might call any of the 457, so you can't pre-build a profile for "anything.")
- **The escape record.** CVE timeline: 2019-5736, 2020-15257, 2022-0811 (cr8escape), 2024-21626 (Leaky Vessels), 2025 runc ×3. "AWS doesn't consider containers a security boundary."
- **Copy Fail (figure).** CVE-2026-31431, a 732-byte exploit; containers (Daytona) didn't hold; every separate-kernel architecture did. "The proof in production."
- **Four boundaries (table).** runc (shared kernel, ~457, *not a boundary*) → gVisor (userspace kernel, 274/350, **Enterprise**) → microVM (separate kernel, ~25, **Advanced**) → full VM (**Advanced**). Tiers per Anthropic's zero-trust isolation guidance. "The question at each step: who's in your trust boundary?"
- **Three architectures (figure).** Firecracker (own kernel, zero escapes since 2018), gVisor (kernel in Go), Cloud Hypervisor (own kernel + GPU). "Three teams, three exits from the shared kernel."
- **CoCo (Confidential Containers).** When the host isn't in your trust boundary: Kata + SEV-SNP/TDX adds encrypted memory + attestation. Honest cost: specific hardware, limited regions, attestation infra, ~500-VM density, and it still doesn't stop the agent's own prompt-injected code. "Choose it when you don't trust the host; otherwise a plain micro-VM is enough."
- **The industry converged.** Cloud (e2b, Modal, Fly, Lambda, Bedrock), Apple (`containerization`), Microsoft (MXC). "When AWS, Google, Apple, and Microsoft all pick the same boundary, that's the signal."
- **Close.** "Own the host and trust the code? A container is fine. Running code the LLM wrote at runtime? Don't share a kernel."

**Pitch angle:** "When someone says 'just run the agent in a container,' they've picked a packaging tool and called it a security boundary. I'll show exactly where it leaks, and how to pick a boundary that matches what you're defending against."
