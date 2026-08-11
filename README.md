# Codex Third-Party Workers

[![CI](https://github.com/dhy365-creator/codex-third-party-workers/actions/workflows/test.yml/badge.svg)](https://github.com/dhy365-creator/codex-third-party-workers/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8a7dff.svg)](LICENSE)
[![macOS](https://img.shields.io/badge/platform-macOS-45dfff.svg)](#requirements)

**English** | [简体中文](README.zh-CN.md)

Use third-party and Chinese model APIs as **bounded Codex subagents** while
keeping the main Codex thread on OpenAI.

![Codex Third-Party Workers architecture](assets/hero-social-preview.png)

> Public beta `0.4.0-beta.1`. Unofficial and macOS-only. Not endorsed by
> OpenAI, DeepSeek, MiniMax, or Alibaba Cloud.

## Codex stays the main agent

- The repository adds reviewed provider workers; it does not replace the main
  OpenAI model, provider, authentication, or `~/.codex/config.toml`.
- Preflight routing sends only a bounded, suitable task to one provider worker.
- Codex receives the worker result and remains responsible for review,
  synthesis, and final acceptance.

### Why use it?

- Delegate suitable work to a lower-cost provider without moving the whole
  Codex session.
- Use provider APIs that are easier to access in your region.
- Mix model strengths while keeping one Codex-led workflow.

### What it is not

This is not an OpenAI product, a Codex replacement, a compatibility claim for
every model, or proof that a cheaper model will produce a better result.

## Quick start

Clone the repository, store one provider key in macOS Keychain, then inspect the
default dry-run. The example below uses DeepSeek; use `minimax` or `qwen` for the
other built-in packs.

```sh
git clone https://github.com/dhy365-creator/codex-third-party-workers.git
cd codex-third-party-workers

/usr/bin/security add-generic-password \
  -a "$(id -un)" -s codex-deepseek-api-key -U -w

node scripts/install.mjs \
  --provider deepseek \
  --plan plus \
  --spark-available false \
  --luna-available true \
  --threshold 50 \
  --confirm-main-preserved \
  --consent-data
```

Review the plan before repeating it with `--apply`. Restart Codex Desktop, then
run `node scripts/verify.mjs`. See the [complete install guide](#requirements)
before applying changes.

## Verified Codex Desktop run

The transcript below is a sanitized record of the real Qwen3.7-Max Desktop
subagent smoke test completed on 2026-08-08. It shows dispatch, the expected
worker response, bridge completion, and release; no API key or private task text
is included.

![Sanitized verified Codex Desktop provider worker transcript](assets/terminal-demo.png)

MiniMax-M3 and Qwen3.7-Max have passed real API, CLI, and Codex Desktop checks.
DeepSeek V4 Flash is built in and isolated-tested; public-installer runtime
verification is still pending.

## Compatibility at a glance

![Provider compatibility summary](assets/provider-compatibility.png)

| Direct provider path | Current evidence |
| --- | --- |
| DeepSeek V4 Flash | Built-in and isolated-tested; public-installer runtime pending |
| MiniMax-M3 | Built-in; Desktop runtime verified |
| Alibaba Model Studio Qwen3.7-Max | Built-in; Desktop runtime verified |
| StepFun Responses models | Candidate; not runtime tested |
| Volcano Ark Responses models | Candidate; account model/Endpoint ID required |
| Qianfan / Tencent TokenHub | Gateway candidates; not proof of direct vendor compatibility |
| Direct Kimi K3 / Zhipu GLM / legacy Hunyuan / SiliconFlow | Not currently compatible with this repository's direct Responses contract |

See the evidence, source links, and exact boundaries in the
[Chinese-provider compatibility matrix](docs/provider-compatibility.md).

## How it works

```mermaid
flowchart LR
    U["User task"] --> C["Codex main agent\nOpenAI model stays primary"]
    C --> P["Preflight routing\nquota · suitability · readiness"]
    P -->|"OpenAI path"| O["Spark or Luna worker"]
    P -->|"provider path"| B["Owner-only single-slot task bridge"]
    B --> W["Selected provider worker"]
    W --> R["Provider Responses API"]
    R --> A["Redacted completed/failed archive"]
    O --> S["Codex review and synthesis"]
    A --> S
```

The provider bridge accepts one owner-only task at a time, rejects unsafe file
states, and redacts task data before archival. The main thread still makes the
final decision.

## Validation and security

![Validation and security proof](assets/validation-proof.png)

- `37/37` isolated local tests pass on the productized baseline.
- Public GitHub Actions passed on baseline commit `0262e8e`.
- API keys are read from macOS Keychain, never accepted through `--api-key`.
- The bridge uses owner-only permissions and redacted atomic archives.
- Dry-run is the default; file changes require explicit `--apply`.

Read the [security policy](SECURITY.md) and [architecture](docs/architecture.md)
for the full threat boundary.

## Scope and boundaries

- Provider API use is billed separately from a Codex subscription.
- Review each provider's privacy, pricing, data-retention, and regional terms;
  provider behavior and compatibility can change independently of this project.
- Delegated task text is sent to the selected provider. Do not delegate
  credentials, private content, or material you are not authorized to send.
- Supported work is text, code, research synthesis, and local validation only.
  Images, files-as-multimodal-input, audio, video, browser control, desktop
  control, MCP, and computer use are out of scope.
- DeepSeek supports `deepseek-v4-flash` only and rejects V4 Pro. MiniMax supports
  `MiniMax-M3` only. Qwen supports the text-only `qwen3.7-max` model on Alibaba
  Model Studio pay-as-you-go.
- A configured `luna_worker` is expected when Luna is selected as the OpenAI
  fallback. This repository does not install or alter Luna.
- Codex Desktop does not guarantee native interception of every collaboration
  call. The preflight is a policy-assisted guardrail that the main agent must
  execute before every new spawn or follow-up.

## Routing policy

The account plan supplies defaults, but routing uses live quota data rather than
plan name alone.

| State | Selected worker |
| --- | --- |
| Spark has live quota | `spark-worker` |
| Spark unavailable; general quota above or equal to threshold | `luna_worker` |
| Spark unavailable; general quota below threshold; task suitable and bridge free | provider fallback (default: `deepseek_worker`) |
| Quota lookup fails | An available OpenAI worker; never provider fallback |
| Provider unsuitable/unavailable/bridge busy | `luna_worker` when available |

Suggested defaults:

- Plus: no Spark, Luna available, provider threshold `50%`.
- Pro with Spark: Spark first, Luna next, provider threshold `10%`.

## Requirements

- macOS and Codex Desktop with custom subagent support.
- Node.js `>=20`.
- Provider credentials in macOS Keychain.
- A working `luna_worker` if Luna fallback is enabled.

Downloading or cloning the repository is only the first step. Before the worker
can run, you must store the provider API key in Keychain, review a dry-run,
apply the configuration, restart Codex Desktop, and verify the installation.

## 0. Download the repository

```sh
git clone https://github.com/dhy365-creator/codex-third-party-workers.git
cd codex-third-party-workers
```

You can also download the GitHub ZIP and run the following commands from the
extracted directory.

## 1. Store the API key safely

Run in Terminal. Keep `-w` at the end so macOS prompts without putting key in
shell history:

Choose the service matching the pack you will install:

```sh
# DeepSeek
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-deepseek-api-key -U -w

# MiniMax
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-minimax-api-key -U -w

# Qwen / Alibaba Model Studio
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-qwen-api-key -U -w
```

The installer only verifies that this Keychain item exists. It never accepts
`--api-key` and never writes secrets.

## 2. Review a dry-run

Dry-run is the default. It fetches the official provider catalog source as inert
text, extracts the supported catalog format, validates it, and keeps a reduced
text-only catalog for the selected provider pack.

Plus example:

```sh
node scripts/install.mjs \
  --provider deepseek \
  --plan plus \
  --spark-available false \
  --luna-available true \
  --threshold 50 \
  --confirm-main-preserved \
  --consent-data
```

Pro example:

```sh
node scripts/install.mjs \
  --provider deepseek \
  --plan pro \
  --spark-available true \
  --luna-available true \
  --threshold 10 \
  --confirm-main-preserved \
  --consent-data
```

MiniMax and Qwen use the same routing options with `--provider minimax` or
`--provider qwen`. The installer
manages one selected provider fallback at a time; changing `--provider` changes
the actively routed provider pack without changing the main OpenAI thread.

For an offline installation, add
`--catalog-source /absolute/path/to/catalog-or-setup-script`.

## 3. Apply and verify

After reviewing the dry-run output, repeat with `--apply`, restart Codex Desktop,
and run:

```sh
node scripts/verify.mjs
```

Verification distinguishes two states:

- `configured: true`: installed files, permissions, hashes, catalog bounds,
  manifest markers, and Keychain presence are valid.
- `runtimeVerified: false`: expected until a real Codex subagent task is run and
  reviewed.

### Optional: support the project

After installation and verification succeed, a GitHub Star is appreciated if
the project is useful to you. It is completely optional and is never required
for installation or usage: [codex-third-party-workers](https://github.com/dhy365-creator/codex-third-party-workers).

## Uninstall

Preview first, then apply:

```sh
node scripts/uninstall.mjs
node scripts/uninstall.mjs --apply
```

Uninstall removes only the exact managed AGENTS block and hash-matching files.
If a managed file changed, it reports a conflict and performs no partial
removal. Pre-existing files are restored from owner-only backups when safe. Keychain
credentials and bridge archives are intentionally retained.

## Installed files

- `~/.codex/agents/<provider>_worker.toml`
- `~/.codex/model-catalogs/<provider-model>.json`
- `~/.codex/bin/subagent-preflight.mjs`
- `~/.codex/bin/codex-third-party-worker-bridge.mjs`
- `~/.codex/lib/codex-third-party-workers/`
- `~/.codex/codex-third-party-workers.json`
- `~/.codex/codex-third-party-workers-install.json`
- `~/.codex/codex-third-party-workers-backups/`
- one bounded AGENTS block in `~/.codex/AGENTS.md`

The official catalog/prompt are acquired at install time and are not vendored in
this repository.

## Development

```sh
npm test
```

Tests use temporary fake homes and injected Keychain, quota, and network
implementations. They do not access real API keys, Keychain, Codex quota,
`~/.codex`, or network.

### Adding another provider pack

This release provides an extensible provider-pack core, not a claim that every
third-party model already works. DeepSeek V4 Flash, MiniMax-M3, and Qwen3.7-Max
are built-in, isolated-tested packs. MiniMax-M3 and Qwen3.7-Max have also passed
real Codex Desktop subagent smoke tests; public-installer apply/verify status is
tracked separately.
New providers are added as reviewed code in `src/provider-packs.mjs` with tests;
the installer does not load arbitrary remote pack manifests.

A candidate provider must offer a Codex-compatible Responses API, command-backed
credential retrieval, a pinned HTTPS metadata origin, an explicit model/catalog
policy, bounded text/code capabilities, and deterministic offline tests. See
[architecture](docs/architecture.md) and [contributing](CONTRIBUTING.md).

See [configuration-zh](docs/configuration-zh.md),
[architecture](docs/architecture.md), [troubleshooting](docs/troubleshooting.md),
[Chinese-provider compatibility matrix](docs/provider-compatibility.md),
[copyable Codex install prompt](docs/CODEX_INSTALL_PROMPT.zh-CN.md), and
[security policy](SECURITY.md).

## Official references

- [OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [OpenAI: Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [DeepSeek: Codex integration](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex/)
- [DeepSeek: Responses API compatibility](https://api-docs.deepseek.com/zh-cn/guides/responses_api/)
- [MiniMax: M3 in Codex](https://platform.minimaxi.com/docs/token-plan/codex)
- [MiniMax: Responses API](https://platform.minimaxi.com/docs/api-reference/responses-create)
- [Alibaba Model Studio: Codex](https://help.aliyun.com/zh/model-studio/codex)
- [Alibaba Model Studio: Qwen3.7-Max](https://help.aliyun.com/zh/model-studio/qwen3-7-max)

## License

MIT. See [LICENSE](LICENSE).
