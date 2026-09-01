# Presenter script: Talk 5: Deploying Code You Didn't Write

**Slot:** 30 min. **Deck:** `slides/talk-5/`.
**Spine:** agents update constantly via webhooks from sources you don't control; the deploy pipeline is an attack surface. Treat every push as hostile: verify, sanitize, make it atomic. Zero-trust: config integrity + recovery.
**Time budget:** problem 7 · defenses 13 · demo 5.

- **Title.** "Your agents get new code constantly, and most of it arrives through a webhook."
- **What is an agent.** Loop slide; payoff: "new skills ship constantly, often via git webhook from sources you don't fully control."
- **Thesis.** "Treat every push as hostile until verified. A deploy pipeline is an entry point: authenticate it, sanitize it, make it atomic so a bad deploy can't half-land."
- **The pipeline is the attack surface (attack).** 30+ MCP CVEs in 60 days; a prompt-injection-poisoned npm package got ~4,000 installs in 8 hours. "Spoof the webhook, smuggle a `../` or a symlink, plant a setuid binary, and you own the box through the front door."
- **Defense, verify, then sanitize.** Five doors, five locks: HMAC-SHA256 verify (GitHub/GitLab/generic), 5-min replay-dedup, reject `../` + symlinks/hardlinks, strip setuid (`& 0755`), size/file-count caps, optional IP allowlist. "A bad signature never reaches extraction; a bad path never reaches disk."
- **Defense, atomic + reversible.** Write `versions/v42` in full, then one atomic symlink swap flips `current → v42`; rollback = flip back. "A crash mid-deploy leaves the live symlink untouched. The agent never runs a half-written skill." (Zero-trust config integrity → signed configs is the Advanced next rung.)
- **Demo + close.** Bad HMAC → 401; tar with `../` and a symlink → rejected; after deploy, the setuid bit is gone.

**Pitch angle:** "Every webhook-driven deploy is a door. I'll try five ways to sneak malicious code through ours, and show the check that stops each."
