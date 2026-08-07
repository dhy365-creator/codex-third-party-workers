# codex-deepseek-worker

> Unpublished `0.1.0-beta.1`. Unofficial, macOS-only, and not endorsed by
> OpenAI or DeepSeek.

Run DeepSeek V4 Flash as a bounded Codex Desktop **subagent fallback** without
replacing the main OpenAI model. The installer adds a custom
`deepseek_worker`, a live quota preflight, and a single-slot task bridge. It
does not modify `~/.codex/config.toml`, the main model, provider, or auth.

## Read this first

- DeepSeek API usage is billed separately from a Codex subscription.
- Delegated task text is sent to DeepSeek. Do not delegate credentials,
  private data, or content you are not allowed to send to a third party.
- Only text, code, research synthesis, and local validation are supported.
  Images, files-as-multimodal-input, audio, video, browser control, desktop
  control, MCP, and computer use are out of scope.
- This beta supports `deepseek-v4-flash` only. It rejects V4 Pro.
- A configured `luna_worker` is expected when Luna is selected as the OpenAI
  fallback. This repository does not install or alter Luna.
- Codex Desktop does not guarantee native interception of every collaboration
  call. The installed preflight is a policy-assisted guardrail that the main
  agent must run before each spawn or follow-up.

## Routing policy

The account plan supplies defaults, but routing uses live quota data rather
than the plan name alone.

| State | Selected worker |
| --- | --- |
| Spark has live quota | `spark-worker` |
| Spark unavailable; general quota above or equal to threshold | `luna_worker` |
| Spark unavailable; general quota below threshold; task suitable and bridge free | `deepseek_worker` |
| Quota lookup fails | An available OpenAI worker; never DeepSeek |
| DeepSeek unsuitable, unavailable, or bridge busy | `luna_worker` when available |

Suggested defaults:

- Plus: no Spark, Luna available, DeepSeek threshold `50%`.
- Pro with Spark: Spark first, Luna next, DeepSeek threshold `10%`.

## Requirements

- macOS and Codex Desktop with custom subagent support.
- Node.js `>=20`.
- A DeepSeek API key with available balance.
- A working `luna_worker` if Luna fallback is enabled.

## 1. Store the API key safely

Run this in Terminal. Keep `-w` at the end so macOS prompts without placing the
key in shell history or ordinary process arguments:

```sh
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-deepseek-api-key -U -w
```

The installer only verifies that this Keychain item exists. It never accepts
an `--api-key` argument and never writes the key to a file, manifest, log, or
Git.

## 2. Review a dry-run

Dry-run is the default. It fetches the official DeepSeek Codex setup script as
inert text, extracts its `CODEX_MODELS_JSON` section, validates it, and keeps
only V4 Flash. The script itself is never executed.

Plus example:

```sh
node scripts/install.mjs \
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
  --plan pro \
  --spark-available true \
  --luna-available true \
  --threshold 10 \
  --confirm-main-preserved \
  --consent-data
```

For an offline installation, add
`--catalog-source /absolute/path/to/catalog-or-setup-script`.

## 3. Apply and verify

After reviewing the dry-run, repeat the same command with `--apply`, restart
Codex Desktop, then run:

```sh
node scripts/verify.mjs
```

Verification separates two states:

- `configured: true`: installed files, hashes, permissions, Flash-only
  catalog, marked AGENTS block, and Keychain item are valid.
- `runtimeVerified: false`: expected until a real Codex subagent task is run
  and reviewed. Local file checks are not presented as runtime success.

## Uninstall

Preview first, then apply:

```sh
node scripts/uninstall.mjs
node scripts/uninstall.mjs --apply
```

Uninstall removes only the exact managed AGENTS block and hash-matching files.
If a managed file changed, it reports a conflict and performs no partial
removal. Pre-existing files are restored from owner-only backups when safe.
The Keychain credential and bridge archives are intentionally retained.

## What is installed

- `~/.codex/agents/deepseek_worker.toml`
- `~/.codex/model-catalogs/deepseek-v4-flash.json`
- `~/.codex/bin/subagent-preflight.mjs`
- `~/.codex/bin/codex-deepseek-worker-bridge.mjs`
- `~/.codex/lib/codex-deepseek-worker/`
- `~/.codex/codex-deepseek-worker.json`
- one bounded marker block in `~/.codex/AGENTS.md`
- an owner-only install manifest and backups

The official catalog and its model prompt are acquired at install time and are
not vendored in this repository.

## Development

```sh
npm test
```

Tests use temporary fake homes and injected Keychain, quota, and network
implementations. They do not access the real API key, Keychain, Codex quota,
`~/.codex`, or network.

See [configuration-zh](docs/configuration-zh.md),
[architecture](docs/architecture.md), [troubleshooting](docs/troubleshooting.md),
[copyable Codex install prompt](docs/CODEX_INSTALL_PROMPT.zh-CN.md), and
[security policy](SECURITY.md).

Official references:

- [DeepSeek: Codex integration](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex/)
- [DeepSeek: Responses API compatibility](https://api-docs.deepseek.com/zh-cn/guides/responses_api/)

## License

MIT. See [LICENSE](LICENSE).
