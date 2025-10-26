#!/usr/bin/env tsx

import fs from "fs-extra";
import { glob } from "glob";
import matter from "gray-matter";
import yaml from "js-yaml";
import { marked } from "marked";
import slugify from "slugify";
import { format, isAfter, subDays } from "date-fns";
import {
  BlipFrontMatterSchema,
  BlipWithContent,
  RadarConfigSchema,
  RadarConfig,
  ZalandoEntry,
  ChangeLogEntry,
  ringToIndex,
  statusToMovedFlag,
  quadrantToIndex,
  validateHistoryConsistency,
} from "../src/schemas.js";

const DIST_DIR = "dist";
const CONFIG_FILE = "radar.config.yml";
const RADAR_DIR = "radar";

// Load and validate configuration
async function loadConfig(): Promise<RadarConfig> {
  const raw = await fs.readFile(CONFIG_FILE, "utf-8");
  const data = yaml.load(raw);
  return RadarConfigSchema.parse(data);
}

// Parse a single markdown file with Zod validation
async function parseBlipFile(filePath: string): Promise<BlipWithContent> {
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);

  // Validate front-matter with Zod
  const frontMatter = BlipFrontMatterSchema.parse(data);

  // Validate history consistency
  const consistency = validateHistoryConsistency(frontMatter);
  if (!consistency.valid) {
    console.warn(`⚠️  ${filePath}:`);
    consistency.errors.forEach((err) => console.warn(`   ${err}`));
  }

  const slug = slugify(frontMatter.name, { lower: true, strict: true });

  return {
    ...frontMatter,
    content: content.trim(),
    filePath,
    slug,
  };
}

// Parse all markdown files in radar directory
async function parseAllBlips(): Promise<BlipWithContent[]> {
  const files = await glob(`${RADAR_DIR}/**/*.md`);
  const blips: BlipWithContent[] = [];

  for (const file of files) {
    try {
      const blip = await parseBlipFile(file);
      blips.push(blip);
    } catch (error) {
      console.error(`❌ Error parsing ${file}:`, error);
      throw error;
    }
  }

  return blips;
}

// Convert blips to Zalando radar format
function blipsToZalandoEntries(
  blips: BlipWithContent[],
  config: RadarConfig
): ZalandoEntry[] {
  return blips.map((blip) => ({
    label: blip.name,
    quadrant: quadrantToIndex(blip.quadrant, config.quadrants),
    ring: ringToIndex(blip.ring),
    moved: statusToMovedFlag(blip.status),
  }));
}

// Extract recent changes for changelog
function extractRecentChanges(
  blips: BlipWithContent[],
  daysBack: number
): ChangeLogEntry[] {
  const cutoffDate = subDays(new Date(), daysBack);
  const changes: ChangeLogEntry[] = [];

  for (const blip of blips) {
    for (let i = 0; i < blip.history.length; i++) {
      const entry = blip.history[i];
      const entryDate = new Date(entry.date);

      if (isAfter(entryDate, cutoffDate)) {
        changes.push({
          blipName: blip.name,
          quadrant: blip.quadrant,
          date: entry.date,
          fromRing: i > 0 ? blip.history[i - 1].ring : undefined,
          toRing: entry.ring,
          note: entry.note,
          pr: entry.pr,
          slug: blip.slug,
        });
      }
    }
  }

  // Sort by date descending
  changes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return changes;
}

