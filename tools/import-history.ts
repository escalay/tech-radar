#!/usr/bin/env tsx

import fs from "fs-extra";
import matter from "gray-matter";
import yaml from "js-yaml";
import { glob } from "glob";
import { parse } from "csv-parse/sync";
import { BlipFrontMatterSchema, Ring, HistoryEntrySchema } from "../src/schemas.js";

const RADAR_DIR = "radar";

interface CSVRow {
  name: string;
  date: string;
  ring: string;
  note: string;
  pr?: string;
}

// Find blip file by name
async function findBlipFile(name: string): Promise<string | null> {
  const files = await glob(`${RADAR_DIR}/**/*.md`);
  const normalizedSearch = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const { data } = matter(raw);

    try {
      const frontMatter = BlipFrontMatterSchema.parse(data);
      const normalizedName = frontMatter.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      if (normalizedName === normalizedSearch) {
        return file;
      }
    } catch {
      continue;
    }
  }

  return null;
}

// Parse CSV file
async function parseCSV(filePath: string): Promise<CSVRow[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records as CSVRow[];
}

// Main import flow
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("\n❌ Usage: npm run import-history <csv-file>\n");
    console.log("CSV format:");
    console.log("name,date,ring,note,pr");
    console.log('Kubernetes,2023-06-01,Assess,"Initial evaluation",#123');
    console.log('Kubernetes,2024-01-15,Trial,"Pilot successful",#456\n');
    process.exit(1);
  }

  const csvPath = args[0];

  if (!(await fs.pathExists(csvPath))) {
    console.log(`\n❌ File not found: ${csvPath}\n`);
    process.exit(1);
  }

  console.log(`\n📥 Importing history from ${csvPath}...\n`);

  const rows = await parseCSV(csvPath);
  console.log(`Found ${rows.length} history entries\n`);

  // Group by blip name
  const groupedByName = new Map<string, CSVRow[]>();
  for (const row of rows) {
    if (!groupedByName.has(row.name)) {
      groupedByName.set(row.name, []);
    }
    groupedByName.get(row.name)!.push(row);
  }

  let updatedCount = 0;
  let errorCount = 0;

  for (const [name, entries] of groupedByName.entries()) {
    console.log(`Processing ${name}...`);

    const filePath = await findBlipFile(name);

    if (!filePath) {
      console.log(`  ⚠️  Could not find blip "${name}" - skipping`);
      errorCount++;
      continue;
    }

    // Parse existing file
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontMatter = BlipFrontMatterSchema.parse(data);

    // Validate and add new history entries
    const newEntries = [];
    for (const entry of entries) {
      try {
        const historyEntry = HistoryEntrySchema.parse({
          date: entry.date,
          ring: entry.ring as Ring,
          note: entry.note,
          ...(entry.pr ? { pr: entry.pr.startsWith("#") ? entry.pr : `#${entry.pr}` } : {}),
        });

        // Check if entry already exists (by date)
        const exists = frontMatter.history.some((h) => h.date === historyEntry.date);
        if (!exists) {
          newEntries.push(historyEntry);
        }
      } catch (error: any) {
        console.log(`  ⚠️  Invalid entry for ${entry.date}: ${error.message}`);
        errorCount++;
      }
    }

    if (newEntries.length === 0) {
      console.log(`  ℹ️  No new entries to add`);
      continue;
    }

    // Merge and sort history by date
    const allHistory = [...frontMatter.history, ...newEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Update front-matter
    const updatedFrontMatter = {
      ...frontMatter,
      history: allHistory,
    };

    // Write back
    const newFrontMatterYaml = yaml.dump(updatedFrontMatter, { lineWidth: -1 });
    const newContent = `---\n${newFrontMatterYaml}---\n\n${content.trim()}\n`;
    await fs.writeFile(filePath, newContent);

    console.log(`  ✅ Added ${newEntries.length} history entries`);
    updatedCount++;
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Updated: ${updatedCount} blips`);
  if (errorCount > 0) {
    console.log(`   Errors: ${errorCount}`);
  }
  console.log("\n📝 Next steps:");
  console.log(`   1. Review updated files`);
  console.log(`   2. Run 'npm run build' to test`);
  console.log(`   3. Create a PR when ready`);
  console.log("");
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
