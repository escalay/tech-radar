# Tech Radar

A collaborative, Markdown-first tech radar for tracking technology decisions and their evolution over time.

[![Build & Deploy](https://github.com/your-org/tech-radar/actions/workflows/publish.yml/badge.svg)](https://github.com/your-org/tech-radar/actions/workflows/publish.yml)

## 🎯 What is This?

This tech radar helps teams track technology choices across four dimensions:

- **Quadrants**: Techniques, Platforms, Tools, Languages & Frameworks
- **Rings**: Adopt (recommended), Trial (promising), Assess (exploring), Hold (avoid)
- **History**: Every ring change is tracked with dates, rationale, and PRs
- **Automation**: Scripts for creating, updating, and importing blips

View the radar: **[Live Demo](#)** (replace with your GitHub Pages URL)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/tech-radar.git
cd tech-radar

# Install dependencies
npm install

# Build the radar
npm run build

# Preview locally
npm run preview
# Open http://localhost:8080
```

## 📝 Creating a New Blip

Use the interactive CLI:

```bash
npm run new-blip
```

This will:
1. Prompt for blip details (name, quadrant, ring, etc.)
2. Generate a Markdown file with proper front-matter
3. Include a content template to fill in

Example output: `radar/tools/playwright.md`

## 🔄 Updating a Blip's Status

When a technology moves to a different ring:

```bash
npm run update-status "blip-name"
```

This will:
1. Find the blip by name
2. Prompt for new ring and rationale
3. Auto-update the status (Moved In/Out)
4. Append a history entry with today's date

## 📊 History Tracking

Every blip can track its journey through the rings:

```yaml
history:
  - date: '2023-06-01'
    ring: Assess
    note: Initial evaluation
    pr: '#123'
  - date: '2024-01-15'
    ring: Trial
    note: Successful pilot
    pr: '#456'
  - date: '2024-09-15'
    ring: Adopt
    note: Production-ready
    pr: '#789'
```

This history:
- Powers the timeline on detail pages
- Generates the changelog page
- Provides audit trail for decisions

## 📂 Repository Structure

```
tech-radar/
├── radar/                       # All blips (Markdown files)
│   ├── techniques/
│   ├── platforms/
│   ├── tools/
│   └── languages-and-frameworks/
├── src/
│   └── schemas.ts              # Zod schemas for validation
├── tools/
│   ├── generate.ts             # Main build script
│   ├── new-blip.ts             # Create new blip
│   ├── update-status.ts        # Update blip ring/status
│   ├── import-history.ts       # Bulk import from CSV
│   └── validate.ts             # Validate all blips
├── radar.config.yml            # Configuration (quadrants, rings, colors)
├── package.json
└── README.md
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Generate static radar site in `dist/` |
| `npm run preview` | Start local server on port 8080 |
| `npm run validate` | Validate all blip schemas |
| `npm run type-check` | TypeScript type checking |
| `npm run new-blip` | Interactive blip creator |
| `npm run update-status <name>` | Update blip ring/status |
| `npm run import-history <csv>` | Bulk import history |

## 📋 Front-Matter Schema

Every blip must include:

```yaml
---
name: Technology Name              # Required
quadrant: Techniques               # Required: Techniques | Platforms | Tools | Languages & Frameworks
ring: Adopt                        # Required: Adopt | Trial | Assess | Hold
status: New                        # Required: New | Moved In | Moved Out | No Change
summary: One-line description      # Optional but recommended
tags: [tag1, tag2]                # Optional
owners: [@team, @person]          # Optional
since: '2024-01-15'               # Optional (YYYY-MM-DD)
last_reviewed: '2024-09-01'       # Optional (YYYY-MM-DD)
links:                            # Optional
  - title: Official Docs
    url: https://example.com
history:                          # Optional but recommended
  - date: '2024-01-15'
    ring: Assess
    note: Initial evaluation
    pr: '#123'
---
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick contribution flow:

1. Create or update a blip file in `radar/`
2. Run `npm run validate` to check schema
3. Run `npm run build` to test locally
4. Create a PR with rationale and evidence
5. Get review from CODEOWNERS
6. Merge → auto-deploys to GitHub Pages

## 🎨 Customization

### Change Colors/Rings

Edit `radar.config.yml`:

```yaml
rings:
  - Adopt
  - Trial
  - Assess
  - Hold

colors:
  Adopt: "#5ba300"
  Trial: "#009eb0"
  Assess: "#c7ba00"
  Hold: "#e09b96"
```

### Change Quadrants

Edit `radar.config.yml` and adjust CODEOWNERS:

```yaml
quadrants:
  - Techniques
  - Platforms
  - Tools
  - Languages & Frameworks
```

## 📖 Documentation

- **[Contributing Guide](./CONTRIBUTING.md)** - How to add/update blips
- **[Automation Scripts](./docs/scripts.md)** - Detailed script documentation
- **[Thoughtworks BYOR](https://github.com/thoughtworks/build-your-own-radar)** - Original inspiration
- **[Zalando Tech Radar](https://github.com/zalando/tech-radar)** - Visualization library

## 🏗️ Architecture

### Build Process

```
Markdown Files → Zod Validation → Generator → Static Site
   (radar/)                      (tools/generate.ts)  (dist/)
```

### Output

- `dist/index.html` - Main radar visualization
- `dist/tech/<slug>/index.html` - Detail page per blip
- `dist/changelog.html` - Recent changes
- `dist/data/entries.json` - Data for Zalando radar.js

### Visualization

Uses [Zalando's radar.js](https://github.com/zalando/tech-radar) (MIT license):
- D3-based interactive visualization
- Quadrants and rings configurable
- Movement indicators (new, moved in/out)

## 🚀 Deployment

### GitHub Pages (Automatic)

On every push to `main`:
1. GitHub Actions validates blips
2. Builds the static site
3. Deploys to GitHub Pages

Configure in **Settings → Pages → Source: GitHub Actions**

### Manual Deployment

```bash
npm run build
# Deploy dist/ to your hosting provider
```

## 📦 Tech Stack

- **TypeScript** - Type-safe tooling
- **Zod** - Runtime validation
- **Markdown** - Source of truth
- **Zalando radar.js** - Visualization
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting

## 📜 License

MIT

## 🙏 Credits

- [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar) - Original concept
- [Zalando Tech Radar](https://github.com/zalando/tech-radar) - Visualization library
- [QIWI Tech Radar](https://github.com/qiwi/tech-radar) - Inspiration for automation
