# GitHub Promotion Status

```yaml
mode: resume
current_stage: discussions
status: PUBLISHED
repository: dhy365-creator/codex-third-party-workers
source_commit: 59100b08aeedfa299398d1330c25f863bf4aa8af
release_tag: v0.4.0-beta.2
release_url: https://github.com/dhy365-creator/codex-third-party-workers/releases/tag/v0.4.0-beta.2
owned_repository_pr: https://github.com/dhy365-creator/codex-third-party-workers/pull/5
owned_repository_state: merged
last_updated: 2026-08-15
checked_at: 2026-08-15T10:37:16+08:00
external_publication: published
waiting_for: none
discussion_url: https://github.com/openai/codex/discussions/38119
discussion_title: "Codex Third-Party Workers: bounded third-party model subagents while Codex stays in control"
discussion_published_at: 2026-08-12T12:48:20+08:00
discussion_status: published
discussion_moderation: none_observed_open_unlocked
utm_convention: not_applicable_for_github_to_github_links
```

This file records promotion state only. It does not contain credentials, task
payloads, API responses, billing data, or private paths.

## Positioning

**Codex Third-Party Workers** lets Codex delegate bounded text, code, research,
and local-validation tasks to reviewed third-party or Chinese model APIs while
the main Codex thread remains on OpenAI and performs final review.

It is not a Codex replacement, an OpenAI product, a universal compatibility
layer, or a promise of a fixed cost reduction.

## Owned repository audit

| Item | Status | Evidence / next action |
| --- | --- | --- |
| Baseline | DONE | `origin/main` and the clean audit worktree matched at `59100b0`; unrelated catalog safety changes remain isolated in the canonical checkout |
| Public repository | DONE | Public GitHub repository with MIT license |
| README positioning | DONE | English and Chinese first screens productized with value, quick start, demo, compatibility, architecture, validation, and security |
| Visual assets | DONE | Reproducible SVG and rendered PNG assets in `assets/` |
| Description | DONE | Updated after PR #5 merged; current text recorded below |
| Topics | DONE | Expanded after PR #5 merged; current set recorded below |
| Homepage | NOT APPLICABLE | No canonical project website; keep empty instead of pointing to an unrelated page |
| Social Preview | NEEDS USER ACTION | `assets/hero-social-preview.png` is ready; GitHub Settings upload must be performed and visually verified in the UI |
| GitHub Actions | DONE | Public `main` and tag workflows passed on release source `59100b0` |
| Release | DONE | `v0.4.0-beta.2` is a public pre-release targeting `59100b0` |
| Profile pin | DONE | Repository is already pinned on the owner's profile |
| Repository Discussions | NOT APPLICABLE | Repository Discussions are disabled and are not required for this promotion pass |
| External promotion | DONE | Show and tell Discussion #38119 is published; it was live-checked open and unlocked on 2026-08-15 |

## Owned metadata

Previous description:

> Run compatible third-party models as bounded Codex subagents without replacing the main OpenAI model.

Current description:

> Use third-party and Chinese model APIs as bounded Codex subagents while keeping Codex as the main agent.

Current topics:

```text
codex
openai-codex
codex-desktop
subagents
ai-agents
llm
developer-tools
macos
deepseek
minimax
qwen
third-party-models
```

## Tracking convention

GitHub-to-GitHub promotion links use the canonical repository URL without UTM
parameters because this repository has no separate analytics-enabled homepage.
If a canonical website is added later, use:

```text
utm_source=<community-or-repository>
utm_medium=github
utm_campaign=codex-third-party-workers
utm_content=<asset-or-post>
```

## Prepared external assets

- OpenAI Codex `Show and tell` published record:
  `docs/promotion/openai-codex-show-and-tell.md`
- Awesome List fit audit and proposed data entry:
  `docs/promotion/awesome-list-candidates.md`
- Release notes draft:
  `docs/promotion/release-notes-v0.4.0-beta.1.md`

Every external action remains **USER ACTION REQUIRED** until the user explicitly
authorizes that specific publication.

## Show and tell checkpoint

- Target: `openai/codex` → `Show and tell`
- Draft: `docs/promotion/openai-codex-show-and-tell.md`
- State: published at `2026-08-12T12:48:20+08:00`
- Discussion: `https://github.com/openai/codex/discussions/38119`
- Moderation: no warning observed; open and unlocked at verification
- Previous account post: Discussion #37852 at approximately
  `2026-08-11 01:30 Asia/Shanghai`
- Publication checks passed: category rules, same-account duplicates, near-duplicate
  recent posts, public repository/Release, README/Demo/compatibility/CI evidence,
  balanced Markdown fences, immutable public Demo URL
- Explicit exclusions: no Awesome List PR, no comments, no other promotion
