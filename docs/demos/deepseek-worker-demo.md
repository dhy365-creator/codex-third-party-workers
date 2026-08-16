# DeepSeek Demo — Controlled Maintainer E2E

## Status

DeepSeek V4 Flash is a built-in provider pack and passes isolated tests. A
controlled maintainer E2E also completed on 2026-08-16.

- **Classification: Level 3 for one bounded maintainer path.** An explicit
  `deepseek_worker` performed a non-sensitive fixture diagnostic; the bridge
  completed and released; the main thread reviewed the result.
- `runtimeVerified=false` remains the verifier output. It does not automatically
  promote a single controlled observation into a general runtime claim.
- `configured=true` only covers local files, permissions, hashes, catalog
  bounds, markers, and Keychain presence; it is not user acceptance.

## Evidence source

- `README.md` / `README.zh-CN.md` provider status section
- `docs/provider-compatibility.md` and `docs/provider-compatibility.zh-CN.md`
- [Sanitized controlled runtime E2E record](../validation/deepseek-runtime-e2e-2026-08-16.md)
- [V4 Pro direct Codex subagent audit](../validation/deepseek-v4-pro-probe-2026-08-16.md#direct-codex-subagent-audit)
- [V4 Pro worker-registration E2E record](../validation/deepseek-v4-pro-worker-registration-2026-08-16.md)
- `docs/current-state.md` state and limitations

## What this demonstrates

The run used explicit `--apply` authorization, a reversible snapshot, an
isolated intentionally failing fixture, and an existing Flash worker. The worker
gave the expected diagnostic without changing the fixture. A bridge-root default
bug found during the first attempt was fixed and covered by a regression test
before the final default-root run completed.

No API key, private task text, private path, raw worker transcript, or provider
response body is published here.

## Evidence still required

1. Independent real-user acceptance of the documented install path.
2. Broader reliability evidence across sessions and appropriate text/code tasks.
3. A V4 Pro worker E2E through a Codex host that can actually dispatch the
   explicitly registered `deepseek_pro_worker`. The current host rejects that
   role before a provider request, tool call, worker result, or completed
   bridge archive; this does not authorize Flash/Pro routing.

## What to avoid in this state

- Do not treat this one run as generic public-installer success.
- Do not use this demo as proof of broader routing stability.
- Do not claim V4 Pro runtime support, automatic model selection, or complete
  readiness for all tasks or environments. Local installer/Doctor/verifier
  registration alone is not a successful Codex worker run.

## Boundary note

`runtimeVerified=false` is intentionally retained for runtime-evidence
governance even after this recorded maintainer E2E.
