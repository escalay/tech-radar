---
name: TypeScript
quadrant: Languages & Frameworks
ring: Adopt
status: No Change
summary: Strongly-typed superset of JavaScript that compiles to plain JavaScript, providing optional static typing and modern language features.
tags:
  - language
  - type-safety
  - javascript
  - frontend
  - backend
owners:
  - '@team/architecture'
since: '2022-01-01'
last_reviewed: '2024-09-01'
links:
  - title: Official TypeScript Docs
    url: https://www.typescriptlang.org/docs/
  - title: Internal Style Guide
    url: https://wiki.internal/typescript-style-guide
history:
  - date: '2022-01-01'
    ring: Adopt
    note: Established as standard for all new JavaScript projects. Ecosystem maturity reached
---

## Overview

TypeScript is our standard language for all new JavaScript/Node.js projects, both frontend and backend. It provides static typing that catches errors at compile-time, enables better IDE support, and serves as living documentation.

## Why This Matters

TypeScript delivers:
- **Early error detection**: Catch bugs before runtime
- **Superior IDE support**: Intelligent auto-complete, refactoring
- **Self-documenting code**: Types serve as inline documentation
- **Safer refactoring**: Compiler catches breaking changes
- **Gradual adoption**: Can migrate JS codebases incrementally

Our data shows TypeScript codebases have:
- 38% fewer production bugs (compared to similar JS projects)
- 25% faster onboarding for new developers
- 60% reduction in type-related runtime errors

## When to Use

Use TypeScript for:
- **All new Node.js/JavaScript projects**: Frontend, backend, tooling
- **Large codebases**: Type safety scales with complexity
- **Team projects**: Types improve collaboration
- **Public libraries**: Better DX for consumers

## When Not to Use

Consider plain JavaScript for:
- **Quick scripts**: Sub-100 line utilities
- **Prototypes**: When iteration speed > type safety
- **Legacy codebases**: Only if migration ROI is unclear
- **Extreme performance**: (Rare, but JS can be faster in edge cases)

## Trade-offs & Considerations

**Benefits:**
- Industry-standard with massive ecosystem
- Excellent tooling (VS Code, ESLint, Prettier)
- Strong typing without runtime overhead
- Active development and community

**Challenges:**
- Learning curve for developers new to static typing
- Build step required (compilation)
- Complex types can become difficult to understand
- Occasional friction with dynamic JS libraries

## Getting Started

### Project Setup

```bash
npm install -D typescript @types/node
npx tsc --init
```

### tsconfig.json (Recommended)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Best Practices

1. **Enable strict mode**: Catch more errors
2. **Avoid `any`**: Use `unknown` or proper types
3. **Use type inference**: Let TypeScript infer when obvious
4. **Leverage utility types**: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`
5. **Write tests**: Types don't replace tests

### Common Patterns

```typescript
// Strong typing for API responses
interface User {
  id: number;
  name: string;
  email: string;
}

// Generic functions
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Discriminated unions
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };
```

## Migration Strategy

For existing JavaScript projects:

1. **Rename .js → .ts incrementally**: Start with leaf modules
2. **Use `// @ts-check` in JS files**: Get some type checking
3. **Add JSDoc types**: Bridge to full TS migration
4. **Enable `allowJs`**: Mix JS and TS during transition
5. **Strictness over time**: Start loose, tighten gradually

## Related Technologies

- ESLint (linting)
- Prettier (code formatting)
- Zod (runtime validation that generates types)
- tRPC (end-to-end type-safe APIs)
