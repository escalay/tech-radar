---
name: Playwright
quadrant: Tools
ring: Assess
status: New
summary: Modern end-to-end testing framework for web applications with support for multiple browsers and excellent developer experience.
tags:
  - testing
  - e2e
  - automation
  - quality
owners:
  - '@team/quality'
since: '2024-09-01'
last_reviewed: '2024-09-01'
links:
  - title: Playwright Official Docs
    url: https://playwright.dev/
  - title: Best Practices Guide
    url: https://playwright.dev/docs/best-practices
history:
  - date: '2024-09-01'
    ring: Assess
    note: Starting evaluation as potential replacement for Selenium-based E2E tests
---

## Overview

Playwright is a modern end-to-end testing framework from Microsoft that promises faster, more reliable tests than our current Selenium setup. We're evaluating it for potential adoption across all web applications.

## Why This Matters

Playwright offers:
- **Auto-waiting**: Automatically waits for elements to be actionable
- **Multi-browser**: Chromium, Firefox, WebKit with single API
- **Parallel execution**: Tests run concurrently out of the box
- **Network interception**: Mock APIs easily
- **Better DX**: TypeScript support, trace viewer, codegen

Current pain points with Selenium:
- Flaky tests requiring frequent retries
- Slow execution (30 min test suite)
- Difficult to debug failures
- Maintenance burden

## What We're Evaluating

### Success Criteria

We'll move to **Trial** if:
- Can migrate 20% of E2E suite in < 2 weeks
- Flakiness rate < 2% (currently 15% with Selenium)
- Test execution time reduced by > 50%
- Team finds DX significantly better

### Pilot Scope

- Rewrite critical user journeys (login, checkout, account creation)
- Run in parallel with Selenium for 4 weeks
- Compare reliability, speed, maintainability

### Timeline

- **Week 1-2**: Setup, training, initial migration
- **Week 3-6**: Parallel running, data collection
- **Week 7**: Decision meeting

## When to Use

Playwright excels at:
- **E2E testing**: Full user flow testing
- **Cross-browser testing**: Need Safari, Firefox, Chrome coverage
- **Visual regression**: Screenshot comparison
- **API testing**: Can also test APIs

## When Not to Use

Not ideal for:
- **Mobile native apps**: Use Appium instead
- **Legacy IE support**: Playwright doesn't support IE11
- **Non-web testing**: Desktop apps, etc.

## Trade-offs & Considerations

**Potential Benefits:**
- Modern architecture, actively developed
- Built-in features (screenshots, video, traces)
- Strong TypeScript support
- Excellent documentation

**Concerns:**
- Team learning curve (new API)
- Migration effort for existing tests
- Less mature than Selenium (fewer StackOverflow answers)
- Requires Node.js ecosystem

## Early Impressions

After 2 weeks of exploration:

**Positive:**
- Setup was straightforward (`npm init playwright`)
- Codegen tool excellent for quick test creation
- Trace viewer makes debugging much easier
- Auto-waiting eliminated most flakiness

**Challenges:**
- Some advanced Selenium patterns don't translate directly
- CI setup required some tuning (browser installation)
- Team needs time to learn new API

## Getting Started (Pilot Team)

```bash
npm init playwright@latest
npx playwright codegen https://your-app.com
npx playwright test
npx playwright show-report
```

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'user@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

## Next Steps

1. **Expand pilot**: Add 10 more test cases
2. **Performance benchmarks**: Compare with Selenium suite
3. **Team feedback**: Survey pilot team
4. **Decision**: Move to Trial, Adopt, or Hold

**Review date: November 2024**

## Related Technologies

- Selenium (current E2E framework)
- Cypress (alternative we considered)
- Testing Library (unit/integration tests)
