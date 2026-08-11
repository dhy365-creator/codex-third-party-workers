# GitHub Promotion Status

```yaml
mode: prepare
current_stage: owned-repo
repository: dhy365-creator/codex-third-party-workers
approved_source: 0262e8efb42c9e20e758f46b3bffeb0c6e0a62d7
working_branch: agent/github-promotion-assets
last_updated: 2026-08-11
external_publication: waiting_for_explicit_user_confirmation
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
| Baseline | DONE | `main`, `origin/main`, and approved source matched at `0262e8e`; clean single worktree before preparation |
| Public repository | DONE | Public GitHub repository with MIT license |
| README positioning | DONE | English and Chinese first screens productized with value, quick start, demo, compatibility, architecture, validation, and security |
| Visual assets | DONE | Reproducible SVG and rendered PNG assets in `assets/` |
| Description | PREPARED | Proposed text recorded below; apply to owned repository after merge |
| Topics | PREPARED | Truthful topic set recorded below; apply to owned repository after merge |
| Homepage | NOT APPLICABLE | No canonical project website; keep empty instead of pointing to an unrelated page |
| Social Preview | NEEDS USER ACTION | `assets/hero-social-preview.png` is ready; GitHub Settings upload must be performed and visually verified in the UI |
| GitHub Actions | DONE | Public workflow passed on baseline commit `0262e8e`; branch CI must pass before merge |
| Release | NEEDS WORK | Version exists but no tag/release; a draft is prepared in `docs/promotion/release-notes-v0.4.0-beta.1.md` |
| Profile pin | DONE | Repository is already pinned on the owner's profile |
| Repository Discussions | NOT APPLICABLE | Repository Discussions are disabled and are not required for this promotion pass |
| External promotion | NEEDS USER ACTION | Drafts only; no Discussion, fork, push, comment, or external PR has been created |

## Owned metadata

Previous description:

> Run compatible third-party models as bounded Codex subagents without replacing the main OpenAI model.

Prepared description:

> Use third-party and Chinese model APIs as bounded Codex subagents while keeping Codex as the main agent.

Prepared topics:

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

- OpenAI Codex `Show and tell` draft:
  `docs/promotion/openai-codex-show-and-tell.md`
- Awesome List fit audit and proposed data entry:
  `docs/promotion/awesome-list-candidates.md`
- Release notes draft:
  `docs/promotion/release-notes-v0.4.0-beta.1.md`

Every external action remains **USER ACTION REQUIRED** until the user explicitly
authorizes that specific publication.
