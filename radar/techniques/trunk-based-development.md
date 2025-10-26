---
name: Trunk-Based Development
quadrant: Techniques
ring: Adopt
status: Moved In
summary: A source-control branching model where developers collaborate on code in a single branch called 'trunk', with short-lived feature branches.
tags:
  - delivery
  - ci-cd
  - version-control
owners:
  - '@team/engineering-practices'
since: '2024-03-01'
last_reviewed: '2024-09-01'
links:
  - title: Official Site
    url: https://trunkbaseddevelopment.com/
  - title: Internal Playbook
    url: https://wiki.internal/trunk-based-dev
history:
  - date: '2024-03-01'
    ring: Assess
    note: Initial evaluation for improving deployment frequency
    pr: '#101'
  - date: '2024-06-15'
    ring: Trial
    note: Piloted successfully with mobile team, improved deployment frequency by 3x
    pr: '#145'
  - date: '2024-09-01'
    ring: Adopt
    note: Proven approach, now recommended for all teams. Reduced merge conflicts by 70%
    pr: '#189'
---

## Overview

Trunk-Based Development (TBD) is a source-control branching model where developers collaborate on code in a single branch called 'trunk' (or 'main'), resisting any pressure to create other long-lived development branches. Short-lived feature branches are used sparingly and merged back quickly.

## Why This Matters

TBD enables:
- **Faster feedback loops**: Changes integrate continuously, catching conflicts early
- **Reduced merge complexity**: No long-lived branches means simpler merges
- **Improved deployment frequency**: Small, frequent changes are easier to deploy
- **Better collaboration**: Team sees each other's work in near real-time

Our data shows teams practicing TBD deploy 3x more frequently with 70% fewer merge conflicts.

## When to Use

TBD works best when:
- Team has strong CI/CD pipelines with automated testing
- Feature flags are available for incomplete features
- Team size is small to medium (2-10 developers per repo)
- Deployment automation is mature

## When Not to Use

Consider alternatives when:
- Working with large, distributed teams without mature DevOps practices
- Regulatory requirements mandate long approval cycles
- Legacy codebase with brittle test coverage (fix this first!)

## Trade-offs & Considerations

**Benefits:**
- Continuous integration is real, not just in name
- Faster identification of breaking changes
- Simpler branching strategy, easier for new developers

**Challenges:**
- Requires discipline around small commits
- Feature flags add complexity
- Demands robust automated testing
- Cultural shift from traditional Git Flow

## Getting Started

1. **Assess current state**: Review branch count, merge frequency, deployment cadence
2. **Strengthen CI/CD**: Ensure fast, reliable automated tests (<10 minutes)
3. **Implement feature flags**: Use LaunchDarkly or similar
4. **Start small**: Pilot with one team for 2-4 weeks
5. **Train the team**: Emphasize small commits, frequent pushes
6. **Monitor metrics**: Track deployment frequency, lead time, merge conflicts

## Related Technologies

- GitHub Actions (CI/CD automation)
- Feature Flags (hiding incomplete work)
- Automated Testing (safety net for continuous integration)
