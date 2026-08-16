# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Add DeepSeek model profiles: the default `deepseek_worker` remains bound to
  `deepseek-v4-flash`, while explicit `--model pro` configures
  `deepseek_pro_worker` for `deepseek-v4-pro`. Preflight, bridge metadata,
  installer, Doctor, verifier, manifest, and uninstall distinguish the profiles;
  automatic routing never selects Pro.
- Add isolated coverage for profile mapping, catalog fail-closed behavior,
  explicit Pro registration, Flash-default routing, lifecycle metadata, rollback,
  existing-directory permission preservation, and sanitized uninstall output
  (`65/65` local tests).
- Preserve pre-existing installer parent-directory modes and remove a newly
  created empty runtime directory on safe uninstall.
- Fix the macOS default bridge-root resolution used by the bridge CLI when no
  platform override is supplied, with regression coverage.
- Record a bounded DeepSeek V4 Flash maintainer E2E: explicit worker execution,
  non-sensitive fixture diagnosis, bridge completion/release, and main-thread
  review. The verifier remains `runtimeVerified: false`; this does not add V4
  Pro support, automatic routing, or a general public-installer claim.
- Record a DeepSeek V4 Pro worker-registration E2E: local preflight accepted the
  explicit Pro role and prepared a redacted bridge task, but the current Codex
  host registry rejected the role before dispatch. No provider request, tool
  call, worker result, model identity, or completed bridge was observed, so V4
  Pro remains an API-verified candidate rather than a runtime-support claim.
- Add community documentation index and demos to improve first-contact user onboarding.
  Includes `docs/demos/qwen-worker-demo.md`, `docs/demos/minimax-worker-demo.md`,
  `docs/demos/deepseek-worker-demo.md`, and `docs/demos/README.md`.
- Add bilingual onboarding-support FAQs:
  `docs/faq.md` and `docs/faq.zh-CN.md`.
- Add `ROADMAP.md` with conservative v0.4.x / v0.5 / later boundaries and
  `planned`, `under evaluation`, `runtime verification pending`, and
  `not committed` states.
- Add Documentation & Community navigation in English and Chinese README files and
  FAQ/Guide links in `CONTRIBUTING.md`.
- Record the documentation status updates in `docs/current-state.md` and
  `docs/tasks.md` to keep project-facing state consistent.

## [0.4.0-beta.2] - 2026-08-14

- Add a read-only `npm run doctor` command for macOS, Node.js, Codex,
  provider/model, Keychain-presence, fallback, installation, permissions, and
  local verification prerequisites. It does not mutate configuration, reveal
  credentials or private paths, use the network, or call a paid provider API.
- Add structured GitHub Issue Forms for bugs, provider compatibility requests,
  and feature requests, with explicit sensitive-data and private security
  reporting boundaries.
- Tighten the English and Chinese first-screen onboarding around Codex as the
  main agent, bounded lower-cost delegation, current provider evidence, Doctor,
  and the default dry-run workflow.
- Preserve all existing provider runtime evidence levels; this release does not
  claim new live provider or public-installer verification.

## [0.4.0-beta.1] - 2026-08-08

- Add Qwen3.7-Max as the third reviewed built-in provider pack.
- Verify Alibaba Model Studio Responses, SSE streaming, automatic function
  calls, Codex CLI, Codex Desktop subagent execution, and bridge release.
- Keep the Qwen capability boundary text-only and document that thinking mode
  rejects `tool_choice = "required"` while automatic tool choice works.
- Include `provider-packs.mjs` in the installed runtime so generic preflight can
  resolve the selected provider pack.

## [0.3.0-beta.1] - 2026-08-08

- Add MiniMax-M3 as the second reviewed built-in provider pack.
- Acquire the MiniMax Codex catalog from the official Markdown guide as inert
  text, restrict the installed catalog to text input, and preserve the exact
  case-sensitive API model ID.
- Add provider-specific Keychain auth, a `minimax_worker` agent definition,
  isolated installer tests, and live API/Codex CLI verification records.
- Verify a real Codex Desktop `minimax_worker` task through the owner-only
  compatibility bridge, including successful bridge completion and release.

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