// Generate detail page for a single blip
function generateBlipDetailPage(
  blip: BlipWithContent,
  config: RadarConfig
): string {
  const htmlContent = marked.parse(blip.content);

  const linksHtml =
    blip.links.length > 0
      ? `
    <section class="links">
      <h2>Links</h2>
      <ul>
        ${blip.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.title}</a></li>`).join("\n        ")}
      </ul>
    </section>
  `
      : "";

  const historyHtml =
    blip.history.length > 0
      ? `
    <section class="history-timeline">
      <h2>History</h2>
      <ol class="timeline">
        ${blip.history
          .slice()
          .reverse()
          .map(
            (h) => `
        <li class="timeline-item">
          <span class="date">${format(new Date(h.date), "MMM d, yyyy")}</span>
          <span class="ring-badge ring-${h.ring.toLowerCase().replace(/\s+/g, "-")}">${h.ring}</span>
          <p>${h.note}</p>
          ${h.pr ? `<a href="${config.repo_url}/pull/${h.pr.replace("#", "")}" target="_blank" rel="noopener">${h.pr}</a>` : ""}
        </li>
        `
          )
          .join("\n        ")}
      </ol>
    </section>
  `
      : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${blip.name} · ${config.title}</title>
  <link rel="stylesheet" href="${config.base_path}styles.css"/>
</head>
<body class="container">
  <nav class="breadcrumb">
    <a href="${config.base_path}index.html">← Back to Radar</a>
  </nav>

  <header class="blip-header">
    <h1>${blip.name}</h1>
    <div class="blip-meta">
      <span class="badge quadrant-badge">${blip.quadrant}</span>
      <span class="badge ring-badge ring-${blip.ring.toLowerCase()}">${blip.ring}</span>
    </div>
    ${blip.summary ? `<p class="summary">${blip.summary}</p>` : ""}

    <div class="metadata">
      ${blip.tags.length > 0 ? `<p><strong>Tags:</strong> ${blip.tags.join(", ")}</p>` : ""}
      ${blip.owners.length > 0 ? `<p><strong>Owners:</strong> ${blip.owners.join(", ")}</p>` : ""}
      ${blip.since ? `<p><strong>Since:</strong> ${format(new Date(blip.since), "MMM yyyy")}</p>` : ""}
      ${blip.last_reviewed ? `<p><strong>Last Reviewed:</strong> ${format(new Date(blip.last_reviewed), "MMM d, yyyy")}</p>` : ""}
    </div>
  </header>

  ${linksHtml}

  <main class="blip-content">
    ${htmlContent}
  </main>

  ${historyHtml}
</body>
</html>`;
}

// Generate changelog page
function generateChangelogPage(
  changes: ChangeLogEntry[],
  config: RadarConfig
): string {
  const newEntries = changes.filter((c) => !c.fromRing);
  const movedIn = changes.filter((c) => c.fromRing && ringToIndex(c.toRing) < ringToIndex(c.fromRing));
  const movedOut = changes.filter((c) => c.fromRing && ringToIndex(c.toRing) > ringToIndex(c.fromRing));

  const renderChangeList = (items: ChangeLogEntry[], title: string) => {
    if (items.length === 0) return "";
    return `
    <section>
      <h2>${title}</h2>
      <ul class="changelog-list">
        ${items
          .map(
            (c) => `
        <li>
          <div class="changelog-item">
            <a href="${config.base_path}tech/${c.slug}/index.html"><strong>${c.blipName}</strong></a>
            <span class="badge">${c.quadrant}</span>
            ${c.fromRing ? `<span class="ring-transition">${c.fromRing} → ${c.toRing}</span>` : `<span class="ring-badge ring-${c.toRing.toLowerCase()}">${c.toRing}</span>`}
            <p>${c.note}</p>
            <span class="date">${format(new Date(c.date), "MMM d, yyyy")}</span>
            ${c.pr ? `<a href="${config.repo_url}/pull/${c.pr.replace("#", "")}">${c.pr}</a>` : ""}
          </div>
        </li>
        `
          )
          .join("\n        ")}
      </ul>
    </section>
    `;
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Changelog · ${config.title}</title>
  <link rel="stylesheet" href="${config.base_path}styles.css"/>
</head>
<body class="container">
  <nav class="breadcrumb">
    <a href="${config.base_path}index.html">← Back to Radar</a>
  </nav>

  <header>
    <h1>Changelog</h1>
    <p>Recent changes in the last ${config.changelog_days} days</p>
  </header>

  ${renderChangeList(newEntries, "🆕 New Entries")}
  ${renderChangeList(movedIn, "⬆️ Moved Closer to Adopt")}
  ${renderChangeList(movedOut, "⬇️ Moved Away from Adopt")}
</body>
</html>`;
}

// Generate main index page with Zalando radar
function generateIndexPage(
  blips: BlipWithContent[],
  config: RadarConfig,
  changeCount: number
): string {
  const blipsList = blips
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (b) => `
      <li>
        <a href="${config.base_path}tech/${b.slug}/index.html">${b.name}</a>
        <span class="small">${b.quadrant}</span>
      </li>
    `
    )
    .join("\n      ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${config.title}</title>
  <link rel="stylesheet" href="${config.base_path}styles.css"/>
</head>
<body>
  <header class="main-header">
    <h1>${config.title}</h1>
    <p>${config.description || ""}</p>
    ${changeCount > 0 ? `<p><a href="${config.base_path}changelog.html" class="changelog-link">📋 View Recent Changes (${changeCount})</a></p>` : ""}
  </header>

  <div id="wrap">
    <div id="radar-container">
      <svg id="radar"></svg>
    </div>
    <aside id="list">
      <h2>Technologies</h2>
      <ul>
        ${blipsList}
      </ul>
    </aside>
  </div>

  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="https://zalando.github.io/tech-radar/release/radar-0.12.js"></script>
  <script type="module">
    const response = await fetch("${config.base_path}data/entries.json");
    const { entries, config: radarConfig } = await response.json();

    const colors = {
      background: "#fff",
      grid: "#bbb",
      inactive: "#ddd"
    };

    radar_visualization({
      repo_url: radarConfig.repo_url,
      svg_id: "radar",
      width: 1200,
      height: 900,
      scale: 1.0,
      colors,
      title: radarConfig.title,
      quadrants: radarConfig.quadrants.map(name => ({ name })),
      rings: radarConfig.rings.map(name => ({
        name: name.toUpperCase(),
        color: radarConfig.colors[name] || "#ccc"
      })),
      print_layout: true,
      links_in_new_tabs: true,
      entries
    });
  </script>
</body>
</html>`;
}

// Generate CSS styles
function generateStyles(config: RadarConfig): string {
  return `/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fafafa;
}

/* Container */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* Main header */
.main-header {
  text-align: center;
  padding: 48px 24px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.main-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: #111;
}

.main-header p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 8px;
}

.changelog-link {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 16px;
  background: #007bff;
  color: white !important;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.changelog-link:hover {
  background: #0056b3;
}

/* Radar layout */
#wrap {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

#radar-container {
  display: flex;
  justify-content: center;
}

#list {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  max-height: 900px;
  overflow-y: auto;
}

#list h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #111;
}

#list ul {
  list-style: none;
}

#list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

#list li:last-child {
  border-bottom: none;
}

#list a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

#list a:hover {
  text-decoration: underline;
}

#list .small {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-top: 2px;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 24px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Blip detail page */
.blip-header {
  margin-bottom: 32px;
}

.blip-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: #111;
}

.blip-meta {
  margin-bottom: 16px;
}

.summary {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 16px;
  font-weight: 500;
}

.metadata {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.metadata p {
  margin: 4px 0;
  font-size: 0.95rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-right: 8px;
}

.quadrant-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.ring-badge {
  color: white;
}

.ring-badge.ring-adopt {
  background: ${config.colors.Adopt};
}

.ring-badge.ring-trial {
  background: ${config.colors.Trial};
}

.ring-badge.ring-assess {
  background: ${config.colors.Assess};
}

.ring-badge.ring-hold {
  background: ${config.colors.Hold};
}

/* Links section */
.links {
  margin: 32px 0;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 8px;
}

.links h2 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: #111;
}

.links ul {
  list-style: none;
}

.links li {
  margin: 8px 0;
}

.links a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.links a:hover {
  text-decoration: underline;
}

/* Main content */
.blip-content {
  margin: 32px 0;
}

.blip-content h2 {
  font-size: 1.75rem;
  margin: 32px 0 16px;
  color: #111;
}

.blip-content h3 {
  font-size: 1.35rem;
  margin: 24px 0 12px;
  color: #333;
}

.blip-content p {
  margin: 16px 0;
}

.blip-content ul,
.blip-content ol {
  margin: 16px 0;
  padding-left: 32px;
}

.blip-content li {
  margin: 8px 0;
}

.blip-content code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
}

.blip-content pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

.blip-content pre code {
  background: none;
  padding: 0;
}

/* History timeline */
.history-timeline {
  margin: 48px 0;
}

.history-timeline h2 {
  font-size: 1.75rem;
  margin-bottom: 24px;
  color: #111;
}

.timeline {
  list-style: none;
  border-left: 2px solid #ddd;
  padding-left: 0;
}

.timeline-item {
  position: relative;
  padding: 0 0 32px 32px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #007bff;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #007bff;
}

.timeline-item .date {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
  font-weight: 600;
}

.timeline-item p {
  margin: 8px 0;
  color: #333;
}

.timeline-item a {
  color: #007bff;
  text-decoration: none;
  font-size: 0.875rem;
}

.timeline-item a:hover {
  text-decoration: underline;
}

/* Changelog */
.changelog-list {
  list-style: none;
}

.changelog-item {
  background: white;
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.changelog-item strong {
  font-size: 1.1rem;
}

.changelog-item .ring-transition {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 0.875rem;
  margin: 0 8px;
  font-weight: 600;
}

.changelog-item .date {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 1024px) {
  #wrap {
    grid-template-columns: 1fr;
  }

  #list {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .blip-header h1 {
    font-size: 2rem;
  }

  .main-header h1 {
    font-size: 2rem;
  }
}
`;
}

// Main build function
async function build() {
  console.log("🚀 Building tech radar...\n");

  // Load configuration
  console.log("📋 Loading configuration...");
  const config = await loadConfig();
  console.log(`   Title: ${config.title}`);
  console.log(`   Quadrants: ${config.quadrants.join(", ")}`);
  console.log(`   Rings: ${config.rings.join(", ")}\n`);

  // Clean and create dist directory
  console.log("🧹 Cleaning dist directory...");
  await fs.emptyDir(DIST_DIR);
  await fs.ensureDir(`${DIST_DIR}/data`);
  await fs.ensureDir(`${DIST_DIR}/tech`);

  // Parse all blips
  console.log("📖 Parsing markdown files...");
  const blips = await parseAllBlips();
  console.log(`   Found ${blips.length} blips\n`);

  // Generate Zalando entries
  console.log("🎯 Generating radar data...");
  const zalandoEntries = blipsToZalandoEntries(blips, config);
  await fs.writeJson(
    `${DIST_DIR}/data/entries.json`,
    { entries: zalandoEntries, config },
    { spaces: 2 }
  );
  console.log(`   Wrote entries.json (${zalandoEntries.length} entries)\n`);

  // Generate detail pages
  console.log("📄 Generating detail pages...");
  for (const blip of blips) {
    const html = generateBlipDetailPage(blip, config);
    await fs.outputFile(`${DIST_DIR}/tech/${blip.slug}/index.html`, html);
  }
  console.log(`   Generated ${blips.length} detail pages\n`);

  // Generate changelog
  console.log("📊 Generating changelog...");
  const recentChanges = extractRecentChanges(blips, config.changelog_days);
  const changelogHtml = generateChangelogPage(recentChanges, config);
  await fs.outputFile(`${DIST_DIR}/changelog.html`, changelogHtml);
  console.log(`   Found ${recentChanges.length} recent changes\n`);

  // Generate index page
  console.log("🏠 Generating index page...");
  const indexHtml = generateIndexPage(blips, config, recentChanges.length);
  await fs.outputFile(`${DIST_DIR}/index.html`, indexHtml);

  // Generate CSS
  console.log("🎨 Generating styles...");
  const css = generateStyles(config);
  await fs.outputFile(`${DIST_DIR}/styles.css`, css);

  console.log("\n✅ Build complete! Output in dist/");
  console.log(`\n💡 Preview with: npm run preview`);
}

// Run build
build().catch((error) => {
  console.error("\n❌ Build failed:", error);
  process.exit(1);
});
