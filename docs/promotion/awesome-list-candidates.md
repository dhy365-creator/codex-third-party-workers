# Awesome List candidate audit

Status: **prepared only — no fork, branch, push, or pull request created**

Evaluated on 2026-08-11 against the repository's current public evidence.

## HIGH FIT: Picrew/awesome-agent-harness

- Candidate: <https://github.com/Picrew/awesome-agent-harness>
- Fit: `HIGH FIT`
- Proposed category: `Guardrails, Security & Governance`
- Submission source of truth: `data/projects.yaml`
- Rules checked: active within 12 months, clearly scoped, reasonably documented,
  non-duplicative; no hard star threshold.
- Why it fits: this project implements a concrete Codex harness guardrail for
  quota-aware provider routing, bounded single-slot delegation, owner-only task
  transfer, redacted archival, and main-agent review.
- Duplicate search: no `codex-third-party-workers` entry found in the current
  catalog.

Prepared `data/projects.yaml` entry:

```yaml
- name: Codex Third-Party Workers
  repo_url: https://github.com/dhy365-creator/codex-third-party-workers
  category: Guardrails, Security & Governance
  summary_en: Unofficial macOS guardrail layer that lets Codex delegate bounded text and code tasks to reviewed third-party model workers while keeping the OpenAI main agent in control.
  summary_zh: 非官方 macOS 护栏层，让 Codex 在保持 OpenAI 主代理控制的同时，将有边界的文本与代码任务委派给经过审查的第三方模型 Worker。
  tags:
  - codex
  - provider-routing
  - subagents
  stars_snapshot: 1
  updated_at: '2026-08-11'
  license: MIT
  why_included: README and tests document quota-aware preflight routing, Keychain-only credentials, a single owner-only task bridge, redacted completion archives, and main-agent review for third-party Codex subagents.
```

Required validation in a future external PR checkout:

```sh
python3 scripts/sync_github_metadata.py
python3 scripts/render_readme.py
python3 scripts/verify_catalog.py
```

Suggested PR title:

```text
Add Codex Third-Party Workers to Guardrails, Security & Governance
```

Suggested PR body:

```markdown
Adds Codex Third-Party Workers, an unofficial macOS guardrail layer for bounded
third-party model delegation inside Codex workflows.

Why it belongs here:

- implements quota-aware preflight routing and suitability checks;
- keeps the main OpenAI Codex agent in control;
- uses Keychain-only credentials and an owner-only single-task bridge;
- redacts archived task data; and
- documents tested provider and compatibility boundaries.

I updated only `data/projects.yaml`, regenerated the derived files, and ran the
catalog verification commands required by CONTRIBUTING.md.
```

External action: **USER ACTION REQUIRED** before any fork, branch, push, or PR.

## Not currently eligible

### Zijian-Ni/awesome-ai-agents-2026

`NOT ELIGIBLE` now. Its contribution rules require at least 100 stars,
third-party adoption, or an official artifact. This repository currently has one
star and no independently documented adoption.

### alexngai/awesome-agent-experience

`NOT ELIGIBLE` now. It asks GitHub projects to show meaningful adoption. Current
public evidence is insufficient even though the topic is related.

### alterhq/awesome-codex-pets-projects

`NOT ELIGIBLE`. The list is specifically for Codex pets projects, not general
Codex developer tools.

### jonradoff/awesome-agent-almanac

`NOT ELIGIBLE / NO SUBMISSION PATH VERIFIED`. The catalog is auto-generated and
no contribution route for this project type was confirmed.
