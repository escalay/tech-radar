#!/usr/bin/env tsx

import fs from "fs-extra";
import matter from "gray-matter";
import yaml from "js-yaml";
import { glob } from "glob";
import { input, select, confirm } from "@inquirer/prompts";
import { format } from "date-fns";
import {
  BlipFrontMatterSchema,
  Ring,
  Status,
  ringToIndex,
  RadarConfigSchema,
} from "../src/schemas.js";

const CONFIG_FILE = "radar.config.yml";
const RADAR_DIR = "radar";

// Load configuration
async function loadConfig() {
  const raw = await fs.readFile(CONFIG_FILE, "utf-8");
  const data = yaml.load(raw);
  return RadarConfigSchema.parse(data);
}

// Find blip file by name or slug
async function findBlipFile(nameOrSlug: string): Promise<string | null> {
  const files = await glob(`${RADAR_DIR}/**/*.md`);

  const normalizedSearch = nameOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const { data } = matter(raw);

    // Try to parse (might be invalid)
    try {
      const frontMatter = BlipFrontMatterSchema.parse(data);
      const normalizedName = frontMatter.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      if (normalizedName === normalizedSearch) {
        return file;
      }
    } catch {
      // Skip invalid files
      continue;
    }
  }

  return null;
}

// Auto-detect status based on ring change
function detectStatus(currentRing: Ring, newRing: Ring): Status {
  if (currentRing === newRing) return "No Change";

  const currentIndex = ringToIndex(currentRing);
  const newIndex = ringToIndex(newRing);

  return newIndex < currentIndex ? "Moved In" : "Moved Out";
}

// Main interactive flow
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("\n❌ Usage: npm run update-status <blip-name-or-slug>\n");
    console.log("Example: npm run update-status kubernetes");
    console.log("Example: npm run update-status \"trunk based development\"\n");
    process.exit(1);
  }

  const searchTerm = args.join(" ");
  console.log(`\n🔍 Searching for "${searchTerm}"...\n`);

  const filePath = await findBlipFile(searchTerm);

  if (!filePath) {
    console.log(`❌ Could not find blip matching "${searchTerm}"\n`);
    process.exit(1);
  }

  // Parse existing file
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontMatter = BlipFrontMatterSchema.parse(data);

  console.log(`✅ Found: ${frontMatter.name}`);
  console.log(`   Current ring: ${frontMatter.ring}`);
  console.log(`   Current status: ${frontMatter.status}\n`);

  const config = await loadConfig();

  // Prompt for new ring
  const newRing = (await select({
    message: "Select new ring:",
    choices: config.rings.map((r) => ({
      name: r === frontMatter.ring ? `${r} (current)` : r,
      value: r as Ring,
    })),
    default: frontMatter.ring,
  })) as Ring;

  if (newRing === frontMatter.ring) {
    const confirmNoChange = await confirm({
      message: "Ring unchanged. Continue anyway to update last_reviewed date?",
      default: false,
    });

    if (!confirmNoChange) {
      console.log("\n❌ Cancelled\n");
      process.exit(0);
    }
  }

  // Auto-detect status
  const autoStatus = detectStatus(frontMatter.ring, newRing);
  console.log(`\n💡 Auto-detected status: ${autoStatus}\n`);

  const note = await input({
    message: "Reason for change:",
    required: true,
    validate: (value) => (value.length > 0 ? true : "Reason is required"),
  });

  const pr = await input({
    message: "PR number (e.g., #123, leave empty if none):",
    validate: (value) => {
      if (!value) return true;
      return value.match(/^#?\d+$/) ? true : "Must be in format #123 or 123";
    },
  });

  const reviewedBy = await input({
    message: "Reviewed by (optional, e.g., @username):",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  // Update front-matter
  const updatedFrontMatter = {
    ...frontMatter,
    ring: newRing,
    status: autoStatus,
    last_reviewed: today,
    history: [
      ...frontMatter.history,
      {
        date: today,
        ring: newRing,
        note: `${note}${reviewedBy ? ` (reviewed by ${reviewedBy})` : ""}`,
        ...(pr ? { pr: pr.startsWith("#") ? pr : `#${pr}` } : {}),
      },
    ],
  };

  // Reconstruct file
  const newFrontMatterYaml = yaml.dump(updatedFrontMatter, { lineWidth: -1 });
  const newContent = `---\n${newFrontMatterYaml}---\n\n${content.trim()}\n`;

  // Write back to file
  await fs.writeFile(filePath, newContent);

  console.log(`\n✅ Updated: ${filePath}`);
  console.log(`   Ring: ${frontMatter.ring} → ${newRing}`);
  console.log(`   Status: ${autoStatus}`);
  console.log(`   History entry added with date ${today}`);
  console.log("\n📝 Next steps:");
  console.log(`   1. Review changes in ${filePath}`);
  console.log(`   2. Run 'npm run build' to test`);
  console.log(`   3. Create a PR when ready`);
  console.log("");
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
