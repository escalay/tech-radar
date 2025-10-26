#!/usr/bin/env tsx

import fs from "fs-extra";
import { glob } from "glob";
import matter from "gray-matter";
import yaml from "js-yaml";
import {
  BlipFrontMatterSchema,
  RadarConfigSchema,
  validateHistoryConsistency,
} from "../src/schemas.js";

const CONFIG_FILE = "radar.config.yml";
const RADAR_DIR = "radar";

async function validateConfig() {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    const data = yaml.load(raw);
    RadarConfigSchema.parse(data);
    console.log("✅ Configuration valid");
    return true;
  } catch (error: any) {
    console.error("❌ Configuration validation failed:");
    console.error(error.message);
    return false;
  }
}

async function validateBlips() {
  const files = await glob(`${RADAR_DIR}/**/*.md`);
  let validCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      const { data } = matter(raw);

      // Validate with Zod
      const frontMatter = BlipFrontMatterSchema.parse(data);

      // Check history consistency
      const consistency = validateHistoryConsistency(frontMatter);
      if (!consistency.valid) {
        console.warn(`⚠️  ${file}:`);
        consistency.errors.forEach((err) => console.warn(`   ${err}`));
        warningCount++;
      } else {
        validCount++;
      }
    } catch (error: any) {
      console.error(`❌ ${file}:`);
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          console.error(`   ${err.path.join(".")}: ${err.message}`);
        });
      } else {
        console.error(`   ${error.message}`);
      }
      errorCount++;
    }
  }

  console.log(`\n📊 Validation Summary:`);
  console.log(`   Valid: ${validCount}`);
  console.log(`   Warnings: ${warningCount}`);
  console.log(`   Errors: ${errorCount}`);

  return errorCount === 0;
}

async function main() {
  console.log("🔍 Validating Tech Radar...\n");

  const configValid = await validateConfig();
  const blipsValid = await validateBlips();

  if (configValid && blipsValid) {
    console.log("\n✅ All validations passed!");
    process.exit(0);
  } else {
    console.log("\n❌ Validation failed");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Validation error:", error.message);
  process.exit(1);
});
