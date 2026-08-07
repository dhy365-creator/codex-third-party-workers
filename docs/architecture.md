# Architecture

## Boundaries

- Main Codex model/provider/auth are never changed.
- DeepSeek is a child worker for bounded text and code work only.
- macOS Keychain is the only credential source.
- Dry-run is the default; file mutation requires `--apply`.
- Official model metadata is acquired at install time, never vendored here.

## Installed components

### Agent definition

`~/.codex/agents/deepseek_worker.toml` selects `deepseek-v4-flash`, defines an
agent-scoped DeepSeek Responses provider, and asks Codex to obtain the bearer
token through `/usr/bin/security find-generic-password`. The main
`~/.codex/config.toml` is outside the installer write set.

### Runtime catalog

The installer downloads the official DeepSeek Codex setup script over HTTPS
as inert text. It enforces a size limit, extracts the exact
`CODEX_MODELS_JSON` heredoc, parses JSON, selects one text-only
`deepseek-v4-flash` entry, rejects V4 Pro, and writes an owner-only runtime
catalog. It never executes the downloaded shell script.

A local catalog or saved setup script can be used for offline installation.

### Live preflight

`~/.codex/bin/subagent-preflight.mjs` reads Codex rate limits through the local
Codex app-server, verifies installed DeepSeek files and the Keychain item, and
applies the routing policy. Spark entitlement and live Spark remaining quota
are separate inputs. If quota lookup fails, routing stays on an OpenAI worker.

Before DeepSeek is selected, preflight atomically creates a single task bridge.
If that slot is busy or invalid, it safely returns Luna when available.

This is a policy-assisted guardrail. Codex Desktop collaboration calls are not
guaranteed to be natively intercepted, so the marked global AGENTS rules tell
the main agent to run preflight before every new spawn or follow-up.

### Task bridge

The UID-derived bridge root is normally:

```text
/private/tmp/codex-deepseek-task-bridge-<uid>/
```

`active/` is mode `0700`; `active/task.json` is `0600`. The task validates:

- schema version and `pending`/`running` status;
- task name and normalized final basename;
- absolute working directory and non-empty task message;
- regular-file/directory type, ownership, mode, and absence of symlinks.

Only one task may be active. Completion or failure first replaces the active
task body with `[REDACTED]` values for `message` and `cwd`, then atomically
renames the directory to a unique `completed-*` or `failed-*` archive. Archives
are never deleted by this project.

### Install manifest and uninstall

Every managed file records its path, installed hash, mode, whether it existed
before installation, and an owner-only backup when needed. Reinstallation
keeps the original backup when the managed file is unchanged.

Uninstall validates all actions before writing anything. It removes only exact
hash matches, restores validated backups, and removes only the exact marked
AGENTS block. Any conflict stops the whole uninstall plan. Keychain entries and
bridge archives remain untouched.

## Data flow

```text
Main OpenAI thread
  -> live preflight (Spark quota, general quota, suitability, credential)
  -> Spark / Luna, or owner-only DeepSeek bridge
  -> deepseek_worker reads one bounded task
  -> local code/text work and tests
  -> redacted atomic archive
  -> main thread reviews the result
```

## Verification levels

- `configured`: files, permissions, hashes, catalog, marker, and Keychain are
  valid locally.
- `runtimeVerified`: deliberately not claimed by the verifier. It requires a
  real Codex task after restarting the app.
- `userAccepted`: separate from both local checks and runtime execution.
