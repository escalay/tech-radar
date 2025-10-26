# Contributing to Tech Radar

Thank you for contributing to our tech radar! This guide will help you add or update technologies effectively.

## Table of Contents

- [Quick Start](#quick-start)
- [Adding a New Blip](#adding-a-new-blip)
- [Updating an Existing Blip](#updating-an-existing-blip)
- [Front-Matter Guidelines](#front-matter-guidelines)
- [Writing Good Content](#writing-good-content)
- [PR Process](#pr-process)
- [Ring Definitions](#ring-definitions)

## Quick Start

```bash
# Setup
npm install

# Create a new blip
npm run new-blip

# Or update an existing one
npm run update-status "technology-name"

# Validate your changes
npm run validate
npm run build
npm run preview
```

## Adding a New Blip

### Option 1: Automated (Recommended)

```bash
npm run new-blip
```

Follow the interactive prompts. This will:
- Create a properly formatted Markdown file
- Add required front-matter
- Include content templates
- Place file in correct quadrant folder

### Option 2: Manual

1. Create a file: `radar/<quadrant>/<slug>.md`
2. Add front-matter (see schema below)
3. Write content following the template
4. Validate with `npm run validate`

## Updating an Existing Blip

### Moving to a Different Ring

```bash
npm run update-status "technology-name"
```

This will:
- Find the blip
- Prompt for new ring and rationale
- Auto-detect status (Moved In/Out)
- Append history entry
- Update `last_reviewed` date

### Content-Only Updates

For minor updates (typos, links, clarifications):
1. Edit the Markdown file directly
2. Update `last_reviewed` date
3. No need to change ring or add history

## Front-Matter Guidelines

### Required Fields

```yaml
name: Technology Name
quadrant: Techniques | Platforms | Tools | Languages & Frameworks
ring: Adopt | Trial | Assess | Hold
status: New | Moved In | Moved Out | No Change
```

### Recommended Fields

```yaml
summary: One-line description (appears on detail page and lists)
tags: [relevant, keywords]
owners: [@team/name, @username]
since: '2024-01-15'              # When first added (YYYY-MM-DD)
last_reviewed: '2024-09-01'      # Most recent review date
links:
  - title: Official Documentation
    url: https://example.com
  - title: Internal Runbook
    url: https://wiki.internal/...
```

### History Tracking

Always add a history entry when changing rings:

```yaml
history:
  - date: '2024-09-15'
    ring: Trial
    note: Clear, specific reason for the change
    pr: '#123'                   # Optional but recommended
```

## Writing Good Content

### Structure

Use these sections (provided by template):

```markdown
## Overview
Brief description of the technology and its purpose.

## Why This Matters
Benefits, strategic importance, measurable impact.

## When to Use
Ideal use cases and scenarios.

## When Not to Use
Situations where alternatives are better.

## Trade-offs & Considerations
Honest assessment of benefits vs. challenges.

## Getting Started
Links, setup steps, code examples.

## Related Technologies
Links to other radar entries.
```

### Best Practices

1. **Be specific**: Use concrete examples and metrics
   - ❌ "Improves performance"
   - ✅ "Reduced build times by 50% (8min → 4min)"

2. **Be honest**: Include trade-offs and challenges
   - Every technology has downsides
   - Help teams make informed decisions

3. **Be actionable**: Provide clear next steps
   - Links to documentation
   - Getting started guides
   - Internal runbooks

4. **Use evidence**: Back claims with data
   - Team survey results
   - Metrics from production
   - Case studies or blog posts

5. **Keep it current**: Review periodically
   - Update `last_reviewed` date
   - Remove outdated information
   - Add new learnings

## PR Process

### 1. Create Your Branch

```bash
git checkout -b add-playwright
```

### 2. Make Changes

- Add or update blip files
- Run validation: `npm run validate`
- Test build: `npm run build && npm run preview`

### 3. Create PR

Use the PR template (auto-populated). Include:

- **Rationale**: Why this change?
- **Evidence**: Metrics, case studies, team feedback
- **Risks**: Potential downsides or challenges
- **Migration**: How teams should adopt (if applicable)

### 4. Review Process

PRs are automatically assigned to CODEOWNERS:
- Techniques → @team/engineering-practices
- Platforms → @team/platform
- Tools → @team/tooling
- Languages & Frameworks → @team/architecture

Expect:
- Questions about rationale and evidence
- Suggestions for content improvements
- Requests for clarification

### 5. Merge & Deploy

Once approved:
- Merge to `main`
- GitHub Actions builds and validates
- Auto-deploys to GitHub Pages
- Artifact available for preview

## Ring Definitions

### Adopt (Green)

**Definition**: Technologies we have high confidence in and are ready for mainstream use.

**Criteria**:
- Proven in production
- Team has expertise
- Well-documented (internally and externally)
- Clear benefits outweigh costs
- Stable, mature, and supported

**Examples**: TypeScript, Kubernetes, GitHub Actions

### Trial (Blue)

**Definition**: Technologies worth pursuing with the understanding that enterprises should get comfortable with them before adopting them widely.

**Criteria**:
- Successfully piloted by 1-2 teams
- Positive early feedback
- Understands trade-offs
- Plan for broader rollout
- Monitoring for issues

**Examples**: Micro Frontends, AWS Lambda

### Assess (Yellow)

**Definition**: Technologies worth exploring to understand how they might affect your enterprise.

**Criteria**:
- Interesting and promising
- Small-scale experimentation underway
- Evaluating fit for our needs
- Unclear if suitable for production
- Collecting data for Trial decision

**Examples**: Playwright (currently evaluating)

### Hold (Red)

**Definition**: Proceed with caution. We've found these technologies problematic or moving away from them.

**Criteria**:
- Moving away from (but not removing)
- New projects should avoid
- Existing usage continues (maintenance mode)
- Clear alternative exists
- Migration path documented

**Examples**: Angular (superseded by React)

**Note**: Hold ≠ "bad technology". It means not the right fit for us now.

## Common Scenarios

### Scenario 1: Proposing a New Technology

1. Research thoroughly (docs, community, alternatives)
2. Small proof-of-concept
3. Create blip in **Assess** ring
4. Open PR with findings
5. Gather team feedback
6. If promising → plan Trial pilot

### Scenario 2: Moving from Trial to Adopt

1. Collect production evidence (metrics, incidents, satisfaction)
2. Ensure documentation is complete
3. Run `npm run update-status "tech-name"`
4. Update content with learnings
5. PR with detailed rationale
6. Get architectural review

### Scenario 3: Moving to Hold

1. Identify clear alternative
2. Document migration path
3. Update blip with rationale (why moving away)
4. PR explaining decision
5. Create migration plan for existing usage

## Questions?

- Open an issue: [GitHub Issues](#)
- Slack: #tech-radar
- Email: architecture@company.com

Thank you for contributing! 🎯
