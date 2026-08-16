# DeepSeek V4 Pro worker-registration E2E — 2026-08-16

## Scope

This is a sanitized maintainer record for the explicit DeepSeek V4 Pro profile
added on the feature branch. It evaluates the repository registration path and
then the real Codex host dispatch boundary. It does not publish credentials,
private task text, private paths, raw provider responses, or hidden reasoning.

## Intended identity

| Field | Expected value |
| --- | --- |
| Provider | `deepseek` |
| Explicit worker | `deepseek_pro_worker` |
| Model | `deepseek-v4-pro` |
| Automatic fallback | `deepseek_worker` -> `deepseek-v4-flash` only |

Pro is explicit-only. It is not a quota fallback, a Flash replacement, or an
automatic complexity-routing target.

## Local registration and configuration checks

| Check | Result | Evidence boundary |
| --- | --- | --- |
| Profile mapping and catalog isolation | PASS | Flash accepts only Flash; Pro accepts only Pro; cross-model catalogs fail closed |
| Automated suite | PASS | `npm test`: 65/65 tests |
| Installer dry-run | PASS | Both selected DeepSeek profiles plan without mutation; the official catalog source is handled as inert text |
| Authorized temporary apply and rollback | PASS | Flash and explicit Pro profiles were installed, then removed without changing the main Codex configuration |
| Doctor | PASS with one environment warning | Both profiles reported their selected model and expected worker; Doctor remained read-only and made no paid API call |
| Verify | PASS for configuration only | Explicit Pro reported `configured: true` and `runtimeVerified: false` |
| Uninstall and rollback | PASS | Managed files and marker were restored or removed safely; pre-existing directory modes were preserved and an empty newly-created runtime directory was removed |
| Secret and private-path checks | PASS | No credential values or personal paths were added to the feature diff |

The Keychain check established item presence only. No credential value was read
into this record or logged by the validation commands.

## Real Codex dispatch attempt

The installed preflight accepted an explicit Pro request, checked the complete
provider/role/model tuple, and created an owner-only bridge task carrying the
same identity. This confirms the repository-side registration, allowlist,
installer, and bridge metadata path.

The subsequent real Codex collaboration spawn was rejected by the host before
provider dispatch because the host did not recognize `deepseek_pro_worker` as
an available agent type. This is a host-registry limitation outside the
repository configuration. The task was marked failed through the bridge helper;
the archive was redacted and the active slot was released.

| Required live E2E stage | Result |
| --- | --- |
| Explicit `deepseek_pro_worker` spawn | BLOCKED at Codex host agent-type registry |
| Worker identity after spawn | NOT RUN |
| Provider-returned runtime model identity | NOT RUN |
| Real DeepSeek Responses request | NOT RUN |
| Tool/function interaction | NOT RUN |
| Worker result | NOT RUN |
| Completed bridge archive | NOT RUN |
| Failed, redacted archive and active-slot release | PASS |
| Main-agent fixture/result review | BLOCKED; no worker result existed to review |
| Pro verifier output | PASS for configuration; `runtimeVerified: false` retained |

No fallback worker, standalone API probe, or main-agent model invocation was
substituted for the required Pro worker. The isolated fixture remained outside
the repository and was removed after the attempt; the bridge archive is retained
by design.

## Provider-side attribution

Supplemental provider-dashboard attribution was unavailable for this run. It
does not block the local registration assessment, but it cannot substitute for
the missing provider request, runtime model metadata, tool loop, or worker
result.

## Classification

**API-verified candidate.** The repository now has an explicit, locally
validated Pro configuration profile, but the required Codex host dispatch did
not occur. Therefore it is not a Codex worker smoke test, a runtime-verified
worker, or an installable runtime-verified model.

## Required next evidence

Use a Codex host that registers `deepseek_pro_worker`, then repeat one bounded,
non-sensitive coding fixture and record the same worker/model across provider
metadata, a real tool loop, worker result, completed redacted bridge archive,
active-slot release, and independent main-agent review. Re-run Flash regression
checks without enabling automatic Flash/Pro routing.
