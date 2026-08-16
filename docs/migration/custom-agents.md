# Custom Agents architecture migration

Status: implemented configuration migration; controlled Flash and explicit-only
Pro runtime evidence is recorded per model and remains deliberately bounded.

## Why this changed

Older project wording used a routing request's `requestedAgent` value and the
preflight role list as though they created a Codex Host identity. They do not.
They are this repository's policy inputs only.

Current Codex custom-agent documentation defines the Host identity in a TOML
definition: the `name` field is authoritative, while the filename is the
normal discovery convention. The supported scopes are user
`~/.codex/agents/*.toml` and project `.codex/agents/*.toml`. See the official
[Subagents documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

## Host audit — 2026-08-16

- Local Codex CLI: `0.147.0`.
- `multi_agent` reports enabled; `multi_agent_v2` reports disabled.
- The current CLI exposes no direct `--agent` execution flag.
- The already-open Host session discovered `deepseek_worker` but had not loaded
  the new `deepseek_pro_worker` definition. A fresh Host session discovered and
  ran both identities, confirming that agent inventory changes require reload.

Conclusion: the architecture is **Mode A — native Custom Agent definitions**.
The project writes valid Host definitions and treats the policy router as a
separate defense-in-depth layer. It never claims that a router allowlist itself
registers an agent.

## Identity and routing contract

| Custom Agent name | Provider | Model | Routing rule |
| --- | --- | --- | --- |
| `deepseek_worker` | DeepSeek | `deepseek-v4-flash` | Default DeepSeek fallback only when policy prerequisites pass |
| `deepseek_pro_worker` | DeepSeek | `deepseek-v4-pro` | Explicit-only; never selected by automatic fallback |
| `minimax_worker` | MiniMax | `MiniMax-M3` | Pack-selected |
| `qwen_worker` | Alibaba Model Studio | `qwen3.7-max` | Pack-selected |

Each generated TOML requires `name`, `description`, and
`developer_instructions`, pins its model/provider tuple, and uses command-backed
macOS Keychain auth. Unsupported legacy handoff keys such as `complete` and
`fail` are rejected by local validation rather than emitted into the TOML.

The bridge carries the configured tuple so the worker can refuse a mismatched
task. That is configuration metadata, not proof that a live Host/provider
runtime returned the same metadata.

Before preparing a provider bridge task, preflight also inspects the task
project's Custom Agent layers from the Git root through the requested working
directory. The presence of any project-scoped TOML definition, or an unreadable
agent layer, keeps an OpenAI worker and writes no bridge task. This conservative
fail-closed boundary prevents a higher-precedence project definition from
silently replacing the user-scoped provider identity.

## Installer migration

The installer remains dry-run by default. Dry-run checks Host capability,
expected user/project identities, duplicate names, and legacy candidates without
writing files or calling a paid provider API.

`--apply` is blocked when:

- the Custom Agent Host capability is not confirmed;
- an expected identity is invalid, duplicated, mismatched, or shadowed by a
  project-scoped definition;
- a matching existing user definition has not been explicitly adopted.

For a matching legacy user definition, first review dry-run output, then use:

```sh
node scripts/install.mjs ... --migrate-legacy --apply
```

Migration records an owner-only backup before replacing the managed definition.
Uninstall validates hashes before mutation and restores that backup; it never
removes Keychain credentials or historical bridge archives.

The installer does not edit `~/.codex/config.toml`, Host feature flags, the
primary model/provider/authentication, or a project `.codex/agents` directory.
After an apply, restart or begin a new Codex session so the Host can rediscover
the user-scoped definition.

## Doctor and verify

`npm run doctor` is read-only. It checks the Codex version/capability state,
`multi_agent`/`multi_agent_v2`, expected definition identity, missing or
duplicated names, project-scope conflicts, legacy-migration state, install
state, and ordinary provider prerequisites. It performs no write, no paid API
call, and never reads a Keychain secret value.

`verify` returns per-agent local configuration evidence containing provider,
agent name, model, and a check timestamp. It keeps
`hostRuntimeMetadata: null` and `runtimeVerified: false` because it does not
ingest or independently accept external runtime records. Flash evidence never
verifies Pro, and Pro evidence never verifies Flash.

## Runtime evidence boundary

Fresh Host sessions completed the same read-only coding fixture through
`deepseek_worker -> deepseek-v4-flash` and
`deepseek_pro_worker -> deepseek-v4-pro`. Each child reproduced the failing
tests, identified the exact one-line fix, used tools, completed and released its
owner-only bridge, and was independently reviewed by the main thread. Sanitized
session metadata recorded the expected provider/model tuple for each run.

This is controlled maintainer Level 3 evidence for those named paths. It does
not supply provider-dashboard attribution, public-installer validation in an
unrelated environment, broad task reliability, or independent user acceptance;
it does not change `runtimeVerified: false`. Pro remains explicit-only, with no
automatic Flash/Pro switching. See the
[sanitized runtime record](../validation/deepseek-custom-subagents-runtime-e2e-2026-08-16.md).
