# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0-beta.1] - 2026-08-08

- Add MiniMax-M3 as the second reviewed built-in provider pack.
- Acquire the MiniMax Codex catalog from the official Markdown guide as inert
  text, restrict the installed catalog to text input, and preserve the exact
  case-sensitive API model ID.
- Add provider-specific Keychain auth, a `minimax_worker` agent definition,
  isolated installer tests, and live API/Codex CLI verification records.
- Keep Codex Desktop subagent runtime verification separate until the app is
  restarted and a real delegated task is reviewed.

## [0.2.0-beta.1] - 2026-08-08

- Refactor core flow to provider-pack architecture in `codex-third-party-workers`:
  - generic provider discovery, provider metadata, and runtime path resolution;
  - catalog acquisition/reduction policy decoupled from DeepSeek-specific
    constants;
  - preflight/routing/verifier/install hooks accept provider pack selection with
    backward-compatible `providerSuitable`/`deepseekSuitable` input semantics;
  - runtime bridge and bridge CLI now use shared alias-aware root resolution.
- Require a provider host validator for automatic catalog acquisition and
  validate every destination in a bounded manual redirect chain.
- Publish the generic provider-pack beta with DeepSeek V4 Flash as the first
  built-in pack.

## [0.1.0-beta.1] - 2026-08-06

- Initial unpublished macOS beta implementation.
- Added README disclosures: unofficial project, macOS-only beta, separate
  DeepSeek billing, text/code-only scope, main OpenAI model unchanged,
  dry-run default with explicit `--apply`, and no V4 Pro support.
- Documented runtime model-catalog retrieval from the official DeepSeek setup
  script (never executed) with a local catalog-source override.
- Documented the single-slot DeepSeek task bridge and the policy-assisted
  preflight guardrail (not guaranteed native interception).
- Added dry-run/apply install, local verification, and conflict-safe uninstall
  commands with owner-only backups and a bounded global AGENTS marker.
- Added live Spark/general quota routing, Keychain readiness checks, and safe
  Luna fallback when DeepSeek is unsuitable, unavailable, or bridge-busy.
- Added atomic bridge archives that redact task messages and working paths.
- Added offline fake-home tests for catalog, routing, preflight, install,
  idempotency, verification, uninstall, permissions, and sensitive-data rules.
- Added a read-only GitHub Actions test workflow with no secrets.
