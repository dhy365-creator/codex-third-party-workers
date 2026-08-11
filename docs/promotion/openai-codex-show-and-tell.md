# OpenAI Codex Show and tell — approved publication checkpoint

Status: **NEEDS USER ACTION — approved, not published**

Target: `openai/codex` → Discussions → `Show and tell`

Approval date: `2026-08-11`

Spacing checkpoint:

- Previous account post: `2026-08-11 01:30 Asia/Shanghai`
- Recommended interval: approximately 48 hours
- Recommended earliest publication: `2026-08-13 01:30 Asia/Shanghai`
- Publication trigger: the user sends the exact message `publish`

Before publication, recheck the live category rules, current-account duplicates,
near-duplicate recent Discussions, repository/Release availability, evidence
links, and image URL. Publish only this one Discussion.

## Title

Codex Third-Party Workers: bounded third-party model subagents while Codex stays in control

## Body

I built **Codex Third-Party Workers**, an unofficial macOS public beta that lets
Codex delegate bounded tasks to selected third-party and Chinese model APIs
without replacing the main OpenAI model, provider, or authentication flow.

The core idea is simple: Codex stays the main agent. A reviewed provider worker
handles one suitable text, code, research-synthesis, or local-validation subtask,
then Codex reviews and synthesizes the result.

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

### Current provider evidence

- **Runtime verified: MiniMax-M3** — Responses API, SSE streaming, two-turn
  Function Calling, Codex CLI, Codex Desktop subagent, and bridge release.
- **Runtime verified: Qwen3.7-Max** — Responses API, SSE streaming, automatic
  Function Calling, Codex CLI, Codex Desktop subagent, and bridge release.
  The current Qwen boundary is text-only.
- **Built in, runtime validation pending: DeepSeek V4 Flash** — isolated tests
  pass, but public-installer runtime verification is still pending.
- **Candidates requiring real API validation: StepFun and Volcano Ark** — these
  are not included or claimed as supported packs.
- **Gateway / partial candidates: Baidu Qianfan and Tencent Cloud TokenHub** —
  gateway compatibility does not prove direct model-vendor compatibility.
- **Currently incompatible direct paths: Kimi K3, Zhipu GLM, legacy Tencent
  Hunyuan, and SiliconFlow** under this project's direct Responses contract.

Public-installer `--apply` and `verify` acceptance remain separate pending checks
for a real user environment.

![Sanitized verified Codex Desktop run](https://raw.githubusercontent.com/dhy365-creator/codex-third-party-workers/v0.4.0-beta.1/assets/terminal-demo.png)

The current beta has **37/37 isolated tests passing**, with public GitHub Actions
covering installer, routing, provider catalog, bridge, uninstall, and
secret-safety behavior.

Security and scope are intentionally narrow:

- macOS Keychain-only API credentials
- dry-run installation by default
- no modification of the main `~/.codex/config.toml`
- owner-only single-slot task bridge
- redacted completed/failed archives
- no browser, desktop, image, audio, video, MCP, or Computer Use delegation

Repository:
https://github.com/dhy365-creator/codex-third-party-workers

Public beta release:
https://github.com/dhy365-creator/codex-third-party-workers/releases/tag/v0.4.0-beta.1

Provider compatibility matrix:
https://github.com/dhy365-creator/codex-third-party-workers/blob/v0.4.0-beta.1/docs/provider-compatibility.md

I would especially value feedback on:

1. the bounded delegation and preflight model;
2. what evidence should be required before marking another provider runtime
   verified; and
3. how to make provider status and installation boundaries clearer for
   non-expert Codex users.

This is not an OpenAI product or a Codex replacement. It is not endorsed by
OpenAI or any listed provider, does not claim compatibility with every model,
and does not promise a fixed cost-saving percentage.

## Publication checklist

- [x] Owned repository and `v0.4.0-beta.1` Release are public.
- [x] Title and body are approved by the user.
- [x] `How it works` uses one correctly closed fenced code block.
- [x] Terminal Demo uses the immutable `v0.4.0-beta.1` public URL.
- [x] No local absolute macOS home path appears in the Discussion body.
- [ ] Approximately 48 hours have elapsed since Discussion #37852.
- [ ] User sends the exact publication trigger `publish`.
- [ ] Live rules, duplicates, repository, Release, evidence, and image are
  rechecked immediately before publication.
