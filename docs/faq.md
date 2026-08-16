# Frequently Asked Questions

**English** | [简体中文](faq.zh-CN.md)

## Project

### Is this an OpenAI product?

No.

This repository is an unofficial, community OSS project. It is not endorsed by
OpenAI and is not a replacement for Codex itself.

### Does this replace Codex?

No.

Codex is still the main agent. Third-party workers only handle bounded text/code
tasks and return results for Codex review and final synthesis.

### Why use this if I can call models directly?

The project is useful if you want to keep Codex orchestration, review, and
routing while moving suitable tasks to potentially lower-cost provider APIs for
bounded execution. It does not guarantee savings.

## Cost and quota

### Does this give me unlimited Codex usage?

No.

Your Codex subscription and quotas still apply to OpenAI usage.

### Does this bypass OpenAI limits?

No.

Routing is bounded and policy-aware, and it does not expand or alter OpenAI
limits.

### Does it guarantee fixed savings?

No.

Cost depends on selected provider, task type, token usage, pricing, and routing.

## Security and privacy

### Where are API keys stored?

In macOS Keychain only. This repository does not store provider credentials.

### Does the installer print API keys?

No.

The installer rejects `--api-key` and never logs credential values.

### Is task content sent to third-party providers?

Yes. When a provider route is selected, the bounded delegated task and request
context needed for worker execution are sent to that provider. Do not delegate
credentials, private content, or material you are not authorized to send.

You should review provider privacy, retention, pricing, and regional rules before
using any key.

### Does this modify main Codex configuration?

No.

The installer does not rewrite the main `~/.codex/config.toml`, primary model,
provider, or authentication. With explicit `--apply`, it manages the selected
pack files, helper artifacts, manifest/backups, and one bounded AGENTS block.

## Compatibility

### Which providers are currently supported?

Current built-in packs and evidence are:

- DeepSeek V4 Flash: built-in and isolated-tested; public-installer live runtime
  verification pending.
- DeepSeek V4 Pro: API-verified candidate only; it is not a built-in pack or a
  Desktop-runtime verified model.
- MiniMax-M3: built-in and runtime verified for the recorded API, CLI, and
  Desktop worker path.
- Qwen3.7-Max: built-in and runtime verified for the recorded API, CLI, and
  Desktop worker path.

Candidates and gateway listings are not supported packs. See the complete
[compatibility matrix](provider-compatibility.md).

### How are provider claims defined?

- **Built-in pack**: implemented and verified in isolation.
- **Runtime-verified**: real Codex subagent run and human-reviewed result.
- **Candidate**: protocol and docs alignment found, runtime verification pending.
- **API-verified candidate**: a limited direct API probe also passed, but no
  installer, Codex Desktop, bridge-release, or human-review claim follows.
- **Incompatible**: missing protocol or required translator constraints.

### Why isn't model X supported?

This project verifies strict boundaries:

- Responses protocol compatibility
- text/code capability boundary
- tool-call loop behavior
- offline validation and bridge safety
- verified subagent handoff and release

Availability changes by model docs, pricing, and provider behavior.

### Can I install DeepSeek V4 Pro now?

No. The built-in DeepSeek pack still selects V4 Flash only. V4 Pro has native
Responses API and limited direct API evidence, but it remains a candidate until
explicit model selection, installer coverage, and a real Codex Desktop path are
separately validated. See the [sanitized probe](validation/deepseek-v4-pro-probe-2026-08-16.md).

### How can I request another provider?

Open the [Provider compatibility request form](https://github.com/dhy365-creator/codex-third-party-workers/issues/new?template=provider-compatibility.yml).

## Installation

### What should I run first?

Run `npm run doctor` first.

It is read-only and checks the OS, Node version, Codex environment,
provider/model pairing, Keychain item presence, fallback hints, installation
state, permissions, and verify prerequisites before any `--apply`.

### What does Doctor change?

Nothing. `doctor` is read-only.

## Doctor PASS / WARN / BLOCKED

### Why does Doctor show WARN or BLOCKED?

The three values are triage states:

- `PASS`: checked state meets expected boundaries.
- `WARN`: attention is needed, but the finding is not necessarily blocking.
- `BLOCKED`: hard stop needed before proceeding safely.

## Runtime and limits

### What is `runtimeVerified`?

`runtimeVerified` is `false` until a real live subagent task has been run and
reviewed in a real environment.

Configured installers can still be healthy while `runtimeVerified` is false.
