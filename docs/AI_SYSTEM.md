# AI System

## Purpose

AI assists with discovery, structuring, content and maintenance. In a static, git-based site, every AI action is a **pull request**.

## Capabilities

- discover destinations and events (proposes new content files)
- classify and normalize
- generate content drafts and SEO suggestions
- link nearby entities
- create seasonal collections
- identify stale data and propose corrections

## Execution modes

1. **Interactive:** Claude Code working in the repository, producing a branch and PR.
2. **Scheduled:** an Actions job (`pipeline-events.yml` or an AI job) that runs a prompt against new data and opens a PR. Requires an LLM API key as an Actions secret; provider and cost to be decided and recorded.

## Guardrails

AI must not invent facts. Every AI-generated file or change carries frontmatter:

```yaml
provenance:
  actor: ai
  model: <model id>
  prompt_ref: prompts/<file>#<section>
  sources: [<url>, ...]
  confidence: 0.0–1.0
  generated_at: <ISO-8601>
```

## Approval

- Approval = PR review and merge by a human. Branch protection on `main` requires one review for PRs that touch `content/`.
- Edit = commit on the PR branch.
- Reject = close the PR.
- Rollback = `git revert`.

Bots may commit **generated data** directly (`data/generated/`), never **editorial content** (`content/`).

## Same data model

AI and humans edit the same files with the same schemas; validation runs in CI on every PR.
