# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- No changes yet.

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
