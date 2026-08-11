# v0.4.0-beta.1 — prepared release notes

Status: **draft only — no tag or GitHub Release created**

## Codex Third-Party Workers public beta

This beta introduces a general provider-pack architecture for running selected
third-party model APIs as bounded Codex subagents while preserving the main
OpenAI Codex thread.

### Included provider packs

- DeepSeek V4 Flash
- MiniMax-M3
- Alibaba Model Studio Qwen3.7-Max

MiniMax-M3 and Qwen3.7-Max have passed real API, CLI, and Codex Desktop subagent
smoke tests. DeepSeek V4 Flash is built in and isolated-tested; public-installer
runtime verification remains pending.

### Safety boundaries

- macOS Keychain-only credentials
- dry-run installation by default
- no modification of the main `~/.codex/config.toml`
- single owner-only task bridge
- redacted completed/failed archives
- bounded text, code, research-synthesis, and local-validation tasks only

### Verification

- `37/37` isolated local tests
- public GitHub Actions workflow
- MiniMax and Qwen Responses/SSE/function-calling evidence
- CLI and Codex Desktop bridge completion evidence

This is an unofficial macOS-only public beta. Provider usage is billed and
governed independently by each provider.
