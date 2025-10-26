#!/usr/bin/env tsx

import fs from "fs-extra";
import yaml from "js-yaml";
import slugify from "slugify";
import { input, select, confirm } from "@inquirer/prompts";
import { format } from "date-fns";
import { RadarConfigSchema, Ring, Quadrant, Status } from "../src/schemas.js";

const CONFIG_FILE = "radar.config.yml";

// Load configuration
async function loadConfig() {
  const raw = await fs.readFile(CONFIG_FILE, "utf-8");
  const data = yaml.load(raw);
  return RadarConfigSchema.parse(data);
}

// Generate front-matter
function generateFrontMatter(data: {
  name: string;
  quadrant: Quadrant;
  ring: Ring;
  status: Status;
  summary: string;
  tags: string[];
  owners: string[];
  links: Array<{ title: string; url: string }>;
  since: string;
}): string {
  const frontMatter: Record<string, any> = {
    name: data.name,
    quadrant: data.quadrant,
    ring: data.ring,
    status: data.status,
  };

  if (data.summary) frontMatter.summary = data.summary;
  if (data.tags.length > 0) frontMatter.tags = data.tags;
  if (data.owners.length > 0) frontMatter.owners = data.owners;
  if (data.since) frontMatter.since = data.since;
  frontMatter.last_reviewed = data.since;

  if (data.links.length > 0) frontMatter.links = data.links;

  // Add initial history entry
  frontMatter.history = [
    {
      date: data.since,
      ring: data.ring,
      note: `Initial entry at ${data.ring}`,
    },
  ];

  return yaml.dump(frontMatter, { lineWidth: -1 });
}

// Generate markdown template
function generateMarkdownTemplate(name: string): string {
  return `## Overview

Brief description of ${name} and what problem it solves.

## Why This Matters

Explain the strategic importance and benefits.

## When to Use

Guidelines for when this technology is appropriate.

## When Not to Use

Scenarios where alternatives might be better.

## Trade-offs & Considerations

Key trade-offs, limitations, or challenges to be aware of.

## Getting Started

Links to documentation, tutorials, or internal resources.

## Related Technologies

Other entries in the radar that relate to this one.
`;
}

// Main interactive flow
async function main() {
  console.log("\n🎯 Create a New Tech Radar Blip\n");

  const config = await loadConfig();

  // Collect blip information
  const name = await input({
    message: "Blip name:",
    required: true,
    validate: (value) => (value.length > 0 ? true : "Name is required"),
  });

  const quadrant = (await select({
    message: "Select quadrant:",
    choices: config.quadrants.map((q) => ({ name: q, value: q as Quadrant })),
  })) as Quadrant;

  const ring = (await select({
    message: "Select ring:",
    choices: config.rings.map((r) => ({ name: r, value: r as Ring })),
  })) as Ring;

  const status: Status = "New";

  const summary = await input({
    message: "One-line summary:",
  });

  const tagsInput = await input({
    message: "Tags (comma-separated):",
  });
  const tags = tagsInput
    ? tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  const ownersInput = await input({
    message: "Owners (comma-separated, e.g., @username, @team/name):",
  });
  const owners = ownersInput
    ? ownersInput
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o.length > 0)
    : [];

  const links: Array<{ title: string; url: string }> = [];
  const addLinks = await confirm({
    message: "Add external links?",
    default: false,
  });

  if (addLinks) {
    let addMore = true;
    while (addMore) {
      const linkTitle = await input({
        message: "Link title:",
        required: true,
      });

      const linkUrl = await input({
        message: "Link URL:",
        required: true,
        validate: (value) => {
          try {
            new URL(value);
            return true;
          } catch {
            return "Must be a valid URL";
          }
        },
      });

      links.push({ title: linkTitle, url: linkUrl });

      addMore = await confirm({
        message: "Add another link?",
        default: false,
      });
    }
  }

  const since = format(new Date(), "yyyy-MM-dd");

  // Generate file path and content
  const slug = slugify(name, { lower: true, strict: true });
  const quadrantFolder = slugify(quadrant, { lower: true, strict: true });
  const filePath = `radar/${quadrantFolder}/${slug}.md`;

  // Check if file already exists
  if (await fs.pathExists(filePath)) {
    console.log(`\n❌ File already exists: ${filePath}`);
    process.exit(1);
  }

  const frontMatter = generateFrontMatter({
    name,
    quadrant,
    ring,
    status,
    summary,
    tags,
    owners,
    links,
    since,
  });

  const template = generateMarkdownTemplate(name);
  const content = `---\n${frontMatter}---\n\n${template}`;

  // Write file
  await fs.ensureDir(`radar/${quadrantFolder}`);
  await fs.writeFile(filePath, content);

  console.log(`\n✅ Created: ${filePath}`);
  console.log("\n📝 Next steps:");
  console.log(`   1. Edit ${filePath} to add detailed content`);
  console.log(`   2. Run 'npm run build' to test`);
  console.log(`   3. Create a PR when ready`);
  console.log("");
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
