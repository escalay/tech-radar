---
name: GitHub Actions
quadrant: Tools
ring: Adopt
status: Moved In
summary: CI/CD platform integrated with GitHub for automating software workflows, testing, and deployments.
tags:
  - ci-cd
  - automation
  - devops
owners:
  - '@team/platform'
since: '2024-02-01'
last_reviewed: '2024-08-20'
links:
  - title: GitHub Actions Docs
    url: https://docs.github.com/en/actions
  - title: Internal Workflow Library
    url: https://github.com/org/workflows
history:
  - date: '2024-02-01'
    ring: Trial
    note: Evaluating as replacement for Jenkins. Initial migration of 5 repos
    pr: '#175'
  - date: '2024-08-20'
    ring: Adopt
    note: 45 repos migrated, Jenkins decommissioned. 50% faster builds, significantly better DX
    pr: '#342'
---

## Overview

GitHub Actions has become our standard CI/CD platform, replacing legacy Jenkins infrastructure. The tight integration with GitHub, combined with a rich marketplace of actions and excellent developer experience, has accelerated our delivery pipelines.

## Why This Matters

GitHub Actions provides:
- **Native GitHub integration**: No separate tool to learn
- **Matrix builds**: Test across multiple versions/platforms easily
- **Rich marketplace**: 10,000+ pre-built actions
- **Self-hosted runners**: Control over build environment
- **Secrets management**: Built-in, secure credential storage

Migration results:
- Build times reduced by 50% (avg 8 min → 4 min)
- Setup time for new repos reduced from 2 hours to 15 minutes
- Developer satisfaction up 40% (internal survey)

## When to Use

Use GitHub Actions for:
- **Projects hosted on GitHub**: Natural fit
- **Standard CI/CD workflows**: Build, test, deploy
- **Automation tasks**: Issue triage, release notes, notifications
- **Multi-platform builds**: Linux, Windows, macOS

## When Not to Use

Consider alternatives for:
- **GitLab projects**: Use GitLab CI/CD
- **Extremely complex pipelines**: May need enterprise CI/CD (TeamCity, CircleCI Enterprise)
- **Ultra-high concurrency**: GitHub has concurrent job limits

## Trade-offs & Considerations

**Benefits:**
- No infrastructure to maintain
- YAML-based configuration (easy to version control)
- Excellent documentation and community
- Generous free tier for open source

**Challenges:**
- Vendor lock-in to GitHub
- Limited visibility into runner internals
- Costs can scale with usage
- Some enterprise features lag behind competitors

## Getting Started

### Basic Workflow Example

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Best Practices

1. **Use reusable workflows**: Create org-wide templates
2. **Cache dependencies**: Use `actions/cache` for node_modules, etc.
3. **Matrix strategies**: Test across Node 18, 20, 22
4. **Self-hosted runners**: For sensitive workloads
5. **Secrets in environment**: Never hardcode credentials

### Common Patterns

- **PR checks**: Lint, test, build on every PR
- **Deploy on merge**: Auto-deploy to staging/production
- **Scheduled jobs**: Nightly builds, dependency updates
- **Release automation**: Tag → build → publish → release notes

## Related Technologies

- Docker (for containerized builds)
- Kubernetes (deployment target)
- Terraform (infrastructure as code in workflows)
