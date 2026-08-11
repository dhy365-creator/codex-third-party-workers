# OpenAI Codex Show and tell — prepared draft

Status: **USER ACTION REQUIRED — not published**

Target: `openai/codex` → Discussions → `Show and tell`

## Title

Codex Third-Party Workers: bounded third-party model subagents while Codex stays in control

## Body

I built **Codex Third-Party Workers**, an unofficial macOS public beta that lets
Codex delegate bounded tasks to selected third-party model APIs without replacing
the main OpenAI model, provider, or authentication flow.

The use case is simple: keep Codex as the main agent, but let a reviewed provider
worker handle a suitable text, code, research-synthesis, or local-validation
subtask. Codex receives the result and remains responsible for review and final
synthesis.

### How it works

```text
Codex main agent
  → preflight routing (quota, suitability, readiness)
  → owner-only single-task bridge
  → selected provider worker
  → external Responses API
  → redacted completion archive
  → Codex review and synthesis
```

The current built-in provider packs are:

- **DeepSeek V4 Flash** — built in and isolated-tested; public-installer runtime
  verification is still pending.
- **MiniMax-M3** — real API, streaming, function calling, CLI, and Codex Desktop
  subagent path verified.
- **Qwen3.7-Max** — real API, streaming, automatic function calling, CLI, and
  Codex Desktop subagent path verified.

![Sanitized verified Codex Desktop run](https://github.com/dhy365-creator/codex-third-party-workers/raw/main/assets/terminal-demo.png)

Security and scope are intentionally narrow: macOS Keychain-only credentials,
dry-run by default, owner-only single-slot task bridge, redacted archives, and no
browser/desktop/multimodal delegation. Provider privacy, pricing, and regional
policies still apply independently.

Repository:
https://github.com/dhy365-creator/codex-third-party-workers

I would especially value feedback on:

1. the bounded delegation and preflight model;
2. what evidence should be required before marking another provider runtime
   verified; and
3. how to make the installation safer and clearer for non-expert Codex users.

This is not an OpenAI product or a Codex replacement, and it does not claim that
every provider or model is compatible.

## Publication checklist

- [ ] Owned-repository PR merged and branch CI passed.
- [ ] Image URL loads from `main`.
- [ ] GitHub repository description/topics updated.
- [ ] User explicitly confirms publication.
- [ ] Post is published only once; no cross-post comments are added automatically.
