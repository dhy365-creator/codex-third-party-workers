# AGENTS.md

## Project scope

- Unofficial, macOS-only, unpublished open-source beta for a Codex Desktop
  fallback subagent backed by DeepSeek V4 Flash.
- Text, code, and local validation only. No image, audio, video, desktop, or
  browser handling. No V4 Pro support.
- Node.js `>=20`, standard library only. No third-party runtime dependencies.

## Rules for agents working here

- Do not hardcode, commit, or log secrets. API keys live in the macOS Keychain
  and are read at runtime only.
- Do not execute the official DeepSeek setup script. The model catalog and
  model prompt are retrieved at install time (documented, never executed) with a
  local catalog-source override; do not vendor the official catalog or prompt.
- CLI changes must keep dry-run as the default; writes require an explicit
  `--apply`.
- The task bridge allows exactly one active DeepSeek task. Active slot and task
  file are owner-only (`0700` / `0600`), reject symlinks, and are atomically
  archived to `completed-*` or `failed-*`. Never overwrite or delete archives.
- Desktop preflight is a policy-assisted guardrail, not guaranteed native
  automatic interception. Document it as defense-in-depth.
- Preserve unrelated local changes. Make minimal, scoped diffs.
- Keep files small: JS/TS under 300 lines, docs concise.
- Update `docs/current-state.md` and `docs/tasks.md` on durable changes.
  Documented capabilities must match the implementation.
- GitHub Actions workflows must use read-only permissions and no secrets.

## Layout

- `src/`, `scripts/`, `tests/` — implementation and generated-file templates.
- `docs/` — architecture, configuration (中文), troubleshooting, state, tasks.
- `.github/workflows/test.yml` — read-only test workflow.

## Validation

- Run `npm test` (`node --test`) after changes.
- Confirm `package.json` metadata (version, license, engines) matches releases.
