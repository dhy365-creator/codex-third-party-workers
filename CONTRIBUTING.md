# Contributing

Thanks for considering a contribution. This is a small, unofficial,
macOS-only beta; keep changes minimal and aligned with the project's scope.

## Scope

- macOS only. Do not add Linux or Windows-specific code paths.
- Node.js `>=20`, standard library only. No third-party runtime dependencies.
- Text, code, and local validation only. No image, audio, video, desktop, or
  browser handling.
- CLI behavior: dry-run by default; changes require an explicit `--apply`.
- DeepSeek V4 Flash is the default fallback. V4 Pro uses a separate,
  explicit-only Custom Agent profile and must never be auto-routed or described
  as runtime verified without model-specific evidence.
- Custom Agent Host identity comes from the TOML `name` field; do not
  represent a routing request or policy list as Host registration.
- Add providers only as reviewed built-in pack definitions with deterministic
  tests. Do not add arbitrary remote pack or executable manifest loading.
- A new pack must pin its HTTPS metadata origin, model identity, catalog policy,
  Keychain service, supported capabilities, and Responses API compatibility.

## Development

1. Use Node.js `>=20` (standard library only, so no install step is required).
2. Run tests with `npm test` (`node --test`).
3. Keep each change small and focused, and match existing conventions.
4. Update `docs/current-state.md` and `docs/tasks.md` when durable project
   facts change.
5. Never commit secrets, `.env` files, Keychain contents, or task payloads.

## Filing issues

Use the matching Issue Form:

- [Report a bug](https://github.com/dhy365-creator/codex-third-party-subagents/issues/new?template=bug_report.yml)
- [Request a provider](https://github.com/dhy365-creator/codex-third-party-subagents/issues/new?template=provider-compatibility.yml)
- [Propose a feature](https://github.com/dhy365-creator/codex-third-party-subagents/issues/new?template=feature_request.yml)

To [report a security issue](SECURITY.md), do not open a public issue. Use the
private reporting channel described in the security policy.

## Community docs

- [FAQ (English)](docs/faq.md)
- [FAQ（简体中文）](docs/faq.zh-CN.md)
- [Demos](docs/demos/README.md)
- [Roadmap](ROADMAP.md)
- [Provider compatibility matrix](docs/provider-compatibility.md)
- [Provider compatibility request form](https://github.com/dhy365-creator/codex-third-party-subagents/issues/new?template=provider-compatibility.yml)

## Commit conventions

- One logical change per commit, with a short imperative summary.
- Prefix metadata/docs changes with `docs:` and behavior changes with `feat:`
  or `fix:` as applicable.

## Review

- Verify that the GitHub Actions workflow stays read-only and secret-free.
- Confirm documentation claims match implementation; do not describe planned
  capabilities as finished.
