# Automation Scripts Documentation

Complete reference for all automation scripts included in the tech radar.

## Table of Contents

- [new-blip.ts](#new-blipts) - Create new blips interactively
- [update-status.ts](#update-statust) - Update blip ring/status
- [import-history.ts](#import-historyts) - Bulk import history from CSV
- [generate.ts](#generatets) - Build the radar
- [validate.ts](#validatets) - Validate schemas

---

## new-blip.ts

**Purpose**: Interactive CLI for creating new technology blips with proper scaffolding.

### Usage

```bash
npm run new-blip
```

### Interactive Prompts

1. **Blip name**: Full technology name (e.g., "Kubernetes", "TypeScript")
2. **Quadrant**: Choose from configured quadrants
3. **Ring**: Choose initial ring (usually Assess for new technologies)
4. **Summary**: One-line description
5. **Tags**: Comma-separated keywords
6. **Owners**: Comma-separated @usernames or @team/names
7. **Links**: Optional external resources

### What It Creates

```
radar/<quadrant>/<slug>.md
```

With:
- Complete front-matter (all required fields)
- Initial history entry
- Content template with standard sections
- Proper file naming (slug)

### Example Session

```
🎯 Create a New Tech Radar Blip

? Blip name: Playwright
? Select quadrant: Tools
? Select ring: Assess
? One-line summary: Modern E2E testing framework
? Tags (comma-separated): testing, e2e, automation
? Owners (comma-separated): @team/quality
? Add external links? Yes
  ? Link title: Official Docs
  ? Link URL: https://playwright.dev
  ? Add another link? No

✅ Created: radar/tools/playwright.md

📝 Next steps:
   1. Edit radar/tools/playwright.md to add detailed content
   2. Run 'npm run build' to test
   3. Create a PR when ready
```

### Error Handling

- **File exists**: Prevents overwriting existing blips
- **Invalid quadrant**: Must match radar.config.yml
- **Invalid URL**: Link URLs must be valid

---

## update-status.ts

**Purpose**: Update a blip's ring/status and automatically append history entries.

### Usage

```bash
npm run update-status <blip-name-or-slug>
```

### Examples

```bash
npm run update-status kubernetes
npm run update-status "trunk based development"
npm run update-status playwright
```

### Interactive Prompts

1. **New ring**: Select from Adopt, Trial, Assess, Hold
2. **Reason for change**: Required rationale (stored in history)
3. **PR number**: Optional (e.g., #123)
4. **Reviewed by**: Optional reviewer name

### What It Does

1. Finds the blip by name (fuzzy matching)
2. Shows current ring and status
3. Prompts for new ring
4. Auto-detects status:
   - `Moved In`: Ring index decreased (closer to Adopt)
   - `Moved Out`: Ring index increased (further from Adopt)
   - `No Change`: Same ring
5. Updates `ring` field
6. Updates `status` field
7. Appends history entry with:
   - Today's date
   - New ring
   - Rationale
   - PR number (if provided)
8. Updates `last_reviewed` to today

### Example Session

```
🔍 Searching for "kubernetes"...

✅ Found: Kubernetes
   Current ring: Trial
   Current status: No Change

? Select new ring: Adopt

💡 Auto-detected status: Moved In

? Reason for change: Production-ready, 15 services migrated successfully
? PR number (e.g., #123, leave empty if none): #412
? Reviewed by (optional, e.g., @username): @tech-lead

✅ Updated: radar/platforms/kubernetes.md
   Ring: Trial → Adopt
   Status: Moved In
   History entry added with date 2024-09-15

📝 Next steps:
   1. Review changes in radar/platforms/kubernetes.md
   2. Run 'npm run build' to test
   3. Create a PR when ready
```

### Error Handling

- **Blip not found**: Suggests checking spelling
- **No change confirmation**: Asks before updating if ring unchanged

---

## import-history.ts

**Purpose**: Bulk import historical ring transitions from CSV files.

### Usage

```bash
npm run import-history <csv-file>
```

### CSV Format

```csv
name,date,ring,note,pr
Kubernetes,2023-06-01,Assess,"Initial evaluation",#123
Kubernetes,2024-01-15,Trial,"Pilot successful",#456
TypeScript,2022-01-01,Adopt,"Org-wide standard",#100
```

**Columns:**
- `name`: Blip name (must match existing blip)
- `date`: YYYY-MM-DD format
- `ring`: Adopt | Trial | Assess | Hold
- `note`: Reason for change
- `pr`: Optional PR number (#123 format)

### What It Does

1. Parses CSV file
2. Groups entries by blip name
3. For each blip:
   - Finds matching file
   - Validates history entries with Zod
   - Checks for duplicates (by date)
   - Merges new entries
   - Sorts history chronologically
   - Writes back to file

### Example Session

```bash
$ npm run import-history history.csv

📥 Importing history from history.csv...

Found 15 history entries

Processing Kubernetes...
  ✅ Added 3 history entries
Processing TypeScript...
  ℹ️  No new entries to add
Processing React...
  ⚠️  Could not find blip "React" - skipping

✅ Import complete!
   Updated: 2 blips
   Errors: 1

📝 Next steps:
   1. Review updated files
   2. Run 'npm run build' to test
   3. Create a PR when ready
```

### Error Handling

- **File not found**: Clear error message
- **Invalid CSV**: Reports parsing errors
- **Blip not found**: Skips with warning
- **Invalid entry**: Zod validation errors shown
- **Duplicate dates**: Skips existing entries

### Use Cases

- **Migrating from old radar**: Export old data to CSV
- **Bulk backfilling**: Add historical context to existing blips
- **Data recovery**: Restore history from backups

---

## generate.ts

**Purpose**: Main build script that transforms Markdown files into the static radar site.

### Usage

```bash
npm run build
```

### What It Does

#### 1. Load Configuration

```typescript
// Reads radar.config.yml
// Validates with Zod
// Extracts quadrants, rings, colors, etc.
```

#### 2. Parse Markdown Files

```typescript
// Finds all radar/**/*.md files
// Parses front-matter with gray-matter
// Validates each blip with Zod
// Checks history consistency
// Generates slug from name
```

#### 3. Generate Outputs

**a) Zalando entries.json**
```
dist/data/entries.json
```
Format for radar.js visualization:
```json
{
  "entries": [
    {
      "label": "Kubernetes",
      "quadrant": 1,
      "ring": 0,
      "moved": 1
    }
  ],
  "config": { ...radar.config.yml... }
}
```

**b) Detail Pages**
```
dist/tech/<slug>/index.html
```
For each blip:
- Name, quadrant, ring badges
- Summary and metadata
- Links section
- Full Markdown content (rendered)
- History timeline with dates and notes

**c) Changelog Page**
```
dist/changelog.html
```
Shows recent changes (90 days by default):
- New entries
- Moved closer to Adopt
- Moved away from Adopt

**d) Index Page**
```
dist/index.html
```
- Zalando radar visualization
- Side list of all technologies
- Link to changelog

**e) Styles**
```
dist/styles.css
```
- Responsive design
- Timeline styling
- Radar layout
- Badge colors

### Example Output

```
🚀 Building tech radar...

📋 Loading configuration...
   Title: Tech Radar
   Quadrants: Techniques, Platforms, Tools, Languages & Frameworks
   Rings: Adopt, Trial, Assess, Hold

🧹 Cleaning dist directory...

📖 Parsing markdown files...
   Found 8 blips

🎯 Generating radar data...
   Wrote entries.json (8 entries)

📄 Generating detail pages...
   Generated 8 detail pages

📊 Generating changelog...
   Found 12 recent changes

🏠 Generating index page...

🎨 Generating styles...

✅ Build complete! Output in dist/

💡 Preview with: npm run preview
```

### Configuration Options

In `radar.config.yml`:

```yaml
show_recent_changes_days: 90  # Badge threshold
changelog_days: 90             # Changelog window
```

---

## validate.ts

**Purpose**: Validate all blip schemas and check for errors.

### Usage

```bash
npm run validate
```

### What It Checks

#### 1. Configuration

- Valid YAML syntax
- Required fields present
- Quadrants (exactly 4)
- Rings (exactly 4)
- Colors (valid hex codes)

#### 2. Blip Front-Matter

For each Markdown file:
- **Required fields**: name, quadrant, ring, status
- **Field types**: strings, arrays, dates
- **Enum values**: quadrant/ring/status match config
- **Date formats**: YYYY-MM-DD
- **URL formats**: Valid URLs in links

#### 3. History Consistency

- Latest history ring matches current ring
- History dates in chronological order
- No duplicate dates

### Example Output

```
🔍 Validating Tech Radar...

✅ Configuration valid

⚠️  radar/platforms/kubernetes.md:
   Latest history entry shows ring "Trial" but current ring is "Adopt". Please add a history entry or update the ring.

❌ radar/tools/invalid.md:
   quadrant: Expected 'Techniques' | 'Platforms' | 'Tools' | 'Languages & Frameworks', received 'Backend'
   since: Date must be in YYYY-MM-DD format

📊 Validation Summary:
   Valid: 7
   Warnings: 1
   Errors: 1

❌ Validation failed
```

### Exit Codes

- `0`: All validations passed
- `1`: Validation errors found

### CI/CD Integration

Used in GitHub Actions:
```yaml
- name: Validate blip schemas
  run: npm run validate
  continue-on-error: true  # Warnings don't fail build
```

---

## Common Workflows

### Adding a New Technology

```bash
# 1. Create blip interactively
npm run new-blip

# 2. Edit content
vi radar/<quadrant>/<slug>.md

# 3. Validate
npm run validate

# 4. Build and preview
npm run build
npm run preview

# 5. Open PR
git add radar/
git commit -m "Add <technology> to radar"
git push origin add-<technology>
```

### Moving Technology Between Rings

```bash
# 1. Update status
npm run update-status "technology-name"

# 2. Update content with learnings
vi radar/<quadrant>/<slug>.md

# 3. Validate and build
npm run validate
npm run build

# 4. Open PR
git commit -am "Move <technology> to <ring>"
git push
```

### Bulk Import from Old Radar

```bash
# 1. Export old radar to CSV
# (external process)

# 2. Import history
npm run import-history old-radar-history.csv

# 3. Review changes
git diff radar/

# 4. Validate and build
npm run validate
npm run build

# 5. Create PR if satisfied
git commit -am "Import historical data"
git push
```

---

## Troubleshooting

### "Cannot find blip"

**Problem**: `update-status` or `import-history` can't find a blip.

**Solution**:
- Check spelling (case-insensitive, but exact match needed)
- Try the slug: `npm run update-status kubernetes` (not "Kubernetes")
- Use quotes for multi-word names: `npm run update-status "trunk based development"`

### "Validation failed"

**Problem**: `npm run validate` reports errors.

**Solution**:
1. Read the error message carefully (shows file and field)
2. Check schema in `src/schemas.ts`
3. Common issues:
   - Wrong enum value (quadrant, ring, status)
   - Invalid date format (must be YYYY-MM-DD)
   - Invalid URL format
   - Missing required field

### "Build failed"

**Problem**: `npm run build` crashes.

**Solution**:
1. Run `npm run validate` first
2. Check for:
   - Syntax errors in front-matter (invalid YAML)
   - Duplicate blip names
   - Invalid history entries
3. Check generator logs for specific error

### "History warnings"

**Problem**: Validation shows history inconsistency warnings.

**Solution**:
- These are warnings, not errors
- Update either:
  - Current ring to match latest history entry, OR
  - Add new history entry explaining ring change

---

## Advanced Usage

### Custom Validation Rules

Add to `src/schemas.ts`:

```typescript
// Example: Require PR for Adopt ring
export const BlipFrontMatterSchema = z.object({
  // ... existing fields ...
}).refine(
  (data) => {
    if (data.ring === "Adopt" && data.history.length > 0) {
      const latest = data.history[data.history.length - 1];
      return latest.pr !== undefined;
    }
    return true;
  },
  { message: "Adopt ring requires PR in latest history entry" }
);
```

### Custom Generators

Extend `tools/generate.ts`:

```typescript
// Example: Generate RSS feed
async function generateRSSFeed(blips: BlipWithContent[]) {
  const recentBlips = blips
    .filter(b => b.status === "New")
    .slice(0, 10);

  // ... generate RSS XML ...

  await fs.outputFile(`${DIST_DIR}/feed.xml`, rss);
}
```

---

## Need Help?

- **Documentation**: [README.md](../README.md), [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Issues**: [GitHub Issues](#)
- **Slack**: #tech-radar
