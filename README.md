# codex-third-party-workers

**English** | [简体中文](README.zh-CN.md)

> Public beta `0.3.0-beta.1`. Unofficial, macOS-only, and not endorsed by
> OpenAI, DeepSeek, or MiniMax.

Run configurable provider-pack fallback workers for Codex Desktop without
replacing the primary OpenAI model/provider/auth stack. Built-in packs are
**DeepSeek V4 Flash** and **MiniMax-M3**; DeepSeek remains the default.

## Read this first

- Delegated fallback providers are billed separately from a Codex subscription.
- Delegated task text is sent to the selected fallback provider. Do not delegate
  credentials, private content, or material you are not authorized to send.
- Supported work is text, code, research synthesis, and local validation only.
  Images, files-as-multimodal-input, audio, video, browser control, desktop
  control, MCP, and computer use are out of scope.
- The DeepSeek pack supports `deepseek-v4-flash` only and rejects V4 Pro. The
  MiniMax pack supports `MiniMax-M3` only.
- A configured `luna_worker` is expected when Luna is selected as the OpenAI
  fallback. This repository does not install or alter Luna.
- Codex Desktop does not guarantee native interception of every collaboration call.
  The installed preflight script is a policy-assisted guardrail that the main
  agent must execute before each `spawn_agent` / `followup_task`.

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

MiniMax uses the same routing options with `--provider minimax`. The installer
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
third-party model already works. DeepSeek V4 Flash and MiniMax-M3 are built-in,
isolated-tested packs; public-installer runtime verification is tracked separately.
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

## License

MIT. See [LICENSE](LICENSE).
