# DeepSeek Controlled Runtime E2E — 2026-08-16

## Scope and verdict

This is a sanitized, maintainer-controlled runtime record. It keeps the two
models separate:

- **DeepSeek V4 Flash:** **Level 3** for one bounded macOS maintainer E2E.
  An explicit existing worker processed a non-sensitive fixture, the bridge
  completed and released, and the main thread reviewed the result.
- **DeepSeek V4 Pro:** remains **Level 1 — API-verified candidate**. The
  noninteractive custom-agent interface did not produce a Pro model request or
  consume the bridge task.

Level 3 is evidence for the recorded path only. It is not a generic public
installer result, automatic routing claim, user acceptance, or support promise.
\`runtimeVerified\` remains \`false\` because the verifier never self-promotes a
single observation.

## Safeguards

- The API credential stayed in macOS Keychain. No API key, account identifier,
  private task text, private filesystem path, raw model response, or raw child
  transcript was retained in this record.
- The Flash fixture was an isolated, intentionally failing code test. Its source
  files were made read-only; the worker returned the expected diagnosis without
  changing the fixture.
- \`--apply\` was explicitly authorized. A mode-restricted snapshot was taken
  before installation, and the installer was first run in dry-run mode.
- No V4 Pro pack, selector, automatic Flash/Pro routing, installer support, or
  deliberate global configuration edit was added.

## Flash E2E evidence

| Check | Result | Boundary |
| --- | --- | --- |
| Doctor before install | PASS with expected pre-install warnings | Read-only; no paid API call |
| Installer dry-run and authorized apply | PASS | Existing Flash pack only; main Codex configuration was not targeted |
| Post-install Doctor and verify | PASS; \`configured: true\`, \`runtimeVerified: false\` | The latter remains intentionally conservative |
| Delegation | PASS | Preflight selected the existing \`deepseek_worker\` for a suitable fixture task |
| Fixture diagnostic | PASS | Worker used fixture tooling, found the expected test defect, and made no file change |
| Bridge | PASS | Final default-root run archived the task as completed and released the active slot |
| Main-thread review | PASS | Result and bridge state were independently checked |

The first Flash attempt exposed a bridge CLI defect: when a platform argument
was omitted, the root helper could use a generic temporary directory rather than
the macOS default. The helper now defaults to \`process.platform\`; a regression
test covers that path, and the final E2E was repeated with the default root.

## V4 Pro runtime attempt

The direct API evidence in
[the V4 Pro compatibility probe](deepseek-v4-pro-probe-2026-08-16.md) remains
valid Level 1 evidence. For this E2E, a temporary named
\`deepseek_v4_pro_probe_worker\` was created first outside the repository and
then project-scoped for a second attempt. Both configurations were removed
afterward.

The installed noninteractive \`codex exec\` interface had no \`--agent\` selector.
Two bounded attempts to request the named worker produced an error event but no
evidence of a Pro model request, tool execution, bridge consumption, completed
archive, or main-thread result. The pending bridge tasks were explicitly marked
failed and retained as redacted owner-only archives; neither root has an active
slot.

Therefore V4 Pro does **not** meet Level 2 or Level 3. It remains an
API-verified candidate, not a built-in, selectable, installer-supported, or
runtime-verified model.

## Classification

| Level | Meaning | This run |
| --- | --- | --- |
| 1 | Direct API compatibility only | V4 Pro remains here |
| 2 | Actual worker smoke without the complete bridge/main-review chain | Not claimed |
| 3 | Actual worker, model request, fixture tool use, result, completed/released bridge, and main review | Flash only, for the bounded maintainer path |
| 4 | Broad product or generic user-runtime claim | Prohibited; not claimed |

## Environment restoration and limitation

The temporary fixture and its snapshot were removed after validation. All
installer-managed files matched their recorded pre-apply state; temporary V4 Pro
configuration was absent; the two redacted failed Pro archives were retained as
required; and the known pre-test permissions for the \`.codex\` and \`agents\`
directories were restored.

One cleanup warning remains: the \`config.toml\` checksum differed from the
pre-apply checksum after the test activity. The installer source does not write
that file, so it was deliberately not overwritten. Also, the current installer
sets existing parent directories to \`0700\`; because the original \`bin\` and \`lib\`
directory modes were not captured, exact restoration of those two modes cannot
be asserted. This is a cleanup **WARN**, not a provider-runtime success signal.

## Required next action

Use an interactive Codex CLI session or Codex Desktop workflow with a visible
agent picker to invoke the temporary named V4 Pro worker. Before any status
change, independently verify the selected worker/model, fixture tool use,
returned result, completed and released bridge, and main-thread review. Do not
replace this action with another noninteractive \`codex exec\` prompt, and do not
add V4 Pro selection or routing before that evidence exists.
