---
name: Angular
quadrant: Languages & Frameworks
ring: Hold
status: Moved Out
summary: Comprehensive TypeScript-based framework for building web applications. Moving away in favor of React for new projects.
tags:
  - framework
  - frontend
  - typescript
  - legacy
owners:
  - '@team/frontend'
since: '2019-01-01'
last_reviewed: '2024-09-10'
links:
  - title: Angular Official Site
    url: https://angular.io/
  - title: Migration Guide (Internal)
    url: https://wiki.internal/angular-to-react-migration
history:
  - date: '2019-01-01'
    ring: Adopt
    note: Chosen as standard frontend framework for enterprise apps
  - date: '2023-03-01'
    ring: Trial
    note: Reassessing due to hiring challenges and ecosystem shifts
    pr: '#145'
  - date: '2024-09-10'
    ring: Hold
    note: No new Angular projects. Existing apps maintained, new development in React
    pr: '#401'
---

## Overview

Angular served us well for 4+ years, powering our admin dashboards and internal tools. However, we're moving to **Hold** status: no new Angular projects will be started, and teams are encouraged to migrate existing apps to React where feasible.

## Why We're Moving Away

**Primary reasons:**
- **Hiring challenges**: 3x more React developers in market than Angular
- **Ecosystem momentum**: React community significantly larger
- **Team preference**: Internal survey showed 80% prefer React
- **Bundle size**: Angular apps average 300KB+ (React apps ~150KB)
- **Framework churn**: Angular's major version changes require migration effort

**Not Angular's fault:**
- Angular is still a solid, well-engineered framework
- TypeScript support is excellent
- Enterprise features (DI, RxJS) are powerful
- This is a strategic alignment decision, not a technical one

## When to Still Use Angular

Continue using Angular for:
- **Existing Angular apps**: Don't rewrite working software
- **Large enterprise apps**: Where Angular's structure helps
- **Teams with deep Angular expertise**: If migration ROI is unclear

## When Not to Use (New Projects)

Avoid Angular for:
- **New projects**: Use React (our new standard)
- **Small teams**: React's flexibility often better
- **Public-facing sites**: Bundle size matters more

## Migration Strategy

We're **not** mandating rewrites. Instead:

### Option 1: Maintain in Place
- Continue with Angular for existing apps
- Security updates and bug fixes only
- No new features unless business-critical

### Option 2: Gradual Migration
- Use Module Federation to embed React components
- Migrate route-by-route
- Eventually deprecate Angular shell

### Option 3: Full Rewrite
- Only if app needs significant rework anyway
- Opportunity to rethink architecture
- Typically 2-4 months effort

## Existing Angular Apps

Currently maintaining:
- Admin Dashboard (10k LOC) - **migrating** (Q4 2024)
- Internal CRM (15k LOC) - **maintaining** (no migration plans)
- Analytics Portal (8k LOC) - **migrated to React** (Q2 2024)

## What We Learned

**Angular Did Well:**
- Opinionated structure helped large teams align
- RxJS powerful for complex async state
- CLI and tooling excellent
- Dependency injection useful for testability

**Challenges We Faced:**
- Harder to hire senior Angular developers
- Framework upgrades (v8→v9→v10...) required effort
- Learning curve steep for junior developers
- Community resources declining

## Related Technologies

- React (replacement for new projects)
- TypeScript (still our standard)
- RxJS (useful patterns applicable outside Angular)
