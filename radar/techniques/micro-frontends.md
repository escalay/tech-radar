---
name: Micro Frontends
quadrant: Techniques
ring: Trial
status: No Change
summary: Architectural pattern that decomposes frontend monoliths into smaller, independently deployable frontend applications.
tags:
  - architecture
  - frontend
  - modularity
owners:
  - '@team/frontend'
  - '@team/architecture'
since: '2024-06-01'
last_reviewed: '2024-09-15'
links:
  - title: Micro Frontends Site
    url: https://micro-frontends.org/
  - title: Martin Fowler Article
    url: https://martinfowler.com/articles/micro-frontends.html
history:
  - date: '2024-06-01'
    ring: Trial
    note: Piloting with dashboard application to split monolithic SPA into team-owned modules
    pr: '#287'
---

## Overview

Micro Frontends extend microservices principles to the frontend, allowing teams to build and deploy frontend features independently. We're currently piloting this approach with our dashboard application, splitting it into domain-aligned micro frontends.

## Why This Matters

Micro Frontends enable:
- **Team autonomy**: Each team owns end-to-end features
- **Independent deployments**: Ship updates without coordinating
- **Technology diversity**: Teams choose best tools per domain
- **Parallel development**: No merge conflicts across teams

Early pilot results (3 months in):
- Deployment velocity increased 2x for participating teams
- Reduced frontend team coordination overhead
- Still assessing: bundle size impact, user experience consistency

## When to Use

Consider Micro Frontends for:
- **Large frontend applications**: 5+ teams working on same UI
- **Autonomous product teams**: Each owning distinct domains
- **Long-lived products**: Where independent evolution matters
- **Organizations with strong DevOps culture**

## When Not to Use

Avoid Micro Frontends for:
- **Small teams**: (< 3 frontend teams) - overhead outweighs benefits
- **Simple applications**: Monoliths are fine for most apps
- **Tight UX requirements**: Consistency is harder across boundaries
- **Limited DevOps maturity**: Independent deployments require infrastructure

## Trade-offs & Considerations

**Benefits:**
- Team can ship without coordinating
- Easier to understand smaller codebases
- Gradual migrations (old and new can coexist)
- Technology experimentation per domain

**Challenges:**
- **Bundle size**: Risk of duplicate dependencies
- **Consistency**: Design system enforcement harder
- **Shared state**: Cross-boundary communication is complex
- **Operational complexity**: More moving parts to monitor

**Currently Investigating:**
- Module federation (Webpack 5) for dependency sharing
- Design system as shared library
- Routing across micro frontends
- Performance impact of additional JS bundles

## Getting Started

### Integration Approaches

We're evaluating:
1. **Build-time integration**: NPM packages (simplest, least flexible)
2. **Runtime integration**: Module federation (complex, most flexible)
3. **Edge-side integration**: ESI/SSI (requires CDN support)

Currently piloting **Module Federation** with Webpack 5.

### Pilot Architecture

```
┌─────────────────────────────────────┐
│     Shell App (dashboard-shell)     │
│  - Routing                           │
│  - Authentication                    │
│  - Shared Navigation                 │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┬──────────┬────────┐
    │             │          │        │
┌───▼───┐   ┌────▼────┐  ┌──▼──┐  ┌──▼──┐
│ Team  │   │ Team    │  │Team │  │Team │
│ Analytics│ │ Settings│  │Admin│  │Reports│
└───────┘   └─────────┘  └─────┘  └─────┘
```

### Key Decisions

- **Shared dependencies**: React, design system via Module Federation
- **Routing**: Shell owns top-level routes, delegates to micro frontends
- **State management**: No shared state; events for cross-boundary communication
- **Deployment**: Independent CI/CD per micro frontend

## Success Criteria for Pilot

We'll move to **Assess** or **Adopt** based on:
- Can we maintain bundle size < 500KB per route?
- Does design consistency remain high?
- Is deploy velocity actually 2x or more?
- Are teams satisfied with autonomy vs. complexity trade-off?

**Decision point: Q4 2024**

## Related Technologies

- Webpack Module Federation
- Single-SPA (framework-agnostic approach)
- Design System (for consistency)
- Feature Flags (gradual rollout)
